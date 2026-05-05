package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/muhifn/rdp-api/internal/model"
	"github.com/muhifn/rdp-api/internal/pkg"
	"github.com/muhifn/rdp-api/internal/service"
)

type ProductHandler struct {
	productSvc *service.ProductService
}

func NewProductHandler(productSvc *service.ProductService) *ProductHandler {
	return &ProductHandler{productSvc: productSvc}
}

// List handles GET /api/products
func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	params := model.ProductListParams{
		Search:   q.Get("search"),
		Category: q.Get("category"),
		Sort:     q.Get("sort"),
		Featured: q.Get("featured") == "true",
		Exclude:  q.Get("exclude"),
	}

	if limit := q.Get("limit"); limit != "" {
		var l int
		if _, err := parsePositiveInt(limit); err == nil {
			l = int(mustParseInt(limit))
		}
		params.Limit = l
	}

	products, err := h.productSvc.List(r.Context(), params)
	if err != nil {
		pkg.Error(w, http.StatusInternalServerError, "Failed to fetch products")
		return
	}

	pkg.Success(w, http.StatusOK, "", products)
}

// GetBySlug handles GET /api/products/by-slug/{slug}
func (h *ProductHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		pkg.Error(w, http.StatusBadRequest, "Slug is required")
		return
	}

	product, stockLogs, err := h.productSvc.GetBySlug(r.Context(), slug)
	if err != nil {
		pkg.Error(w, http.StatusNotFound, "Product not found")
		return
	}

	pkg.Success(w, http.StatusOK, "", map[string]interface{}{
		"product":   product,
		"stockLogs": stockLogs,
	})
}

func parsePositiveInt(s string) (int64, error) {
	var n int64
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, errInvalidInt
		}
		n = n*10 + int64(c-'0')
	}
	return n, nil
}

func mustParseInt(s string) int64 {
	n, _ := parsePositiveInt(s)
	return n
}

var errInvalidInt = errorf("invalid integer")

type errorString struct{ s string }

func (e *errorString) Error() string { return e.s }
func errorf(s string) error          { return &errorString{s} }
