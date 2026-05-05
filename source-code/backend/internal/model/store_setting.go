package model

import "time"

// StoreSetting represents a key-value store setting.
type StoreSetting struct {
	ID        string    `db:"id" json:"id"`
	Key       string    `db:"key" json:"key"`
	Value     string    `db:"value" json:"value"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}

// DashboardData holds the admin dashboard statistics.
type DashboardData struct {
	TotalProducts int       `json:"totalProducts"`
	LowStockList  []Product `json:"lowStockList"`
}
