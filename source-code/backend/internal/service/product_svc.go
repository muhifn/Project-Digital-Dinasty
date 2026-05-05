package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/muhifn/rdp-api/internal/model"
	"github.com/muhifn/rdp-api/internal/pkg"
	"github.com/muhifn/rdp-api/internal/repository"
)

// ProductService handles product business logic.
type ProductService struct {
	productRepo  *repository.ProductRepo
	stockLogRepo *repository.StockLogRepo
	stockBroker  *StockService
}

func NewProductService(productRepo *repository.ProductRepo, stockLogRepo *repository.StockLogRepo, stockBroker *StockService) *ProductService {
	return &ProductService{
		productRepo:  productRepo,
		stockLogRepo: stockLogRepo,
		stockBroker:  stockBroker,
	}
}

// List returns public products matching filters.
func (s *ProductService) List(ctx context.Context, params model.ProductListParams) ([]model.Product, error) {
	return s.productRepo.List(ctx, params)
}

// GetBySlug returns a public product by slug with stock logs.
func (s *ProductService) GetBySlug(ctx context.Context, slug string) (*model.Product, []model.StockLog, error) {
	prod, err := s.productRepo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, nil, err
	}

	logs, err := s.stockLogRepo.ListByProduct(ctx, prod.ID)
	if err != nil {
		return nil, nil, err
	}

	return prod, logs, nil
}

// AdminList returns products for admin.
func (s *ProductService) AdminList(ctx context.Context, params model.AdminProductListParams) ([]model.Product, error) {
	return s.productRepo.AdminList(ctx, params)
}

// AdminGetByID returns a product by ID for admin.
func (s *ProductService) AdminGetByID(ctx context.Context, id string) (*model.Product, []model.StockLog, error) {
	if !pkg.IsValidUUID(id) {
		return nil, nil, fmt.Errorf("invalid product ID format")
	}

	prod, err := s.productRepo.FindByID(ctx, id)
	if err != nil {
		return nil, nil, err
	}

	logs, err := s.stockLogRepo.ListByProduct(ctx, prod.ID)
	if err != nil {
		return nil, nil, err
	}

	return prod, logs, nil
}

// AdminCreate creates a new product.
func (s *ProductService) AdminCreate(ctx context.Context, input AdminProductInput) (*model.Product, error) {
	// Sanitize
	input.Name = pkg.SanitizePlainText(input.Name)
	input.Description = pkg.SanitizePlainText(input.Description)

	slug := slugify(input.Name)
	status := model.ProductStatusAvailable
	if input.Stock <= 0 {
		status = model.ProductStatusOutOfStock
	}

	desc := &input.Description
	if input.Description == "" {
		desc = nil
	}
	imgURL := &input.ImageURL
	if input.ImageURL == "" {
		imgURL = nil
	}

	prod := &model.Product{
		Name:              input.Name,
		Slug:              slug,
		Description:       desc,
		Price:             fmt.Sprintf("%.2f", input.Price),
		Stock:             input.Stock,
		Unit:              input.Unit,
		ImageURL:          imgURL,
		IsActive:          true,
		Status:            status,
		LowStockThreshold: input.LowStockThreshold,
		CategoryID:        input.CategoryID,
	}

	tx, err := s.productRepo.DB().Beginx()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if err := s.productRepo.Create(ctx, tx, prod); err != nil {
		return nil, err
	}

	// Create initial stock log
	if input.Stock > 0 {
		stockLog := &model.StockLog{
			ProductID:      prod.ID,
			QuantityChange: input.Stock,
			StockBefore:    0,
			StockAfter:     input.Stock,
			Type:           model.StockChangeIn,
		}
		ref := "Initial stock"
		stockLog.Reference = &ref
		if err := s.stockLogRepo.Create(ctx, tx, stockLog); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Broadcast stock update
	s.stockBroker.BroadcastSingle(model.StockUpdate{
		ProductID:      prod.ID,
		Stock:          prod.Stock,
		Status:         prod.Status,
		StockUpdatedAt: prod.StockUpdatedAt,
	})

	return prod, nil
}

// AdminUpdate updates an existing product.
func (s *ProductService) AdminUpdate(ctx context.Context, id string, input AdminProductInput) (*model.Product, error) {
	if !pkg.IsValidUUID(id) {
		return nil, fmt.Errorf("invalid product ID format")
	}

	// Sanitize
	input.Name = pkg.SanitizePlainText(input.Name)
	input.Description = pkg.SanitizePlainText(input.Description)

	slug := slugify(input.Name)
	status := model.ProductStatusAvailable
	if input.Stock <= 0 {
		status = model.ProductStatusOutOfStock
	}

	desc := &input.Description
	if input.Description == "" {
		desc = nil
	}
	imgURL := &input.ImageURL
	if input.ImageURL == "" {
		imgURL = nil
	}

	prod := &model.Product{
		Name:              input.Name,
		Slug:              slug,
		Description:       desc,
		Price:             fmt.Sprintf("%.2f", input.Price),
		Stock:             input.Stock,
		Unit:              input.Unit,
		ImageURL:          imgURL,
		Status:            status,
		LowStockThreshold: input.LowStockThreshold,
		CategoryID:        input.CategoryID,
	}

	tx, err := s.productRepo.DB().Beginx()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Get old stock before update (for stock log) inside same tx to avoid
	// opening another pooled connection while using session-bound search_path.
	oldProd, err := s.productRepo.FindByIDTx(ctx, tx, id)
	if err != nil {
		return nil, err
	}

	if err := s.productRepo.UpdateWithLock(ctx, tx, id, prod); err != nil {
		return nil, err
	}

	// Create stock log if stock changed
	if input.Stock != oldProd.Stock {
		changeType := model.StockChangeAdjustment
		stockLog := &model.StockLog{
			ProductID:      id,
			QuantityChange: input.Stock - oldProd.Stock,
			StockBefore:    oldProd.Stock,
			StockAfter:     input.Stock,
			Type:           changeType,
		}
		ref := "Admin adjustment"
		stockLog.Reference = &ref
		if err := s.stockLogRepo.Create(ctx, tx, stockLog); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Broadcast stock update
	s.stockBroker.BroadcastSingle(model.StockUpdate{
		ProductID:      prod.ID,
		Stock:          prod.Stock,
		Status:         prod.Status,
		StockUpdatedAt: prod.StockUpdatedAt,
	})

	return prod, nil
}

// AdminDelete permanently deletes a product.
func (s *ProductService) AdminDelete(ctx context.Context, id string) error {
	if !pkg.IsValidUUID(id) {
		return fmt.Errorf("invalid product ID format")
	}
	return s.productRepo.DeletePermanent(ctx, id)
}

// GetStockSnapshot returns stock for all active products.
func (s *ProductService) GetStockSnapshot(ctx context.Context) ([]model.StockUpdate, error) {
	return s.productRepo.GetStockSnapshot(ctx)
}

// AdminProductInput is the input for creating/updating a product.
type AdminProductInput struct {
	Name              string
	Description       string
	Price             float64
	Stock             int
	Unit              string
	ImageURL          string
	LowStockThreshold int
	CategoryID        string
}

func slugify(s string) string {
	s = strings.ToLower(s)
	s = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			return r
		}
		if r == ' ' || r == '-' || r == '_' {
			return '-'
		}
		return -1
	}, s)
	for strings.Contains(s, "--") {
		s = strings.ReplaceAll(s, "--", "-")
	}
	return strings.Trim(s, "-")
}
