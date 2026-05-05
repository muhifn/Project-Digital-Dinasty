package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/muhifn/rdp-api/internal/model"
)

type ProductRepo struct {
	db *sqlx.DB
}

func NewProductRepo(db *sqlx.DB) *ProductRepo {
	return &ProductRepo{db: db}
}

// List returns products matching the given filters.
func (r *ProductRepo) List(ctx context.Context, params model.ProductListParams) ([]model.Product, error) {
	var products []model.Product

	// Build dynamic WHERE clauses
	conditions := []string{"p.is_active = true", "p.deleted_at IS NULL"}
	args := []interface{}{}
	argIdx := 1

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(p.name ILIKE '%%' || $%d || '%%' OR p.description ILIKE '%%' || $%d || '%%')", argIdx, argIdx))
		args = append(args, params.Search)
		argIdx++
	}

	if params.Category != "" {
		conditions = append(conditions, fmt.Sprintf("c.slug = $%d", argIdx))
		args = append(args, params.Category)
		argIdx++
	}

	if params.Exclude != "" {
		conditions = append(conditions, fmt.Sprintf("p.id != $%d", argIdx))
		args = append(args, params.Exclude)
		argIdx++
	}

	if params.Featured {
		conditions = append(conditions, "p.stock > 0")
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	// Build ORDER BY
	orderBy := "p.created_at DESC"
	switch params.Sort {
	case "price_asc":
		orderBy = "p.price ASC"
	case "price_desc":
		orderBy = "p.price DESC"
	case "name_asc":
		orderBy = "p.name ASC"
	case "name_desc":
		orderBy = "p.name DESC"
	case "newest":
		orderBy = "p.created_at DESC"
	}

	// Build LIMIT
	limitClause := ""
	if params.Limit > 0 {
		limitClause = fmt.Sprintf("LIMIT $%d", argIdx)
		args = append(args, params.Limit)
	}

	query := fmt.Sprintf(`
		SELECT p.id, p.name, p.slug, p.description, p.price, p.stock, p.unit,
		       p.image_url, p.is_active, p.status, p.low_stock_threshold,
		       p.stock_updated_at, p.created_at, p.updated_at, p.category_id,
		       c.name AS category_name, c.slug AS category_slug
		FROM products p
		JOIN categories c ON c.id = p.category_id
		%s
		ORDER BY %s
		%s
	`, whereClause, orderBy, limitClause)

	err := r.db.SelectContext(ctx, &products, query, args...)
	return products, err
}

// FindBySlug returns a single product by slug with its category.
func (r *ProductRepo) FindBySlug(ctx context.Context, slug string) (*model.Product, error) {
	var prod model.Product
	err := r.db.GetContext(ctx, &prod, `
		SELECT p.id, p.name, p.slug, p.description, p.price, p.stock, p.unit,
		       p.image_url, p.is_active, p.status, p.low_stock_threshold,
		       p.stock_updated_at, p.created_at, p.updated_at, p.category_id,
		       c.name AS category_name, c.slug AS category_slug
		FROM products p
		JOIN categories c ON c.id = p.category_id
		WHERE p.slug = $1 AND p.is_active = true AND p.deleted_at IS NULL
	`, slug)
	if err != nil {
		return nil, err
	}
	return &prod, nil
}

// FindByID returns a single product by ID (for admin — includes inactive/deleted).
func (r *ProductRepo) FindByID(ctx context.Context, id string) (*model.Product, error) {
	var prod model.Product
	err := r.db.GetContext(ctx, &prod, `
		SELECT p.id, p.name, p.slug, p.description, p.price, p.stock, p.unit,
		       p.image_url, p.is_active, p.status, p.low_stock_threshold,
		       p.stock_updated_at, p.created_at, p.updated_at, p.category_id, p.deleted_at,
		       c.name AS category_name, c.slug AS category_slug
		FROM products p
		JOIN categories c ON c.id = p.category_id
		WHERE p.id = $1 AND p.deleted_at IS NULL
	`, id)
	if err != nil {
		return nil, err
	}
	return &prod, nil
}

// FindByIDTx returns a product by ID using the provided transaction.
func (r *ProductRepo) FindByIDTx(ctx context.Context, tx *sqlx.Tx, id string) (*model.Product, error) {
	var prod model.Product
	err := tx.GetContext(ctx, &prod, `
		SELECT p.id, p.name, p.slug, p.description, p.price, p.stock, p.unit,
		       p.image_url, p.is_active, p.status, p.low_stock_threshold,
		       p.stock_updated_at, p.created_at, p.updated_at, p.category_id, p.deleted_at,
		       c.name AS category_name, c.slug AS category_slug
		FROM products p
		JOIN categories c ON c.id = p.category_id
		WHERE p.id = $1 AND p.deleted_at IS NULL
	`, id)
	if err != nil {
		return nil, err
	}
	return &prod, nil
}

// AdminList returns products for admin with filters.
func (r *ProductRepo) AdminList(ctx context.Context, params model.AdminProductListParams) ([]model.Product, error) {
	var products []model.Product

	conditions := []string{"p.deleted_at IS NULL"}
	args := []interface{}{}
	argIdx := 1

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(p.name ILIKE '%%' || $%d || '%%' OR p.description ILIKE '%%' || $%d || '%%')", argIdx, argIdx))
		args = append(args, params.Search)
		argIdx++
	}

	if params.Category != "" {
		conditions = append(conditions, fmt.Sprintf("c.slug = $%d", argIdx))
		args = append(args, params.Category)
		argIdx++
	}

	if params.Status != "" {
		conditions = append(conditions, fmt.Sprintf("p.status = $%d::product_status", argIdx))
		args = append(args, params.Status)
		argIdx++
	}

	if params.Activity == "active" {
		conditions = append(conditions, "p.is_active = true")
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT p.id, p.name, p.slug, p.description, p.price, p.stock, p.unit,
		       p.image_url, p.is_active, p.status, p.low_stock_threshold,
		       p.stock_updated_at, p.created_at, p.updated_at, p.category_id, p.deleted_at,
		       c.name AS category_name, c.slug AS category_slug
		FROM products p
		JOIN categories c ON c.id = p.category_id
		%s
		ORDER BY p.created_at DESC
	`, whereClause)

	err := r.db.SelectContext(ctx, &products, query, args...)
	return products, err
}

// Create inserts a new product and returns it.
func (r *ProductRepo) Create(ctx context.Context, tx *sqlx.Tx, prod *model.Product) error {
	return tx.GetContext(ctx, prod, `
		INSERT INTO products (name, slug, description, price, stock, unit, image_url,
		                      is_active, status, low_stock_threshold, category_id)
		VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, ''), $8, $9::product_status, $10, $11)
		RETURNING id, name, slug, description, price, stock, unit, image_url,
		          is_active, status, low_stock_threshold, stock_updated_at,
		          created_at, updated_at, category_id
	`, prod.Name, prod.Slug, prod.Description, prod.Price, prod.Stock, prod.Unit,
		nilString(prod.ImageURL), prod.IsActive, prod.Status, prod.LowStockThreshold, prod.CategoryID)
}

// UpdateWithLock performs a SELECT FOR UPDATE then updates the product.
func (r *ProductRepo) UpdateWithLock(ctx context.Context, tx *sqlx.Tx, id string, prod *model.Product) error {
	// Lock the row
	var existing model.Product
	err := tx.GetContext(ctx, &existing, `
		SELECT id, is_active, deleted_at FROM products WHERE id = $1 FOR UPDATE
	`, id)
	if err != nil {
		return fmt.Errorf("product not found: %w", err)
	}
	if existing.DeletedAt != nil {
		return fmt.Errorf("cannot update deleted product")
	}

	return tx.GetContext(ctx, prod, `
		UPDATE products
		SET name = $2, slug = $3, description = $4, price = $5, stock = $6, unit = $7,
		    image_url = NULLIF($8, ''), status = $9::product_status,
		    low_stock_threshold = $10, category_id = $11,
		    stock_updated_at = CASE WHEN stock != $6 THEN NOW() ELSE stock_updated_at END,
		    updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, slug, description, price, stock, unit, image_url,
		          is_active, status, low_stock_threshold, stock_updated_at,
		          created_at, updated_at, category_id, deleted_at
	`, id, prod.Name, prod.Slug, prod.Description, prod.Price, prod.Stock, prod.Unit,
		nilString(prod.ImageURL), prod.Status, prod.LowStockThreshold, prod.CategoryID)
}

// DeletePermanent removes a product and its stock audit rows.
func (r *ProductRepo) DeletePermanent(ctx context.Context, id string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var existingID string
	if err := tx.GetContext(ctx, &existingID, `
		SELECT id FROM products WHERE id = $1 FOR UPDATE
	`, id); err != nil {
		return fmt.Errorf("product not found: %w", err)
	}

	if _, err := tx.ExecContext(ctx, `DELETE FROM stock_logs WHERE product_id = $1`, id); err != nil {
		return err
	}

	result, err := tx.ExecContext(ctx, `DELETE FROM products WHERE id = $1`, id)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("product not found")
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

// GetStockSnapshot returns current stock for all active products.
func (r *ProductRepo) GetStockSnapshot(ctx context.Context) ([]model.StockUpdate, error) {
	var updates []model.StockUpdate
	err := r.db.SelectContext(ctx, &updates, `
		SELECT id AS product_id, stock, status, stock_updated_at
		FROM products
		WHERE is_active = true AND deleted_at IS NULL
	`)
	return updates, err
}

// DB returns the underlying database connection for transaction use.
func (r *ProductRepo) DB() *sqlx.DB {
	return r.db
}

func nilString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
