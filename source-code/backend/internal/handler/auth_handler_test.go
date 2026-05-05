package handler

import (
	"crypto/tls"
	"net/http/httptest"
	"reflect"
	"testing"
)

func TestLoginRateLimitKeys_IncludesEmailClientIDAndClientIP(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/auth/login", nil)
	req.Header.Set("X-Login-Client-Id", "browser-abc-123")
	req.Header.Set("X-Original-Client-IP", "36.79.12.44")

	keys := loginRateLimitKeys(req, "Admin@PlanetMotorBMW.com")
	expected := []string{
		"email:Admin@PlanetMotorBMW.com",
		"clientid:browser-abc-123",
		"client:36.79.12.44",
	}

	if !reflect.DeepEqual(keys, expected) {
		t.Fatalf("unexpected keys, got %v expected %v", keys, expected)
	}
}

func TestLoginRateLimitKeys_DeduplicatesRepeatedClientSources(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/auth/login", nil)
	req.Header.Set("X-Original-Client-IP", "203.0.113.42")
	req.Header.Set("X-Forwarded-For", "203.0.113.42, 10.0.0.1")

	keys := loginRateLimitKeys(req, "admin@planetmotorbmw.com")
	expected := []string{"email:admin@planetmotorbmw.com", "client:203.0.113.42"}

	if !reflect.DeepEqual(keys, expected) {
		t.Fatalf("unexpected deduped keys, got %v expected %v", keys, expected)
	}
}

func TestExtractClientRateLimitKeys_PrefersOriginalThenForwarded(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/auth/login", nil)
	req.Header.Set("X-Original-Client-IP", "36.79.10.1")
	req.Header.Set("X-Forwarded-For", "103.10.1.2, 10.0.0.1")
	req.Header.Set("X-Real-IP", "10.0.0.2")

	keys := extractClientRateLimitKeys(req)
	expected := []string{"client:36.79.10.1"}

	if !reflect.DeepEqual(keys, expected) {
		t.Fatalf("expected keys %v, got %v", expected, keys)
	}
}

func TestExtractClientRateLimitKeys_UsesClientIDWhenProvided(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/auth/login", nil)
	req.Header.Set("X-Login-Client-Id", "device-xyz")
	req.Header.Set("X-Forwarded-For", "198.51.100.7")

	keys := extractClientRateLimitKeys(req)
	expected := []string{"clientid:device-xyz", "client:198.51.100.7"}

	if !reflect.DeepEqual(keys, expected) {
		t.Fatalf("expected keys %v, got %v", expected, keys)
	}
}

func TestExtractClientRateLimitKeys_FallbacksToRemoteAddr(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/auth/login", nil)
	req.RemoteAddr = "203.0.113.24:51234"

	keys := extractClientRateLimitKeys(req)
	expected := []string{"client:203.0.113.24"}

	if !reflect.DeepEqual(keys, expected) {
		t.Fatalf("expected remote addr host fallback %v, got %v", expected, keys)
	}
}

func TestExtractClientRateLimitKeys_ReturnsOnlyClientIDWhenIPMissing(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/auth/login", nil)
	req.RemoteAddr = ""
	req.Header.Set("X-Login-Client-Id", "device-only")

	keys := extractClientRateLimitKeys(req)
	expected := []string{"clientid:device-only"}

	if !reflect.DeepEqual(keys, expected) {
		t.Fatalf("expected keys %v, got %v", expected, keys)
	}
}

func TestFirstForwardedIP(t *testing.T) {
	if got := firstForwardedIP("  198.51.100.7 , 10.1.1.1 "); got != "198.51.100.7" {
		t.Fatalf("unexpected first forwarded IP: %q", got)
	}

	if got := firstForwardedIP("   "); got != "" {
		t.Fatalf("expected empty result for blank header, got %q", got)
	}
}

func TestIsSecureRequest_TrustsTLSAndForwardedProto(t *testing.T) {
	tlsReq := httptest.NewRequest("POST", "/api/auth/login", nil)
	tlsReq.TLS = &tls.ConnectionState{}
	if !isSecureRequest(tlsReq) {
		t.Fatal("expected TLS request to be secure")
	}

	forwardedReq := httptest.NewRequest("POST", "/api/auth/login", nil)
	forwardedReq.Header.Set("X-Forwarded-Proto", "https")
	if !isSecureRequest(forwardedReq) {
		t.Fatal("expected forwarded https request to be secure")
	}

	multiForwardedReq := httptest.NewRequest("POST", "/api/auth/login", nil)
	multiForwardedReq.Header.Set("X-Forwarded-Proto", "https, http")
	if !isSecureRequest(multiForwardedReq) {
		t.Fatal("expected first forwarded https proto to be secure")
	}

	httpReq := httptest.NewRequest("POST", "/api/auth/login", nil)
	httpReq.Header.Set("X-Forwarded-Proto", "http")
	if isSecureRequest(httpReq) {
		t.Fatal("expected forwarded http request to be insecure")
	}
}
