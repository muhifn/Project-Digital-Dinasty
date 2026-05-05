package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/muhifn/rdp-api/internal/model"
	"github.com/muhifn/rdp-api/internal/pkg"
	"github.com/muhifn/rdp-api/internal/service"
)

type AdminHandler struct {
	productSvc   *service.ProductService
	categorySvc  *service.CategoryService
	dashboardSvc *service.DashboardService
}

func NewAdminHandler(
	productSvc *service.ProductService,
	categorySvc *service.CategoryService,
	dashboardSvc *service.DashboardService,
) *AdminHandler {
	return &AdminHandler{
		productSvc:   productSvc,
		categorySvc:  categorySvc,
		dashboardSvc: dashboardSvc,
	}
}

// ========== Dashboard ==========

// Dashboard handles GET /api/admin/dashboard
func (h *AdminHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	data, err := h.dashboardSvc.GetDashboardData(r.Context())
	if err != nil {
		pkg.Error(w, http.StatusInternalServerError, "Failed to fetch dashboard data")
		return
	}
	pkg.Success(w, http.StatusOK, "", data)
}

// ========== Products ==========

// ListProducts handles GET /api/admin/products
func (h *AdminHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	params := model.AdminProductListParams{
		Search:   q.Get("search"),
		Category: q.Get("category"),
		Status:   q.Get("status"),
		Activity: q.Get("activity"),
	}

	products, err := h.productSvc.AdminList(r.Context(), params)
	if err != nil {
		pkg.Error(w, http.StatusInternalServerError, "Failed to fetch products")
		return
	}
	pkg.Success(w, http.StatusOK, "", products)
}

// GetProduct handles GET /api/admin/products/{id}
func (h *AdminHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	product, stockLogs, err := h.productSvc.AdminGetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			pkg.Error(w, http.StatusNotFound, "Product not found")
			return
		}
		pkg.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	pkg.Success(w, http.StatusOK, "", map[string]interface{}{
		"product":   product,
		"stockLogs": stockLogs,
	})
}

// CreateProduct handles POST /api/admin/products
func (h *AdminHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	input, err := parseProductInput(r)
	if err != nil {
		pkg.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	product, err := h.productSvc.AdminCreate(r.Context(), *input)
	if err != nil {
		pkg.Error(w, http.StatusInternalServerError, "Failed to create product")
		return
	}
	pkg.Success(w, http.StatusCreated, "Product created", product)
}

// UpdateProduct handles PUT /api/admin/products/{id}
func (h *AdminHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	input, err := parseProductInput(r)
	if err != nil {
		pkg.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	product, err := h.productSvc.AdminUpdate(r.Context(), id, *input)
	if err != nil {
		pkg.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	pkg.Success(w, http.StatusOK, "Product updated", product)
}

// DeleteProduct handles DELETE /api/admin/products/{id}
func (h *AdminHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.productSvc.AdminDelete(r.Context(), id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			pkg.Error(w, http.StatusNotFound, "Product not found")
			return
		}
		pkg.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	pkg.Success(w, http.StatusOK, "Product deleted", nil)
}

// ========== Categories ==========

// ListCategories handles GET /api/admin/categories
func (h *AdminHandler) ListCategories(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	categories, err := h.categorySvc.Search(r.Context(), search)
	if err != nil {
		pkg.Error(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}
	pkg.Success(w, http.StatusOK, "", categories)
}

// GetCategory handles GET /api/admin/categories/{id}
func (h *AdminHandler) GetCategory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	category, err := h.categorySvc.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			pkg.Error(w, http.StatusNotFound, "Category not found")
			return
		}
		pkg.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	pkg.Success(w, http.StatusOK, "", category)
}

// CreateCategory handles POST /api/admin/categories
func (h *AdminHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		ImageURL    string `json:"imageUrl"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		pkg.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	category, err := h.categorySvc.Create(r.Context(), input.Name, input.Description, input.ImageURL)
	if err != nil {
		pkg.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	pkg.Success(w, http.StatusCreated, "Category created", category)
}

// UpdateCategory handles PUT /api/admin/categories/{id}
func (h *AdminHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		ImageURL    string `json:"imageUrl"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		pkg.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	category, err := h.categorySvc.Update(r.Context(), id, input.Name, input.Description, input.ImageURL)
	if err != nil {
		pkg.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	pkg.Success(w, http.StatusOK, "Category updated", category)
}

// DeleteCategory handles DELETE /api/admin/categories/{id}
func (h *AdminHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.categorySvc.Delete(r.Context(), id); err != nil {
		pkg.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	pkg.Success(w, http.StatusOK, "Category deleted", nil)
}

// ========== Helpers ==========

func parseProductInput(r *http.Request) (*service.AdminProductInput, error) {
	// Try JSON body first
	contentType := r.Header.Get("Content-Type")
	if contentType == "application/json" || contentType == "" {
		var input struct {
			Name              string  `json:"name"`
			Description       string  `json:"description"`
			Price             float64 `json:"price"`
			Stock             int     `json:"stock"`
			Unit              string  `json:"unit"`
			ImageURL          string  `json:"imageUrl"`
			LowStockThreshold int     `json:"lowStockThreshold"`
			CategoryID        string  `json:"categoryId"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			return nil, fmt.Errorf("invalid request body: %w", err)
		}
		return &service.AdminProductInput{
			Name:              input.Name,
			Description:       input.Description,
			Price:             input.Price,
			Stock:             input.Stock,
			Unit:              input.Unit,
			ImageURL:          input.ImageURL,
			LowStockThreshold: input.LowStockThreshold,
			CategoryID:        input.CategoryID,
		}, nil
	}

	// Multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		return nil, fmt.Errorf("invalid form data: %w", err)
	}

	price, err := strconv.ParseFloat(r.FormValue("price"), 64)
	if err != nil {
		return nil, fmt.Errorf("invalid price")
	}
	stock, err := strconv.Atoi(r.FormValue("stock"))
	if err != nil {
		return nil, fmt.Errorf("invalid stock")
	}
	threshold, _ := strconv.Atoi(r.FormValue("lowStockThreshold"))
	if threshold <= 0 {
		threshold = 5
	}

	return &service.AdminProductInput{
		Name:              r.FormValue("name"),
		Description:       r.FormValue("description"),
		Price:             price,
		Stock:             stock,
		Unit:              r.FormValue("unit"),
		ImageURL:          r.FormValue("imageUrl"),
		LowStockThreshold: threshold,
		CategoryID:        r.FormValue("categoryId"),
	}, nil
}
