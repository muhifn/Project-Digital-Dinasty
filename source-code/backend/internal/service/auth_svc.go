package service

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/muhifn/rdp-api/internal/model"
	"github.com/muhifn/rdp-api/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

var dummyPasswordHash = []byte("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy")

// AuthService handles authentication and JWT operations.
type AuthService struct {
	adminRepo *repository.AdminRepo
	jwtSecret []byte
}

func NewAuthService(adminRepo *repository.AdminRepo, jwtSecret string) *AuthService {
	return &AuthService{
		adminRepo: adminRepo,
		jwtSecret: []byte(jwtSecret),
	}
}

// TokenPair holds access and refresh tokens.
type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	ExpiresAt    int64  `json:"expiresAt"` // Unix timestamp
}

// AdminClaims are the JWT claims for admin tokens.
type AdminClaims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
}

// Login verifies credentials and returns a JWT token pair.
func (s *AuthService) Login(ctx context.Context, email, password string) (*TokenPair, *model.Admin, error) {
	admin, err := s.adminRepo.FindByEmail(ctx, email)
	if err != nil {
		_ = bcrypt.CompareHashAndPassword(dummyPasswordHash, []byte(password))
		return nil, nil, fmt.Errorf("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(password)); err != nil {
		return nil, nil, fmt.Errorf("invalid email or password")
	}

	// Generate access token (15 minutes)
	accessExp := time.Now().Add(15 * time.Minute)
	accessClaims := AdminClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   admin.ID,
			ExpiresAt: jwt.NewNumericDate(accessExp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "rdp-api",
		},
		Email: admin.Email,
		Name:  admin.Name,
		Role:  "admin",
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to sign access token: %w", err)
	}

	// Generate refresh token (7 days)
	refreshExp := time.Now().Add(7 * 24 * time.Hour)
	refreshClaims := jwt.RegisteredClaims{
		Subject:   admin.ID,
		ExpiresAt: jwt.NewNumericDate(refreshExp),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Issuer:    "rdp-api",
		ID:        "refresh",
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshStr, err := refreshToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessStr,
		RefreshToken: refreshStr,
		ExpiresAt:    accessExp.Unix(),
	}, admin, nil
}

// ValidateAccessToken parses and validates an access token, returning claims.
func (s *AuthService) ValidateAccessToken(tokenStr string) (*AdminClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &AdminClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(*AdminClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}

// RefreshAccessToken uses a refresh token to issue a new access token.
func (s *AuthService) RefreshAccessToken(ctx context.Context, refreshTokenStr string) (*TokenPair, error) {
	token, err := jwt.ParseWithClaims(refreshTokenStr, &jwt.RegisteredClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid || claims.ID != "refresh" {
		return nil, fmt.Errorf("invalid refresh token")
	}

	// Look up admin to get current data
	admin, err := s.adminRepo.FindByID(ctx, claims.Subject)
	if err != nil {
		return nil, fmt.Errorf("admin not found")
	}

	// Issue new access token
	accessExp := time.Now().Add(15 * time.Minute)
	accessClaims := AdminClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   admin.ID,
			ExpiresAt: jwt.NewNumericDate(accessExp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "rdp-api",
		},
		Email: admin.Email,
		Name:  admin.Name,
		Role:  "admin",
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to sign access token: %w", err)
	}

	// Issue new refresh token
	refreshExp := time.Now().Add(7 * 24 * time.Hour)
	newRefreshClaims := jwt.RegisteredClaims{
		Subject:   admin.ID,
		ExpiresAt: jwt.NewNumericDate(refreshExp),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Issuer:    "rdp-api",
		ID:        "refresh",
	}
	newRefreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, newRefreshClaims)
	newRefreshStr, err := newRefreshToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessStr,
		RefreshToken: newRefreshStr,
		ExpiresAt:    accessExp.Unix(),
	}, nil
}
