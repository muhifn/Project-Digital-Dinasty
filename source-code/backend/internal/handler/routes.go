package handler

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"

	"github.com/muhifn/rdp-api/internal/config"
	"github.com/muhifn/rdp-api/internal/middleware"
	"github.com/muhifn/rdp-api/internal/service"
)

// NewRouter creates the main chi router with all routes and middleware.
// This is the glue that wires handlers, middleware, and services together.
func NewRouter(svcs *service.Services, cfg *config.Config) http.Handler {
	r := chi.NewRouter()

	// ── Global middleware ──────────────────────────────────────────────
	r.Use(chimw.RequestID)   // Adds X-Request-Id header
	r.Use(chimw.RealIP)      // Extracts real IP from X-Forwarded-For / X-Real-IP
	r.Use(middleware.Logger) // Logs method, path, status, duration
	r.Use(chimw.Recoverer)   // Recovers from panics and returns 500

	// ── CORS ──────────────────────────────────────────────────────────
	// rs/cors is applied as the outermost handler (wraps the router)
	// so we configure it here but apply it at the end.
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true, // Needed for cookies (access/refresh tokens)
		MaxAge:           300,  // Preflight cache: 5 minutes
	})

	// ── Create handlers ───────────────────────────────────────────────
	loginLimiter := middleware.NewLoginRateLimiter(5, 15*time.Minute, 15*time.Minute)
	authH := NewAuthHandler(svcs.Auth, loginLimiter)
	productH := NewProductHandler(svcs.Product)
	categoryH := NewCategoryHandler(svcs.Category)
	stockH := NewStockHandler(svcs.Stock, svcs.Product)
	adminH := NewAdminHandler(svcs.Product, svcs.Category, svcs.Dashboard)

	// ── Health check ──────────────────────────────────────────────────
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// ── API routes ────────────────────────────────────────────────────
	r.Route("/api", func(api chi.Router) {

		// -- Auth (public) --
		api.Route("/auth", func(auth chi.Router) {
			auth.Post("/login", authH.Login)
			auth.Post("/refresh", authH.Refresh)
			auth.Post("/logout", authH.Logout)
		})

		// -- Products (public) --
		api.Route("/products", func(products chi.Router) {
			products.Get("/", productH.List)
			products.Get("/by-slug/{slug}", productH.GetBySlug)
		})

		// -- Categories (public) --
		api.Route("/categories", func(categories chi.Router) {
			categories.Get("/", categoryH.List)
			categories.Get("/{id}", categoryH.GetByID)
		})

		// -- Stock (public, SSE) --
		api.Route("/stock", func(stock chi.Router) {
			stock.Get("/stream", stockH.Stream)
			stock.Get("/snapshot", stockH.Snapshot)
		})

		// -- Admin (protected by JWT) --
		api.Route("/admin", func(admin chi.Router) {
			// Apply JWT middleware to all admin routes
			admin.Use(middleware.RequireAdmin(svcs.Auth))

			// Dashboard
			admin.Get("/dashboard", adminH.Dashboard)

			// Admin products CRUD
			admin.Route("/products", func(ap chi.Router) {
				ap.Get("/", adminH.ListProducts)
				ap.Post("/", adminH.CreateProduct)
				ap.Get("/{id}", adminH.GetProduct)
				ap.Put("/{id}", adminH.UpdateProduct)
				ap.Delete("/{id}", adminH.DeleteProduct)
			})

			// Admin categories CRUD
			admin.Route("/categories", func(ac chi.Router) {
				ac.Get("/", adminH.ListCategories)
				ac.Post("/", adminH.CreateCategory)
				ac.Get("/{id}", adminH.GetCategory)
				ac.Put("/{id}", adminH.UpdateCategory)
				ac.Delete("/{id}", adminH.DeleteCategory)
			})

		})
	})

	// Wrap the entire router with CORS
	return corsHandler.Handler(r)
}
