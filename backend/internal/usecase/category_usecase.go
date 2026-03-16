package usecase

import (
	"context"
	"fmt"

	"task-management-system/backend/internal/domain/category"
	"task-management-system/backend/internal/port/repository"
)

// CategoryUsecase カテゴリーユースケース
type CategoryUsecase struct {
	categoryRepo repository.CategoryRepository
}

// NewCategoryUsecase カテゴリーユースケースを作成
func NewCategoryUsecase(categoryRepo repository.CategoryRepository) *CategoryUsecase {
	return &CategoryUsecase{
		categoryRepo: categoryRepo,
	}
}

// ListCategories オーナーIDでカテゴリー一覧を取得
func (u *CategoryUsecase) ListCategories(ctx context.Context, ownerID string) ([]*category.Category, error) {
	return u.categoryRepo.ListByOwnerID(ctx, ownerID)
}

// CreateCategory カテゴリーを作成
func (u *CategoryUsecase) CreateCategory(ctx context.Context, ownerID string, name string) (*category.Category, error) {
	if name == "" {
		return nil, fmt.Errorf("name is required")
	}
	return u.categoryRepo.Create(ctx, ownerID, name)
}

// UpdateCategory カテゴリーを更新
func (u *CategoryUsecase) UpdateCategory(ctx context.Context, categoryID string, ownerID string, name string) (*category.Category, error) {
	if name == "" {
		return nil, fmt.Errorf("name is required")
	}
	cat, err := u.categoryRepo.GetByID(ctx, categoryID)
	if err != nil {
		return nil, err
	}
	if cat == nil {
		return nil, fmt.Errorf("category not found: %s", categoryID)
	}
	if cat.OwnerID != ownerID {
		return nil, fmt.Errorf("category not owned by account")
	}
	return u.categoryRepo.Update(ctx, categoryID, name)
}

// DeleteCategory カテゴリーを削除
func (u *CategoryUsecase) DeleteCategory(ctx context.Context, categoryID string, ownerID string) error {
	cat, err := u.categoryRepo.GetByID(ctx, categoryID)
	if err != nil {
		return err
	}
	if cat == nil {
		return fmt.Errorf("category not found: %s", categoryID)
	}
	if cat.OwnerID != ownerID {
		return fmt.Errorf("category not owned by account")
	}
	return u.categoryRepo.Delete(ctx, categoryID)
}
