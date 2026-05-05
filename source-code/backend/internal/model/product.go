package model

import "time"

// ProductStatus enum values.
const (
	ProductStatusAvailable  = "AVAILABLE"
	ProductStatusOutOfStock = "OUT_OF_STOCK"
)

// Product represents a product in the catalog.
type Product struct {
	ID                string    `db:"id" json:"id"`
	Name              string    `db:"name" json:"name"`
	Slug              string    `db:"slug" json:"slug"`
	Description       *string   `db:"description" json:"description,omitempty"`
	Price             string    `db:"price" json:"price"` // Decimal as string to avoid float precision issues
	Stock             int       `db:"stock" json:"stock"`
	Unit              string    `db:"unit" json:"unit"`
	ImageURL          *string   `db:"image_url" json:"imageUrl,omitempty"`
	IsActive          bool      `db:"is_active" json:"isActive"`
	Status            string    `db:"status" json:"status"`
	LowStockThreshold int       `db:"low_stock_threshold" json:"lowStockThreshold"`
	StockUpdatedAt    time.Time `db:"stock_updated_at" json:"stockUpdatedAt"`
	CreatedAt         time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt         time.Time `db:"updated_at" json:"updatedAt"`
	CategoryID        string    `db:"category_id" json:"categoryId"`

	// Joined fields (not always populated)
	Category     *Category  `db:"-" json:"category,omitempty"`
	CategoryName *string    `db:"category_name" json:"categoryName,omitempty"`
	CategorySlug *string    `db:"category_slug" json:"categorySlug,omitempty"`
	DeletedAt    *time.Time `db:"deleted_at" json:"deletedAt,omitempty"`
}

// ProductListParams holds query parameters for listing products.
type ProductListParams struct {
	Search   string
	Category string // category slug
	Sort     string // "price_asc", "price_desc", "name_asc", "name_desc", "newest"
	Limit    int
	Featured bool
	Exclude  string // product ID to exclude
}

// AdminProductListParams holds query params for admin product listing.
type AdminProductListParams struct {
	Search   string
	Category string
	Status   string // "AVAILABLE", "OUT_OF_STOCK"
	Activity string // "active", "archived"
}
