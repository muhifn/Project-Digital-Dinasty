package repository

import "github.com/jmoiron/sqlx"

// Repositories holds all repository instances.
type Repositories struct {
	Admin        *AdminRepo
	Category     *CategoryRepo
	Product      *ProductRepo
	StockLog     *StockLogRepo
	StoreSetting *StoreSettingRepo
}

// NewRepositories creates all repositories with the given database connection.
func NewRepositories(db *sqlx.DB) *Repositories {
	return &Repositories{
		Admin:        NewAdminRepo(db),
		Category:     NewCategoryRepo(db),
		Product:      NewProductRepo(db),
		StockLog:     NewStockLogRepo(db),
		StoreSetting: NewStoreSettingRepo(db),
	}
}
