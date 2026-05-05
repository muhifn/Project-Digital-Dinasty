package repository

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/muhifn/rdp-api/internal/model"
)

type StoreSettingRepo struct {
	db *sqlx.DB
}

func NewStoreSettingRepo(db *sqlx.DB) *StoreSettingRepo {
	return &StoreSettingRepo{db: db}
}

// GetByKey returns a single setting by key.
func (r *StoreSettingRepo) GetByKey(ctx context.Context, key string) (*model.StoreSetting, error) {
	var s model.StoreSetting
	err := r.db.GetContext(ctx, &s, `
		SELECT id, key, value, created_at, updated_at
		FROM store_settings
		WHERE key = $1
	`, key)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// GetAll returns all store settings.
func (r *StoreSettingRepo) GetAll(ctx context.Context) ([]model.StoreSetting, error) {
	var settings []model.StoreSetting
	err := r.db.SelectContext(ctx, &settings, `
		SELECT id, key, value, created_at, updated_at
		FROM store_settings
		ORDER BY key ASC
	`)
	return settings, err
}
