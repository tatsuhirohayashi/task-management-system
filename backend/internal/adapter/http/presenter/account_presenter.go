package presenter

import (
	"task-management-system/backend/internal/adapter/http/generated/openapi"
	"task-management-system/backend/internal/domain/account"
)

// ToAccountResponse アカウントドメインエンティティをAPIレスポンスに変換
func ToAccountResponse(acc *account.Account) openapi.ModelsAccountAccountResponse {
	// fullNameを計算
	fullName := acc.FirstName + " " + acc.LastName

	// タイムスタンプをISO 8601形式に変換
	createdAt := acc.CreatedAt.Format("2006-01-02T15:04:05Z07:00")
	updatedAt := acc.UpdatedAt.Format("2006-01-02T15:04:05Z07:00")

	var lastLoginAt *string
	if acc.LastLoginAt != nil {
		formatted := acc.LastLoginAt.Format("2006-01-02T15:04:05Z07:00")
		lastLoginAt = &formatted
	}

	var thumbnail *string
	if acc.Thumbnail != nil {
		thumbnail = acc.Thumbnail
	}

	return openapi.ModelsAccountAccountResponse{
		Id:          acc.ID,
		Email:       acc.Email,
		FirstName:   acc.FirstName,
		LastName:    acc.LastName,
		FullName:    fullName,
		Thumbnail:   thumbnail,
		LastLoginAt: lastLoginAt,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}
}
