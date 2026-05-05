package handler

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/muhifn/rdp-api/internal/middleware"
	"github.com/muhifn/rdp-api/internal/pkg"
	"github.com/muhifn/rdp-api/internal/service"
)

type AuthHandler struct {
	authSvc     *service.AuthService
	rateLimiter *middleware.LoginRateLimiter
}

func NewAuthHandler(authSvc *service.AuthService, rateLimiter *middleware.LoginRateLimiter) *AuthHandler {
	return &AuthHandler{authSvc: authSvc, rateLimiter: rateLimiter}
}

// Login handles POST /auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		pkg.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if input.Email == "" || input.Password == "" {
		pkg.Error(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	rateLimitKeys := loginRateLimitKeys(r, input.Email)

	if h.rateLimiter != nil {
		maxRetryAfter := 0
		for _, key := range rateLimitKeys {
			blocked, retryAfter := h.rateLimiter.IsBlocked(key)
			if blocked && retryAfter > maxRetryAfter {
				maxRetryAfter = retryAfter
			}
		}
		if maxRetryAfter > 0 {
			writeLoginRateLimitResponse(w, maxRetryAfter)
			return
		}
	}

	tokens, admin, err := h.authSvc.Login(r.Context(), input.Email, input.Password)
	if err != nil {
		if h.rateLimiter != nil {
			maxRetryAfter := 0
			for _, key := range rateLimitKeys {
				retryAfter := h.rateLimiter.RecordFailure(key)
				if retryAfter > maxRetryAfter {
					maxRetryAfter = retryAfter
				}
			}
			if maxRetryAfter > 0 {
				writeLoginRateLimitResponse(w, maxRetryAfter)
				return
			}
		}
		pkg.Error(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	if h.rateLimiter != nil {
		for _, key := range rateLimitKeys {
			h.rateLimiter.ClearAttempts(key)
		}
	}

	// Set refresh token as HttpOnly cookie
	secureCookie := isSecureRequest(r)
	http.SetCookie(w, &http.Cookie{
		Name:     "rdp_refresh_token",
		Value:    tokens.RefreshToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   7 * 24 * 60 * 60, // 7 days
	})

	// Set access token as cookie too (for SSR server components to use)
	http.SetCookie(w, &http.Cookie{
		Name:     "rdp_access_token",
		Value:    tokens.AccessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   15 * 60, // 15 minutes
	})

	pkg.Success(w, http.StatusOK, "Login successful", map[string]interface{}{
		"accessToken": tokens.AccessToken,
		"expiresAt":   tokens.ExpiresAt,
		"admin": map[string]interface{}{
			"id":    admin.ID,
			"email": admin.Email,
			"name":  admin.Name,
			"role":  "admin",
		},
	})
}

// Refresh handles POST /auth/refresh
func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("rdp_refresh_token")
	if err != nil || cookie.Value == "" {
		pkg.Error(w, http.StatusUnauthorized, "No refresh token")
		return
	}

	tokens, err := h.authSvc.RefreshAccessToken(r.Context(), cookie.Value)
	if err != nil {
		pkg.Error(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	// Update cookies
	secureCookie := isSecureRequest(r)
	http.SetCookie(w, &http.Cookie{
		Name:     "rdp_refresh_token",
		Value:    tokens.RefreshToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   7 * 24 * 60 * 60,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "rdp_access_token",
		Value:    tokens.AccessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   15 * 60,
	})

	pkg.Success(w, http.StatusOK, "Token refreshed", map[string]interface{}{
		"accessToken": tokens.AccessToken,
		"expiresAt":   tokens.ExpiresAt,
	})
}

// Logout handles POST /auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Clear cookies
	secureCookie := isSecureRequest(r)
	http.SetCookie(w, &http.Cookie{
		Name:     "rdp_refresh_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "rdp_access_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})

	pkg.Success(w, http.StatusOK, "Logged out", nil)
}

func writeLoginRateLimitResponse(w http.ResponseWriter, retryAfter int) {
	w.Header().Set("Retry-After", fmt.Sprintf("%d", retryAfter))
	pkg.JSON(w, http.StatusTooManyRequests, map[string]interface{}{
		"success":    false,
		"error":      "Too many login attempts",
		"message":    "Too many login attempts. Please try again later.",
		"retryAfter": retryAfter,
	})
}

func isSecureRequest(r *http.Request) bool {
	if r.TLS != nil {
		return true
	}

	proto := strings.ToLower(strings.TrimSpace(r.Header.Get("X-Forwarded-Proto")))
	if proto == "" {
		return false
	}

	return firstForwardedProto(proto) == "https"
}

func firstForwardedProto(value string) string {
	parts := strings.Split(value, ",")
	if len(parts) == 0 {
		return ""
	}
	return strings.TrimSpace(parts[0])
}

func loginRateLimitKeys(r *http.Request, email string) []string {
	keys := make([]string, 0, 3)
	trimmedEmail := strings.TrimSpace(email)
	if trimmedEmail != "" {
		keys = append(keys, "email:"+trimmedEmail)
	}

	clientKeys := extractClientRateLimitKeys(r)
	keys = append(keys, clientKeys...)

	return dedupeStrings(keys)
}

func extractClientRateLimitKeys(r *http.Request) []string {
	keys := make([]string, 0, 2)

	clientID := strings.TrimSpace(r.Header.Get("X-Login-Client-Id"))
	if clientID != "" {
		keys = append(keys, "clientid:"+clientID)
	}

	ip := strings.TrimSpace(r.Header.Get("X-Original-Client-IP"))
	if ip == "" {
		ip = firstForwardedIP(r.Header.Get("X-Forwarded-For"))
	}
	if ip == "" {
		ip = strings.TrimSpace(r.Header.Get("X-Real-IP"))
	}
	if ip == "" {
		host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
		if err == nil {
			ip = strings.TrimSpace(host)
		} else {
			ip = strings.TrimSpace(r.RemoteAddr)
		}
	}

	if ip != "" {
		keys = append(keys, "client:"+ip)
	}

	return keys
}

func dedupeStrings(values []string) []string {
	if len(values) <= 1 {
		return values
	}

	seen := make(map[string]struct{}, len(values))
	result := make([]string, 0, len(values))
	for _, value := range values {
		if value == "" {
			continue
		}
		if _, exists := seen[value]; exists {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}

	return result
}

func firstForwardedIP(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}
	parts := strings.Split(trimmed, ",")
	if len(parts) == 0 {
		return ""
	}
	return strings.TrimSpace(parts[0])
}
