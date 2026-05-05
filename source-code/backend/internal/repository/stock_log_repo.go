package repository

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/muhifn/rdp-api/internal/model"
)

type StockLogRepo struct {
	db *sqlx.DB
}

func NewStockLogRepo(db *sqlx.DB) *StockLogRepo {
	return &StockLogRepo{db: db}
}

// ListByProduct returns stock logs for a specific product.
func (r *StockLogRepo) ListByProduct(ctx context.Context, productID string) ([]model.StockLog, error) {
	var logs []model.StockLog
	err := r.db.SelectContext(ctx, &logs, `
		SELECT id, quantity_change, stock_before, stock_after, type,
		       reference, note, created_at, product_id
		FROM stock_logs
		WHERE product_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`, productID)
	return logs, err
}

// Create inserts a stock log entry.
func (r *StockLogRepo) Create(ctx context.Context, tx *sqlx.Tx, log *model.StockLog) error {
	_, err := tx.ExecContext(ctx, `
		INSERT INTO stock_logs (product_id, quantity_change, stock_before, stock_after, type, reference, note)
		VALUES ($1, $2, $3, $4, $5::stock_change_type, $6, $7)
	`, log.ProductID, log.QuantityChange, log.StockBefore, log.StockAfter, log.Type, log.Reference, log.Note)
	return err
}
