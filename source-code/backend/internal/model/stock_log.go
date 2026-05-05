package model

import "time"

// StockChangeType enum values.
const (
	StockChangeIn         = "IN"
	StockChangeOut        = "OUT"
	StockChangeAdjustment = "ADJUSTMENT"
)

// StockLog represents a stock change entry.
type StockLog struct {
	ID             string    `db:"id" json:"id"`
	QuantityChange int       `db:"quantity_change" json:"quantityChange"`
	StockBefore    int       `db:"stock_before" json:"stockBefore"`
	StockAfter     int       `db:"stock_after" json:"stockAfter"`
	Type           string    `db:"type" json:"type"`
	Reference      *string   `db:"reference" json:"reference,omitempty"`
	Note           *string   `db:"note" json:"note,omitempty"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	ProductID      string    `db:"product_id" json:"productId"`
}

// StockUpdate is the payload sent via SSE when stock changes.
// db tags are needed because GetStockSnapshot scans SQL rows into this struct.
type StockUpdate struct {
	ProductID      string    `db:"product_id" json:"productId"`
	Stock          int       `db:"stock" json:"stock"`
	Status         string    `db:"status" json:"status"`
	StockUpdatedAt time.Time `db:"stock_updated_at" json:"stockUpdatedAt"`
}
