package service

import (
	"context"
	"fmt"

	"github.com/muhifn/rdp-api/internal/model"
	"github.com/muhifn/rdp-api/internal/pkg"
	"github.com/muhifn/rdp-api/internal/repository"
)

// CategoryService handles category business logic.
type CategoryService struct {
	categoryRepo *repository.CategoryRepo
}

func NewCategoryService(categoryRepo *repository.CategoryRepo) *CategoryService {
	return &CategoryService{categoryRepo: categoryRepo}
}

// List returns all categories, optionally with product counts.
func (s *CategoryService) List(ctx context.Context, withCount bool) ([]model.Category, error) {
	return s.categoryRepo.List(ctx, withCount)
}

// GetByID returns a single category by ID.
func (s *CategoryService) GetByID(ctx context.Context, id string) (*model.Category, error) {
	if !pkg.IsValidUUID(id) {
		return nil, fmt.Errorf("invalid category ID format")
	}
	return s.categoryRepo.FindByID(ctx, id)
}

// Search returns categories matching a search term.
func (s *CategoryService) Search(ctx context.Context, search string) ([]model.Category, error) {
	if search == "" {
		return s.categoryRepo.List(ctx, true)
	}
	return s.categoryRepo.Search(ctx, search)
}

// Create creates a new category.
func (s *CategoryService) Create(ctx context.Context, name, description, imageURL string) (*model.Category, error) {
	name = pkg.SanitizePlainText(name)
	description = pkg.SanitizePlainText(description)

	if !pkg.ValidateStringLength(name, 1, 100) {
		return nil, fmt.Errorf("name must be between 1 and 100 characters")
	}

	slug := slugify(name)
	return s.categoryRepo.Create(ctx, name, slug, description, imageURL)
}

// Update modifies an existing category.
func (s *CategoryService) Update(ctx context.Context, id, name, description, imageURL string) (*model.Category, error) {
	if !pkg.IsValidUUID(id) {
		return nil, fmt.Errorf("invalid category ID format")
	}

	name = pkg.SanitizePlainText(name)
	description = pkg.SanitizePlainText(description)

	if !pkg.ValidateStringLength(name, 1, 100) {
		return nil, fmt.Errorf("name must be between 1 and 100 characters")
	}

	slug := slugify(name)
	return s.categoryRepo.Update(ctx, id, name, slug, description, imageURL)
}

// Delete removes a category.
func (s *CategoryService) Delete(ctx context.Context, id string) error {
	if !pkg.IsValidUUID(id) {
		return fmt.Errorf("invalid category ID format")
	}
	return s.categoryRepo.Delete(ctx, id)
}
