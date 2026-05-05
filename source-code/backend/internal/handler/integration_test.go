package handler_test

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/muhifn/rdp-api/internal/testutil"
)

type successEnvelope[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    T      `json:"data"`
}

type errorEnvelope struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

type authLoginData struct {
	AccessToken string `json:"accessToken"`
	ExpiresAt   int64  `json:"expiresAt"`
	Admin       struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
		Role  string `json:"role"`
	} `json:"admin"`
}

type categoryData struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	ProductCount *int   `json:"productCount,omitempty"`
}

type productData struct {
	ID                string `json:"id"`
	Name              string `json:"name"`
	Slug              string `json:"slug"`
	CategoryID        string `json:"categoryId"`
	CategoryName      string `json:"categoryName"`
	Status            string `json:"status"`
	Stock             int    `json:"stock"`
	LowStockThreshold int    `json:"lowStockThreshold"`
	IsActive          bool   `json:"isActive"`
}

type productDetailData struct {
	Product   productData      `json:"product"`
	StockLogs []map[string]any `json:"stockLogs"`
}

type dashboardData struct {
	TotalProducts int           `json:"totalProducts"`
	LowStockList  []productData `json:"lowStockList"`
}

func TestPublicEndpointsIntegration(t *testing.T) {
	env := testutil.NewIntegrationEnv(t)

	t.Run("health endpoint", func(t *testing.T) {
		resp := mustDoRequest(t, http.MethodGet, env.Server.URL+"/health", nil, nil)
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		body := mustReadBody(t, resp)
		if !strings.Contains(string(body), `"status":"ok"`) {
			t.Fatalf("unexpected health response: %s", string(body))
		}
	})

	t.Run("categories and products endpoints", func(t *testing.T) {
		resp := mustDoRequest(t, http.MethodGet, env.Server.URL+"/api/categories?withCount=true", nil, nil)
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		cats := decodeSuccess[[]categoryData](t, resp)
		if len(cats.Data) < 2 {
			t.Fatalf("expected at least 2 categories, got %d", len(cats.Data))
		}

		foundSeedCategory := false
		for _, c := range cats.Data {
			if c.ID == env.Seed.CategoryID && c.Slug == env.Seed.CategorySlug {
				foundSeedCategory = true
				if c.ProductCount == nil || *c.ProductCount < 1 {
					t.Fatalf("expected seeded category product count >=1, got %+v", c.ProductCount)
				}
			}
		}
		if !foundSeedCategory {
			t.Fatalf("seed category %s not found", env.Seed.CategoryID)
		}

		resp2 := mustDoRequest(t, http.MethodGet, env.Server.URL+"/api/categories/"+env.Seed.CategoryID, nil, nil)
		defer resp2.Body.Close()
		if resp2.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp2.StatusCode)
		}

		resp3 := mustDoRequest(t, http.MethodGet, env.Server.URL+"/api/products?search=towing&category="+env.Seed.CategorySlug, nil, nil)
		defer resp3.Body.Close()
		if resp3.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp3.StatusCode)
		}
		products := decodeSuccess[[]productData](t, resp3)
		if len(products.Data) == 0 {
			t.Fatalf("expected at least one product")
		}

		resp4 := mustDoRequest(t, http.MethodGet, env.Server.URL+"/api/products/by-slug/"+env.Seed.ProductSlug, nil, nil)
		defer resp4.Body.Close()
		if resp4.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp4.StatusCode)
		}
		detail := decodeSuccess[productDetailData](t, resp4)
		if detail.Data.Product.ID != env.Seed.ProductID {
			t.Fatalf("expected product id %s, got %s", env.Seed.ProductID, detail.Data.Product.ID)
		}
		if len(detail.Data.StockLogs) == 0 {
			t.Fatalf("expected at least one stock log")
		}
	})

	t.Run("legacy order endpoints are gone", func(t *testing.T) {
		for _, path := range []string{
			"/api/orders",
			"/api/orders/ORD-DOES-NOT-EXIST",
			"/api/cron/expire-orders",
			"/api/settings/qris-image",
		} {
			resp := mustDoRequest(t, http.MethodGet, env.Server.URL+path, nil, nil)
			defer resp.Body.Close()
			if resp.StatusCode != http.StatusNotFound && resp.StatusCode != http.StatusMethodNotAllowed {
				t.Fatalf("%s expected 404 or 405, got %d", path, resp.StatusCode)
			}
		}
	})
}

func TestAuthAndAdminGuardIntegration(t *testing.T) {
	env := testutil.NewIntegrationEnv(t)

	t.Run("admin route requires token", func(t *testing.T) {
		resp := mustDoRequest(t, http.MethodGet, env.Server.URL+"/api/admin/dashboard", nil, nil)
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", resp.StatusCode)
		}
	})

	t.Run("login invalid credentials", func(t *testing.T) {
		resp := mustDoJSONRequest(t, http.MethodPost, env.Server.URL+"/api/auth/login", map[string]any{
			"email":    env.Seed.AdminEmail,
			"password": "wrong-password",
		}, nil)
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", resp.StatusCode)
		}
	})

	t.Run("login refresh logout and dashboard", func(t *testing.T) {
		loginResp := mustDoJSONRequest(t, http.MethodPost, env.Server.URL+"/api/auth/login", map[string]any{
			"email":    env.Seed.AdminEmail,
			"password": env.Seed.AdminPassword,
		}, nil)
		defer loginResp.Body.Close()
		if loginResp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", loginResp.StatusCode)
		}

		loginData := decodeSuccess[authLoginData](t, loginResp)
		if loginData.Data.AccessToken == "" {
			t.Fatalf("access token should not be empty")
		}
		if loginData.Data.Admin.Role != "admin" {
			t.Fatalf("expected admin role, got %s", loginData.Data.Admin.Role)
		}

		refreshCookie := findCookie(loginResp, "rdp_refresh_token")
		if refreshCookie == "" {
			t.Fatalf("missing refresh cookie from login response")
		}

		adminResp := mustDoRequest(t, http.MethodGet, env.Server.URL+"/api/admin/dashboard", nil, map[string]string{
			"Authorization": "Bearer " + loginData.Data.AccessToken,
		})
		defer adminResp.Body.Close()
		if adminResp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", adminResp.StatusCode)
		}

		dashboard := decodeSuccess[dashboardData](t, adminResp)
		if dashboard.Data.TotalProducts < 1 {
			t.Fatalf("expected totalProducts >= 1, got %d", dashboard.Data.TotalProducts)
		}

		refreshResp := mustDoRequest(t, http.MethodPost, env.Server.URL+"/api/auth/refresh", nil, map[string]string{
			"Cookie": fmt.Sprintf("rdp_refresh_token=%s", refreshCookie),
		})
		defer refreshResp.Body.Close()
		if refreshResp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200 on refresh, got %d", refreshResp.StatusCode)
		}

		logoutResp := mustDoRequest(t, http.MethodPost, env.Server.URL+"/api/auth/logout", nil, nil)
		defer logoutResp.Body.Close()
		if logoutResp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200 on logout, got %d", logoutResp.StatusCode)
		}
	})
}

func TestAdminCategoryProductLifecycleIntegration(t *testing.T) {
	env := testutil.NewIntegrationEnv(t)
	adminToken := loginAdminAndGetToken(t, env)

	var categoryID string
	var productID string

	t.Run("category and product CRUD", func(t *testing.T) {
		createCategoryResp := mustDoJSONRequest(t, http.MethodPost, env.Server.URL+"/api/admin/categories", map[string]any{
			"name":        "BMW Test Integration",
			"description": "Kategori khusus test integration",
			"imageUrl":    "/images/categories/test.jpg",
		}, map[string]string{
			"Authorization": "Bearer " + adminToken,
		})
		defer createCategoryResp.Body.Close()
		if createCategoryResp.StatusCode != http.StatusCreated {
			t.Fatalf("expected 201, got %d", createCategoryResp.StatusCode)
		}
		createdCategory := decodeSuccess[categoryData](t, createCategoryResp)
		categoryID = createdCategory.Data.ID

		createProductResp := mustDoJSONRequest(t, http.MethodPost, env.Server.URL+"/api/admin/products", map[string]any{
			"name":              "Produk Test Admin",
			"description":       "Produk admin integration test",
			"price":             68000,
			"stock":             12,
			"unit":              "pcs",
			"imageUrl":          "/images/products/test-admin.jpg",
			"lowStockThreshold": 4,
			"categoryId":        categoryID,
		}, map[string]string{
			"Authorization": "Bearer " + adminToken,
		})
		defer createProductResp.Body.Close()
		if createProductResp.StatusCode != http.StatusCreated {
			t.Fatalf("expected 201, got %d", createProductResp.StatusCode)
		}
		createdProduct := decodeSuccess[productData](t, createProductResp)
		productID = createdProduct.Data.ID

		updateProductResp := mustDoJSONRequest(t, http.MethodPut, env.Server.URL+"/api/admin/products/"+productID, map[string]any{
			"name":              "Produk Test Admin Updated",
			"description":       "Produk admin integration test updated",
			"price":             72000,
			"stock":             15,
			"unit":              "pcs",
			"imageUrl":          "/images/products/test-admin-updated.jpg",
			"lowStockThreshold": 3,
			"categoryId":        categoryID,
		}, map[string]string{
			"Authorization": "Bearer " + adminToken,
		})
		defer updateProductResp.Body.Close()
		if updateProductResp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", updateProductResp.StatusCode)
		}
	})

	t.Run("category delete guard and cleanup", func(t *testing.T) {
		deleteWhileActiveResp := mustDoRequest(t, http.MethodDelete, env.Server.URL+"/api/admin/categories/"+categoryID, nil, map[string]string{
			"Authorization": "Bearer " + adminToken,
		})
		defer deleteWhileActiveResp.Body.Close()
		if deleteWhileActiveResp.StatusCode != http.StatusBadRequest {
			t.Fatalf("expected 400 while category still has active products, got %d", deleteWhileActiveResp.StatusCode)
		}

		deleteProductResp := mustDoRequest(t, http.MethodDelete, env.Server.URL+"/api/admin/products/"+productID, nil, map[string]string{
			"Authorization": "Bearer " + adminToken,
		})
		defer deleteProductResp.Body.Close()
		if deleteProductResp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200 deleting product, got %d", deleteProductResp.StatusCode)
		}

		deletedProductResp := mustDoRequest(t, http.MethodGet, env.Server.URL+"/api/admin/products/"+productID, nil, map[string]string{
			"Authorization": "Bearer " + adminToken,
		})
		defer deletedProductResp.Body.Close()
		if deletedProductResp.StatusCode != http.StatusNotFound {
			t.Fatalf("expected 404 fetching permanently deleted product, got %d", deletedProductResp.StatusCode)
		}

		deleteCategoryResp := mustDoRequest(t, http.MethodDelete, env.Server.URL+"/api/admin/categories/"+categoryID, nil, map[string]string{
			"Authorization": "Bearer " + adminToken,
		})
		defer deleteCategoryResp.Body.Close()
		if deleteCategoryResp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200 deleting category after product removal, got %d", deleteCategoryResp.StatusCode)
		}
	})
}

func TestStockSnapshotAndStreamIntegration(t *testing.T) {
	env := testutil.NewIntegrationEnv(t)
	adminToken := loginAdminAndGetToken(t, env)

	snapshotResp := mustDoRequest(t, http.MethodGet, env.Server.URL+"/api/stock/snapshot", nil, nil)
	defer snapshotResp.Body.Close()
	if snapshotResp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", snapshotResp.StatusCode)
	}
	snapshot := decodeSuccess[map[string][]map[string]any](t, snapshotResp)
	if len(snapshot.Data["updates"]) == 0 {
		t.Fatalf("expected non-empty stock snapshot")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 12*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, env.Server.URL+"/api/stock/stream", nil)
	if err != nil {
		t.Fatalf("build sse request: %v", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("open sse stream: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 opening stream, got %d", resp.StatusCode)
	}

	eventCh := make(chan string, 1)
	go func() {
		reader := bufio.NewReader(resp.Body)
		sawEvent := false
		for {
			line, readErr := reader.ReadString('\n')
			if readErr != nil {
				close(eventCh)
				return
			}
			line = strings.TrimSpace(line)
			if strings.HasPrefix(line, "event: stock-update") {
				sawEvent = true
			}
			if sawEvent && strings.HasPrefix(line, "data: ") {
				eventCh <- strings.TrimPrefix(line, "data: ")
				return
			}
		}
	}()

	updateResp := mustDoJSONRequest(t, http.MethodPut, env.Server.URL+"/api/admin/products/"+env.Seed.ProductID, map[string]any{
		"name":              env.Seed.ProductName,
		"description":       "Produk spare part BMW untuk integration test",
		"price":             425000,
		"stock":             27,
		"unit":              "pcs",
		"imageUrl":          "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/19/de84bbf0-4ef7-4b01-9c92-25ef4d644fbf.jpg",
		"lowStockThreshold": 3,
		"categoryId":        env.Seed.CategoryID,
	}, map[string]string{
		"Authorization": "Bearer " + adminToken,
	})
	defer updateResp.Body.Close()
	if updateResp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 updating stock, got %d", updateResp.StatusCode)
	}

	select {
	case payload, ok := <-eventCh:
		if !ok {
			t.Fatalf("sse stream closed before stock-update event")
		}
		var updates []map[string]any
		if err := json.Unmarshal([]byte(payload), &updates); err != nil {
			t.Fatalf("decode sse payload: %v", err)
		}
		if len(updates) == 0 {
			t.Fatalf("expected at least one stock update in payload")
		}
	case <-ctx.Done():
		t.Fatalf("timed out waiting for stock-update event")
	}
}

func loginAdminAndGetToken(t *testing.T, env *testutil.IntegrationEnv) string {
	t.Helper()

	resp := mustDoJSONRequest(t, http.MethodPost, env.Server.URL+"/api/auth/login", map[string]any{
		"email":    env.Seed.AdminEmail,
		"password": env.Seed.AdminPassword,
	}, nil)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body := mustReadBody(t, resp)
		t.Fatalf("login expected 200 got %d: %s", resp.StatusCode, string(body))
	}

	payload := decodeSuccess[authLoginData](t, resp)
	if payload.Data.AccessToken == "" {
		t.Fatalf("login did not return access token")
	}

	return payload.Data.AccessToken
}

func mustDoRequest(t *testing.T, method, url string, body io.Reader, headers map[string]string) *http.Response {
	t.Helper()

	req, err := http.NewRequest(method, url, body)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("do request %s %s: %v", method, url, err)
	}
	return resp
}

func mustDoJSONRequest(t *testing.T, method, url string, payload any, headers map[string]string) *http.Response {
	t.Helper()

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(payload); err != nil {
		t.Fatalf("encode json: %v", err)
	}
	if headers == nil {
		headers = map[string]string{}
	}
	headers["Content-Type"] = "application/json"
	return mustDoRequest(t, method, url, &buf, headers)
}

func decodeSuccess[T any](t *testing.T, resp *http.Response) successEnvelope[T] {
	t.Helper()

	var payload successEnvelope[T]
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		t.Fatalf("decode success: %v", err)
	}
	if !payload.Success {
		t.Fatalf("expected success payload, got %+v", payload)
	}
	return payload
}

func decodeError(t *testing.T, resp *http.Response) errorEnvelope {
	t.Helper()

	var payload errorEnvelope
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if payload.Success {
		t.Fatalf("expected error payload, got %+v", payload)
	}
	return payload
}

func mustReadBody(t *testing.T, resp *http.Response) []byte {
	t.Helper()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	return body
}

func findCookie(resp *http.Response, name string) string {
	for _, cookie := range resp.Cookies() {
		if cookie.Name == name {
			return cookie.Value
		}
	}
	return ""
}
