package db

import (
	"context"
	"errors"
	"fmt"

	dbgen "task-management-system/backend/internal/adapter/gateway/db/sqlc/generated"
	"task-management-system/backend/internal/domain/category"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// CategoryRepository カテゴリーリポジトリ
type CategoryRepository struct {
	queries *dbgen.Queries
}

// NewCategoryRepository カテゴリーリポジトリを作成
func NewCategoryRepository(db dbgen.DBTX) *CategoryRepository {
	return &CategoryRepository{
		queries: dbgen.New(db),
	}
}

func mustParseUUID(s string) (pgtype.UUID, error) {
	parsed, err := uuid.Parse(s)
	if err != nil {
		return pgtype.UUID{}, fmt.Errorf("invalid uuid: %w", err)
	}
	var pgUUID pgtype.UUID
	if err := pgUUID.Scan(parsed.String()); err != nil {
		return pgtype.UUID{}, err
	}
	return pgUUID, nil
}

func categoryFromRow(c dbgen.Category) *category.Category {
	return &category.Category{
		ID:        UUIDFromPgtype(c.ID),
		OwnerID:   UUIDFromPgtype(c.OwnerID),
		Name:      c.Name,
		CreatedAt: c.CreatedAt.Time,
		UpdatedAt: c.UpdatedAt.Time,
	}
}

// ListByOwnerID オーナーIDでカテゴリー一覧を取得
func (r *CategoryRepository) ListByOwnerID(ctx context.Context, ownerID string) ([]*category.Category, error) {
	pgOwnerID, err := mustParseUUID(ownerID)
	if err != nil {
		return nil, err
	}
	list, err := r.queries.ListCategoriesByOwnerID(ctx, pgOwnerID)
	if err != nil {
		return nil, fmt.Errorf("list categories: %w", err)
	}
	out := make([]*category.Category, 0, len(list))
	for _, c := range list {
		out = append(out, categoryFromRow(c))
	}
	return out, nil
}

// GetByID カテゴリーIDで取得
func (r *CategoryRepository) GetByID(ctx context.Context, categoryID string) (*category.Category, error) {
	pgID, err := mustParseUUID(categoryID)
	if err != nil {
		return nil, err
	}
	c, err := r.queries.GetCategoryByID(ctx, pgID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("get category: %w", err)
	}
	return categoryFromRow(c), nil
}

// Create カテゴリーを作成
func (r *CategoryRepository) Create(ctx context.Context, ownerID string, name string) (*category.Category, error) {
	pgOwnerID, err := mustParseUUID(ownerID)
	if err != nil {
		return nil, err
	}
	c, err := r.queries.CreateCategory(ctx, dbgen.CreateCategoryParams{
		OwnerID: pgOwnerID,
		Name:    name,
	})
	if err != nil {
		return nil, fmt.Errorf("create category: %w", err)
	}
	return categoryFromRow(c), nil
}

// Update カテゴリーを更新
func (r *CategoryRepository) Update(ctx context.Context, categoryID string, name string) (*category.Category, error) {
	pgID, err := mustParseUUID(categoryID)
	if err != nil {
		return nil, err
	}
	c, err := r.queries.UpdateCategory(ctx, dbgen.UpdateCategoryParams{
		ID:   pgID,
		Name: name,
	})
	if err != nil {
		return nil, fmt.Errorf("update category: %w", err)
	}
	return categoryFromRow(c), nil
}

// Delete カテゴリーを削除
func (r *CategoryRepository) Delete(ctx context.Context, categoryID string) error {
	pgID, err := mustParseUUID(categoryID)
	if err != nil {
		return err
	}
	if err := r.queries.DeleteCategory(ctx, pgID); err != nil {
		return fmt.Errorf("delete category: %w", err)
	}
	return nil
}
