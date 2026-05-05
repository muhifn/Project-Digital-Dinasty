package service

import (
	"context"

	"github.com/muhifn/rdp-api/internal/model"
	"github.com/muhifn/rdp-api/internal/repository"
)

// DashboardService provides admin dashboard statistics.
type DashboardService struct {
	repos *repository.Repositories
}

func NewDashboardService(repos *repository.Repositories) *DashboardService {
	return &DashboardService{repos: repos}
}

// GetDashboardData returns all dashboard statistics.
func (s *DashboardService) GetDashboardData(ctx context.Context) (*model.DashboardData, error) {
	db := s.repos.Product.DB()
	data := &model.DashboardData{}

	// Total active products
	err := db.GetContext(ctx, &data.TotalProducts, `
		SELECT COUNT(*) FROM products WHERE is_active = true AND deleted_at IS NULL
	`)
	if err != nil {
		return nil, err
	}

	// Low stock products
	err = db.SelectContext(ctx, &data.LowStockList, `
		SELECT p.id, p.name, p.slug, p.stock, p.unit, p.low_stock_threshold,
		       p.status, p.is_active, p.price, p.stock_updated_at,
		       p.created_at, p.updated_at, p.category_id,
		       c.name AS category_name
		FROM products p
		JOIN categories c ON c.id = p.category_id
		WHERE p.is_active = true AND p.deleted_at IS NULL
		  AND p.stock <= p.low_stock_threshold
		ORDER BY p.stock ASC
	`)
	if err != nil {
		return nil, err
	}

	return data, nil
}
