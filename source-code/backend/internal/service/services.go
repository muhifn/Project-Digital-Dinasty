package service

import (
	"github.com/muhifn/rdp-api/internal/config"
	"github.com/muhifn/rdp-api/internal/repository"
)

// Services holds all service instances.
type Services struct {
	Auth      *AuthService
	Product   *ProductService
	Category  *CategoryService
	Stock     *StockService
	Dashboard *DashboardService
}

// NewServices creates all services with the given dependencies.
func NewServices(repos *repository.Repositories, cfg *config.Config) *Services {
	stockBroker := NewStockService()

	return &Services{
		Auth:      NewAuthService(repos.Admin, cfg.JWTSecret),
		Product:   NewProductService(repos.Product, repos.StockLog, stockBroker),
		Category:  NewCategoryService(repos.Category),
		Stock:     stockBroker,
		Dashboard: NewDashboardService(repos),
	}
}
