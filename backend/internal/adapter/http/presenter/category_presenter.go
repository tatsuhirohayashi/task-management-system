package presenter

import (
	"task-management-system/backend/internal/adapter/http/generated/openapi"
	"task-management-system/backend/internal/domain/category"
)

// ToCategoryResponse カテゴリードメインをAPIレスポンスに変換
func ToCategoryResponse(c *category.Category) openapi.ModelsCategoryCategoryResponse {
	return openapi.ModelsCategoryCategoryResponse{
		Id:        c.ID,
		OwnerId:   c.OwnerID,
		Name:      c.Name,
		CreatedAt: c.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: c.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// ToCategoryResponseList カテゴリー一覧をAPIレスポンスの配列に変換
func ToCategoryResponseList(categories []*category.Category) []openapi.ModelsCategoryCategoryResponse {
	out := make([]openapi.ModelsCategoryCategoryResponse, 0, len(categories))
	for _, c := range categories {
		out = append(out, ToCategoryResponse(c))
	}
	return out
}
