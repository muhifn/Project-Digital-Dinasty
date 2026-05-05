package main

import (
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	if len(os.Args) < 2 {
		fmt.Println("Usage: go run ./cmd/migrate [up|down]")
		os.Exit(1)
	}

	direction := os.Args[1]

	m, err := migrate.New("file://migrations", dbURL)
	if err != nil {
		log.Fatalf("Failed to create migrate instance: %v", err)
	}
	defer m.Close()

	switch direction {
	case "up":
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatalf("Migration up failed: %v", err)
		}
		fmt.Println("Migrations applied successfully")
	case "down":
		if err := m.Steps(-1); err != nil {
			log.Fatalf("Migration down failed: %v", err)
		}
		fmt.Println("Rolled back one migration")
	case "force":
		// Force sets the version without running the migration.
		// Useful to fix a "dirty" migration state.
		if len(os.Args) < 3 {
			log.Fatal("Usage: go run ./cmd/migrate force <version>")
		}
		var version int
		if _, err := fmt.Sscanf(os.Args[2], "%d", &version); err != nil {
			log.Fatalf("Invalid version: %v", err)
		}
		if err := m.Force(version); err != nil {
			log.Fatalf("Force failed: %v", err)
		}
		fmt.Printf("Forced migration version to %d\n", version)
	case "drop":
		// Drop everything (DANGEROUS — use only in dev)
		if err := m.Drop(); err != nil {
			log.Fatalf("Drop failed: %v", err)
		}
		fmt.Println("Dropped all tables")
	default:
		fmt.Println("Usage: go run ./cmd/migrate [up|down|force <version>|drop]")
		os.Exit(1)
	}
}
