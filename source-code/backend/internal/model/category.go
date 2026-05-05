package model

import "time"

// Category represents a product category.
type Category struct {
	ID          string    `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Slug        string    `db:"slug" json:"slug"`
	Description *string   `db:"description" json:"description,omitempty"`
	ImageURL    *string   `db:"image_url" json:"imageUrl,omitempty"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`

	// Computed fields (not always populated)
	ProductCount *int `db:"product_count" json:"productCount,omitempty"`
}
