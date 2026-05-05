package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/muhifn/rdp-api/internal/pkg"
	"github.com/muhifn/rdp-api/internal/service"
)

type contextKey string

const (
	// AdminClaimsKey is the context key for admin JWT claims.
	AdminClaimsKey contextKey = "adminClaims"
)

// Logger logs each request with method, path, status, and duration.
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := &statusRecorder{ResponseWriter: w, status: 200}
		next.ServeHTTP(wrapped, r)
		log.Printf("%s %s %d %s", r.Method, r.URL.Path, wrapped.status, time.Since(start))
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (sr *statusRecorder) WriteHeader(code int) {
	sr.status = code
	sr.ResponseWriter.WriteHeader(code)
}

// Flush implements http.Flusher for SSE support.
func (sr *statusRecorder) Flush() {
	if f, ok := sr.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

// RequireAdmin verifies the JWT access token from Authorization header or cookie.
func RequireAdmin(authSvc *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := extractToken(r)
			if tokenStr == "" {
				pkg.Error(w, http.StatusUnauthorized, "Missing authentication token")
				return
			}

			claims, err := authSvc.ValidateAccessToken(tokenStr)
			if err != nil {
				pkg.Error(w, http.StatusUnauthorized, "Invalid or expired token")
				return
			}

			if claims.Role != "admin" {
				pkg.Error(w, http.StatusForbidden, "Admin access required")
				return
			}

			// Add claims to context
			ctx := context.WithValue(r.Context(), AdminClaimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetAdminClaims retrieves admin claims from context.
func GetAdminClaims(ctx context.Context) *service.AdminClaims {
	claims, _ := ctx.Value(AdminClaimsKey).(*service.AdminClaims)
	return claims
}

// extractToken gets the token from Authorization header or rdp_access_token cookie.
func extractToken(r *http.Request) string {
	// Try Authorization header first
	auth := r.Header.Get("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimPrefix(auth, "Bearer ")
	}

	// Fall back to cookie
	cookie, err := r.Cookie("rdp_access_token")
	if err == nil && cookie.Value != "" {
		return cookie.Value
	}

	return ""
}
