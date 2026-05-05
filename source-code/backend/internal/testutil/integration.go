package testutil

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"

	"github.com/muhifn/rdp-api/internal/config"
	"github.com/muhifn/rdp-api/internal/database"
	"github.com/muhifn/rdp-api/internal/handler"
	"github.com/muhifn/rdp-api/internal/repository"
	"github.com/muhifn/rdp-api/internal/service"
)

// SeedData contains deterministic IDs/slugs seeded into the integration schema.
type SeedData struct {
	AdminID               string
	AdminEmail            string
	AdminPassword         string
	CategoryID            string
	CategoryName          string
	CategorySlug          string
	SecondaryCategoryID   string
	SecondaryCategoryName string
	SecondaryCategorySlug string
	ProductID             string
	ProductName           string
	ProductSlug           string
}

// IntegrationEnv contains a fully wired API server and isolated schema.
type IntegrationEnv struct {
	Schema   string
	DB       *sqlx.DB
	Server   *httptest.Server
	Config   *config.Config
	Services *service.Services
	Repos    *repository.Repositories
	Seed     SeedData
}

// NewIntegrationEnv provisions an isolated PostgreSQL schema, applies migrations,
// seeds baseline data, and starts a real httptest server with all handlers wired.
func NewIntegrationEnv(t *testing.T) *IntegrationEnv {
	t.Helper()

	dbURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if dbURL == "" {
		t.Skip("DATABASE_URL is required for integration tests")
	}

	schema := randomSchemaName()
	baseDB, err := database.Connect(dbURL)
	if err != nil {
		t.Fatalf("connect base database: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	if _, err := baseDB.ExecContext(ctx, fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s", quoteIdentifier(schema))); err != nil {
		_ = baseDB.Close()
		t.Fatalf("create schema %s: %v", schema, err)
	}

	testDB, effectiveDBURL, err := connectWithSchema(dbURL, schema)
	if err != nil {
		_, _ = baseDB.ExecContext(ctx, fmt.Sprintf("DROP SCHEMA IF EXISTS %s CASCADE", quoteIdentifier(schema)))
		_ = baseDB.Close()
		t.Fatalf("connect schema database: %v", err)
	}

	if err := applyMigration(testDB); err != nil {
		_ = testDB.Close()
		_, _ = baseDB.ExecContext(ctx, fmt.Sprintf("DROP SCHEMA IF EXISTS %s CASCADE", quoteIdentifier(schema)))
		_ = baseDB.Close()
		t.Fatalf("apply migration: %v", err)
	}

	seed, err := seedBaselineData(testDB)
	if err != nil {
		_ = testDB.Close()
		_, _ = baseDB.ExecContext(ctx, fmt.Sprintf("DROP SCHEMA IF EXISTS %s CASCADE", quoteIdentifier(schema)))
		_ = baseDB.Close()
		t.Fatalf("seed baseline data: %v", err)
	}

	cfg := &config.Config{
		Port:        "0",
		DatabaseURL: effectiveDBURL,
		JWTSecret:   envOrDefault("JWT_SECRET", "integration-test-secret-minimum-32-characters"),
		CORSOrigins: []string{"http://localhost:3000"},
	}

	repos := repository.NewRepositories(testDB)
	svcs := service.NewServices(repos, cfg)
	router := handler.NewRouter(svcs, cfg)
	server := httptest.NewServer(router)

	env := &IntegrationEnv{
		Schema:   schema,
		DB:       testDB,
		Server:   server,
		Config:   cfg,
		Services: svcs,
		Repos:    repos,
		Seed:     seed,
	}

	t.Cleanup(func() {
		server.Close()
		svcs.Stock.Shutdown()
		_ = testDB.Close()

		dropCtx, dropCancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer dropCancel()
		_, _ = baseDB.ExecContext(dropCtx, fmt.Sprintf("DROP SCHEMA IF EXISTS %s CASCADE", quoteIdentifier(schema)))
		_ = baseDB.Close()
	})

	return env
}

func applyMigration(db *sqlx.DB) error {
	migrationPath, err := migrationFilePath()
	if err != nil {
		return err
	}

	sqlBytes, err := os.ReadFile(migrationPath)
	if err != nil {
		return fmt.Errorf("read migration file: %w", err)
	}

	// Keep migration isolated from public schema by removing destructive drops.
	migrationSQL := sanitizeMigrationSQL(string(sqlBytes))

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if _, err := db.ExecContext(ctx, migrationSQL); err != nil {
		return fmt.Errorf("execute migration SQL: %w", err)
	}

	return nil
}

func seedBaselineData(db *sqlx.DB) (SeedData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	seed := SeedData{
		AdminEmail:            "admin@planetmotorbmw.com",
		AdminPassword:         "test-admin-password",
		CategoryName:          "Rak Spare Part",
		CategorySlug:          "rak-spare-part",
		SecondaryCategoryName: "Rak Lampu",
		SecondaryCategorySlug: "rak-lampu",
		ProductName:           "Towing hinge new ori BMW F30 & F48",
		ProductSlug:           "towing-hinge-new-ori-bmw-f30-f48",
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(seed.AdminPassword), 12)
	if err != nil {
		return SeedData{}, fmt.Errorf("hash admin password: %w", err)
	}

	err = db.GetContext(ctx, &seed.AdminID, `
		INSERT INTO admins (email, password_hash, name)
		VALUES ($1, $2, $3)
		RETURNING id
	`, seed.AdminEmail, string(hash), "Integration Admin")
	if err != nil {
		return SeedData{}, fmt.Errorf("insert admin: %w", err)
	}

	err = db.GetContext(ctx, &seed.CategoryID, `
		INSERT INTO categories (name, slug, description, image_url)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, seed.CategoryName, seed.CategorySlug, "Kategori spare part untuk integration test", "")
	if err != nil {
		return SeedData{}, fmt.Errorf("insert category utama: %w", err)
	}

	err = db.GetContext(ctx, &seed.SecondaryCategoryID, `
		INSERT INTO categories (name, slug, description, image_url)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, seed.SecondaryCategoryName, seed.SecondaryCategorySlug, "Kategori lampu untuk integration test", "")
	if err != nil {
		return SeedData{}, fmt.Errorf("insert category sekunder: %w", err)
	}

	err = db.GetContext(ctx, &seed.ProductID, `
		INSERT INTO products (
			name, slug, description, price, stock, unit, image_url,
			is_active, status, low_stock_threshold, category_id
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'AVAILABLE'::product_status, $8, $9)
		RETURNING id
	`, seed.ProductName, seed.ProductSlug, "Produk spare part BMW untuk integration test", "425000.00", 30, "pcs", "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/19/de84bbf0-4ef7-4b01-9c92-25ef4d644fbf.jpg", 3, seed.CategoryID)
	if err != nil {
		return SeedData{}, fmt.Errorf("insert product: %w", err)
	}

	if _, err := db.ExecContext(ctx, `
		INSERT INTO stock_logs (product_id, quantity_change, stock_before, stock_after, type, reference)
		VALUES ($1, $2, $3, $4, 'IN'::stock_change_type, $5)
	`, seed.ProductID, 30, 0, 30, "Initial stock (integration)"); err != nil {
		return SeedData{}, fmt.Errorf("insert stock log: %w", err)
	}

	if _, err := db.ExecContext(ctx, `
		INSERT INTO store_settings (key, value)
		VALUES
			('store_name', 'Planet Motor BMW Integration')
	`); err != nil {
		return SeedData{}, fmt.Errorf("insert store settings: %w", err)
	}

	return seed, nil
}

func connectWithSchema(databaseURL, schema string) (*sqlx.DB, string, error) {
	searchPath := fmt.Sprintf("%s,public,extensions", schema)
	searchPathOption := fmt.Sprintf("-csearch_path=%s", searchPath)

	candidates := []string{
		withURLParam(databaseURL, "search_path", searchPath),
		withURLParam(databaseURL, "options", searchPathOption),
	}

	var lastErr error
	for _, candidate := range candidates {
		db, err := database.Connect(candidate)
		if err != nil {
			lastErr = err
			continue
		}

		var searchPath string
		if err := db.Get(&searchPath, "SHOW search_path"); err != nil {
			lastErr = err
			_ = db.Close()
			continue
		}

		if isSearchPathPreferred(searchPath, schema) {
			return db, candidate, nil
		}

		_ = db.Close()
		lastErr = fmt.Errorf("candidate did not apply schema search_path: %s", searchPath)
	}

	// Fallback for hosted poolers (e.g. Supabase transaction pooler):
	// keep a single connection and set search_path at session level.
	db, err := database.Connect(databaseURL)
	if err == nil {
		db.SetMaxOpenConns(1)
		db.SetMaxIdleConns(1)
		db.SetConnMaxLifetime(0)
		db.SetConnMaxIdleTime(0)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if _, execErr := db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %s, public, extensions", quoteIdentifier(schema))); execErr == nil {
			var searchPath string
			if getErr := db.GetContext(ctx, &searchPath, "SHOW search_path"); getErr == nil && isSearchPathPreferred(searchPath, schema) {
				return db, databaseURL, nil
			}
			lastErr = fmt.Errorf("fallback session search_path not applied")
		} else {
			lastErr = execErr
		}

		_ = db.Close()
	}

	if lastErr == nil {
		lastErr = fmt.Errorf("unable to configure schema search_path")
	}

	return nil, "", lastErr
}

func migrationFilePath() (string, error) {
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		return "", fmt.Errorf("resolve caller path")
	}

	root := filepath.Clean(filepath.Join(filepath.Dir(file), "..", ".."))
	path := filepath.Join(root, "migrations", "000001_initial_schema.up.sql")
	return path, nil
}

func withURLParam(raw, key, value string) string {
	u, err := url.Parse(raw)
	if err != nil {
		return raw
	}

	q := u.Query()
	q.Set(key, value)
	u.RawQuery = q.Encode()
	return u.String()
}

func randomSchemaName() string {
	buf := make([]byte, 4)
	_, _ = rand.Read(buf)
	return fmt.Sprintf("it_%d_%s", time.Now().UnixNano(), hex.EncodeToString(buf))
}

func sanitizeMigrationSQL(sqlText string) string {
	lines := strings.Split(sqlText, "\n")
	out := make([]string, 0, len(lines))

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		upper := strings.ToUpper(trimmed)

		skip := strings.HasPrefix(upper, "DROP TABLE IF EXISTS") ||
			strings.HasPrefix(upper, "DROP TYPE IF EXISTS")
		if skip {
			continue
		}

		out = append(out, line)
	}

	return strings.Join(out, "\n")
}

func isSearchPathPreferred(searchPath, schema string) bool {
	parts := strings.Split(searchPath, ",")
	if len(parts) == 0 {
		return false
	}
	value := strings.TrimSpace(parts[0])
	value = strings.Trim(value, `"`)
	return value == schema
}

func quoteIdentifier(name string) string {
	return `"` + strings.ReplaceAll(name, `"`, `""`) + `"`
}

func envOrDefault(key, fallback string) string {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	return v
}
