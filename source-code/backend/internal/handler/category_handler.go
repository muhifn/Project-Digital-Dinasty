package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/muhifn/rdp-api/internal/pkg"
	"github.com/muhifn/rdp-api/internal/service"
)

type CategoryHandler struct {
	categorySvc *service.CategoryService
}

func NewCategoryHandler(categorySvc *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categorySvc: categorySvc}
}

// List handles GET /api/categories
func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
	withCount := r.URL.Query().Get("withCount") == "true"

	categories, err := h.categorySvc.List(r.Context(), withCount)
	if err != nil {
		pkg.Error(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}

	pkg.Success(w, http.StatusOK, "", categories)
}

// GetByID handles GET /api/categories/{id}
func (h *CategoryHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	category, err := h.categorySvc.GetByID(r.Context(), id)
	if err != nil {
		pkg.Error(w, http.StatusNotFound, "Category not found")
		return
	}

	pkg.Success(w, http.StatusOK, "", category)
}
