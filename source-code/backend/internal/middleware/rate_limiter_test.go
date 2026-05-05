package middleware

import (
	"testing"
	"time"
)

func TestLoginRateLimiter_BlocksAfterMaxAttemptsPerEmail(t *testing.T) {
	rl := NewLoginRateLimiter(5, time.Minute, time.Minute)
	defer rl.Shutdown()

	for i := 0; i < 4; i++ {
		retryAfter := rl.RecordFailure("Admin@PlanetMotorBMW.com")
		if retryAfter != 0 {
			t.Fatalf("expected no lockout before threshold, got retryAfter=%d", retryAfter)
		}
	}

	blocked, retryAfter := rl.IsBlocked("admin@planetmotorbmw.com")
	if blocked || retryAfter != 0 {
		t.Fatalf("expected not blocked before threshold, got blocked=%v retryAfter=%d", blocked, retryAfter)
	}

	retryAfter = rl.RecordFailure("  ADMIN@PLANETMOTORBMW.COM  ")
	if retryAfter <= 0 {
		t.Fatalf("expected lockout at threshold, got retryAfter=%d", retryAfter)
	}

	blocked, retryAfter = rl.IsBlocked("admin@planetmotorbmw.com")
	if !blocked || retryAfter <= 0 {
		t.Fatalf("expected blocked after threshold, got blocked=%v retryAfter=%d", blocked, retryAfter)
	}

	blocked, _ = rl.IsBlocked("other@planetmotorbmw.com")
	if blocked {
		t.Fatalf("expected different email identifier to remain unblocked")
	}
}

func TestLoginRateLimiter_WindowAndLockoutExpiry(t *testing.T) {
	rl := NewLoginRateLimiter(2, 50*time.Millisecond, 80*time.Millisecond)
	defer rl.Shutdown()

	if retryAfter := rl.RecordFailure("admin@planetmotorbmw.com"); retryAfter != 0 {
		t.Fatalf("expected first failure to not lock, got retryAfter=%d", retryAfter)
	}

	time.Sleep(70 * time.Millisecond)

	if retryAfter := rl.RecordFailure("admin@planetmotorbmw.com"); retryAfter != 0 {
		t.Fatalf("expected counter reset after window, got retryAfter=%d", retryAfter)
	}

	if blocked, retryAfter := rl.IsBlocked("admin@planetmotorbmw.com"); blocked || retryAfter != 0 {
		t.Fatalf("expected not blocked after reset, got blocked=%v retryAfter=%d", blocked, retryAfter)
	}

	if retryAfter := rl.RecordFailure("admin@planetmotorbmw.com"); retryAfter != 0 {
		t.Fatalf("expected first in-window failure to not lock, got retryAfter=%d", retryAfter)
	}

	retryAfter := rl.RecordFailure("admin@planetmotorbmw.com")
	if retryAfter <= 0 {
		t.Fatalf("expected lockout on second in-window failure, got retryAfter=%d", retryAfter)
	}

	if blocked, retryAfter := rl.IsBlocked("admin@planetmotorbmw.com"); !blocked || retryAfter <= 0 {
		t.Fatalf("expected blocked during lockout, got blocked=%v retryAfter=%d", blocked, retryAfter)
	}

	time.Sleep(100 * time.Millisecond)

	if blocked, retryAfter := rl.IsBlocked("admin@planetmotorbmw.com"); blocked || retryAfter != 0 {
		t.Fatalf("expected lockout expiry, got blocked=%v retryAfter=%d", blocked, retryAfter)
	}
}
