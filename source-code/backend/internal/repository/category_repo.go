package repository

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/muhifn/rdp-api/internal/model"
)

type CategoryRepo struct {
	db *sqlx.DB
}

func NewCategoryRepo(db *sqlx.DB) *CategoryRepo {
	return &CategoryRepo{db: db}
}

// List returns all categories, optionally with product counts.
func (r *CategoryRepo) List(ctx context.Context, withCount bool) ([]model.Category, error) {
	var categories []model.Category

	if withCount {
		err := r.db.SelectContext(ctx, &categories, `
			SELECT c.id, c.name, c.slug, c.description, c.image_url, c.created_at,
			       COUNT(p.id) FILTER (WHERE p.is_active = true AND p.deleted_at IS NULL) AS product_count
			FROM categories c
			LEFT JOIN products p ON p.category_id = c.id
			GROUP BY c.id
			ORDER BY c.name ASC
		`)
		return categories, err
	}

	err := r.db.SelectContext(ctx, &categories, `
		SELECT id, name, slug, description, image_url, created_at
		FROM categories
		ORDER BY name ASC
	`)
	return categories, err
}

// FindByID returns a single category by ID with product count.
func (r *CategoryRepo) FindByID(ctx context.Context, id string) (*model.Category, error) {
	var cat model.Category
	err := r.db.GetContext(ctx, &cat, `
		SELECT c.id, c.name, c.slug, c.description, c.image_url, c.created_at,
		       COUNT(p.id) FILTER (WHERE p.is_active = true AND p.deleted_at IS NULL) AS product_count
		FROM categories c
		LEFT JOIN products p ON p.category_id = c.id
		WHERE c.id = $1
		GROUP BY c.id
	`, id)
	if err != nil {
		return nil, err
	}
	return &cat, nil
}

// FindBySlug returns a single category by slug.
func (r *CategoryRepo) FindBySlug(ctx context.Context, slug string) (*model.Category, error) {
	var cat model.Category
	err := r.db.GetContext(ctx, &cat, `
		SELECT id, name, slug, description, image_url, created_at
		FROM categories
		WHERE slug = $1
	`, slug)
	if err != nil {
		return nil, err
	}
	return &cat, nil
}

// Create inserts a new category.
func (r *CategoryRepo) Create(ctx context.Context, name, slug, description, imageURL string) (*model.Category, error) {
	var cat model.Category
	err := r.db.GetContext(ctx, &cat, `
		INSERT INTO categories (name, slug, description, image_url)
		VALUES ($1, $2, $3, NULLIF($4, ''))
		RETURNING id, name, slug, description, image_url, created_at
	`, name, slug, description, imageURL)
	if err != nil {
		return nil, err
	}
	return &cat, nil
}

// Update modifies an existing category.
func (r *CategoryRepo) Update(ctx context.Context, id, name, slug, description, imageURL string) (*model.Category, error) {
	var cat model.Category
	err := r.db.GetContext(ctx, &cat, `
		UPDATE categories
		SET name = $2, slug = $3, description = $4, image_url = NULLIF($5, '')
		WHERE id = $1
		RETURNING id, name, slug, description, image_url, created_at
	`, id, name, slug, description, imageURL)
	if err != nil {
		return nil, err
	}
	return &cat, nil
}

// Delete removes a category. Returns an error if it has active products.
func (r *CategoryRepo) Delete(ctx context.Context, id string) error {
	// Check for products first
	var count int
	err := r.db.GetContext(ctx, &count, `
		SELECT COUNT(*) FROM products WHERE category_id = $1 AND deleted_at IS NULL
	`, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("cannot delete category with %d active products", count)
	}

	_, err = r.db.ExecContext(ctx, `DELETE FROM categories WHERE id = $1`, id)
	return err
}

// Search returns categories matching a search term with product counts.
func (r *CategoryRepo) Search(ctx context.Context, search string) ([]model.Category, error) {
	var categories []model.Category
	err := r.db.SelectContext(ctx, &categories, `
		SELECT c.id, c.name, c.slug, c.description, c.image_url, c.created_at,
		       COUNT(p.id) FILTER (WHERE p.is_active = true AND p.deleted_at IS NULL) AS product_count
		FROM categories c
		LEFT JOIN products p ON p.category_id = c.id
		WHERE c.name ILIKE '%' || $1 || '%'
		   OR c.description ILIKE '%' || $1 || '%'
		GROUP BY c.id
		ORDER BY c.name ASC
	`, search)
	return categories, err
}
