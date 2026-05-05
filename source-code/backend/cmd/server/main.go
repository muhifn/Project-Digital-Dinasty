package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/muhifn/rdp-api/internal/config"
	"github.com/muhifn/rdp-api/internal/database"
	"github.com/muhifn/rdp-api/internal/handler"
	"github.com/muhifn/rdp-api/internal/repository"
	"github.com/muhifn/rdp-api/internal/service"
)

func main() {
	// Load .env file (ignore error if not present — production uses real env vars)
	_ = godotenv.Load()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Connect to database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Connected to database")

	// Initialize repositories
	repos := repository.NewRepositories(db)

	// Initialize services
	svcs := service.NewServices(repos, cfg)

	// Initialize HTTP handlers and router
	router := handler.NewRouter(svcs, cfg)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 0, // Disabled for SSE (long-lived connections)
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown channel
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Start server in goroutine
	go func() {
		log.Printf("Planet Motor BMW API starting on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Wait for shutdown signal
	sig := <-quit
	log.Printf("Received signal %s, shutting down...", sig)

	// Give active connections 10 seconds to finish
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	// Close SSE broker
	svcs.Stock.Shutdown()

	fmt.Println("Server stopped gracefully")
}
