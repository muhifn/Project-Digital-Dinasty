package middleware

import (
	"strings"
	"sync"
	"time"
)

// LoginRateLimiter limits failed login attempts per identifier (email).
type LoginRateLimiter struct {
	mu          sync.Mutex
	attempts    map[string]*attemptRecord
	maxAttempts int
	window      time.Duration
	lockout     time.Duration
	stopCleanup chan struct{}
}

type attemptRecord struct {
	count        int
	firstAttempt time.Time
	lockedUntil  time.Time
}

func NewLoginRateLimiter(maxAttempts int, window, lockout time.Duration) *LoginRateLimiter {
	rl := &LoginRateLimiter{
		attempts:    make(map[string]*attemptRecord),
		maxAttempts: maxAttempts,
		window:      window,
		lockout:     lockout,
		stopCleanup: make(chan struct{}),
	}

	go rl.cleanup()

	return rl
}

// IsBlocked returns whether an identifier is currently locked and retryAfter in seconds.
func (rl *LoginRateLimiter) IsBlocked(identifier string) (bool, int) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	key := normalizeIdentifier(identifier)
	rec, ok := rl.attempts[key]
	if !ok {
		return false, 0
	}

	now := time.Now()
	if !rec.lockedUntil.IsZero() {
		if now.Before(rec.lockedUntil) {
			return true, int(time.Until(rec.lockedUntil).Seconds()) + 1
		}
		delete(rl.attempts, key)
		return false, 0
	}

	if now.Sub(rec.firstAttempt) > rl.window {
		delete(rl.attempts, key)
	}

	return false, 0
}

// RecordFailure increments the failed-attempt counter and applies lockout.
// It returns retryAfter in seconds if the identifier is now locked.
func (rl *LoginRateLimiter) RecordFailure(identifier string) int {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	key := normalizeIdentifier(identifier)
	now := time.Now()
	rec, ok := rl.attempts[key]
	if !ok {
		rl.attempts[key] = &attemptRecord{
			count:        1,
			firstAttempt: now,
		}
		return 0
	}

	if !rec.lockedUntil.IsZero() {
		if now.Before(rec.lockedUntil) {
			return int(time.Until(rec.lockedUntil).Seconds()) + 1
		}
		rec.count = 0
		rec.firstAttempt = now
		rec.lockedUntil = time.Time{}
	}

	if now.Sub(rec.firstAttempt) > rl.window {
		rec.count = 1
		rec.firstAttempt = now
		rec.lockedUntil = time.Time{}
		return 0
	}

	rec.count++
	if rec.count >= rl.maxAttempts {
		rec.lockedUntil = now.Add(rl.lockout)
		return int(rl.lockout.Seconds())
	}

	return 0
}

// ClearAttempts clears all failed-attempt state for an identifier.
func (rl *LoginRateLimiter) ClearAttempts(identifier string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	delete(rl.attempts, normalizeIdentifier(identifier))
}

func (rl *LoginRateLimiter) Shutdown() {
	close(rl.stopCleanup)
}

func (rl *LoginRateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rl.mu.Lock()
			now := time.Now()
			for key, rec := range rl.attempts {
				if !rec.lockedUntil.IsZero() {
					if now.After(rec.lockedUntil) {
						delete(rl.attempts, key)
					}
					continue
				}

				if now.Sub(rec.firstAttempt) > rl.window {
					delete(rl.attempts, key)
				}
			}
			rl.mu.Unlock()
		case <-rl.stopCleanup:
			return
		}
	}
}

func normalizeIdentifier(identifier string) string {
	return strings.ToLower(strings.TrimSpace(identifier))
}
