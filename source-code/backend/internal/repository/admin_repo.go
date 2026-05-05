package repository

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/muhifn/rdp-api/internal/model"
)

type AdminRepo struct {
	db *sqlx.DB
}

func NewAdminRepo(db *sqlx.DB) *AdminRepo {
	return &AdminRepo{db: db}
}

// FindByEmail returns an admin by email, or nil if not found.
func (r *AdminRepo) FindByEmail(ctx context.Context, email string) (*model.Admin, error) {
	var admin model.Admin
	err := r.db.GetContext(ctx, &admin, `
		SELECT id, email, password_hash, name, created_at
		FROM admins
		WHERE email = $1
	`, email)
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

// FindByID returns an admin by ID, or nil if not found.
func (r *AdminRepo) FindByID(ctx context.Context, id string) (*model.Admin, error) {
	var admin model.Admin
	err := r.db.GetContext(ctx, &admin, `
		SELECT id, email, password_hash, name, created_at
		FROM admins
		WHERE id = $1
	`, id)
	if err != nil {
		return nil, err
	}
	return &admin, nil
}
