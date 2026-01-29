package controller

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"task-management-system/backend/internal/adapter/http/generated/openapi"
	"task-management-system/backend/internal/domain/task"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// HandleInternalServerError 内部サーバーエラーを返す
func HandleInternalServerError(ctx echo.Context, err error) error {
	// エラーの詳細をログに出力
	ctx.Logger().Errorf("Internal server error: %v", err)
	return ctx.JSON(http.StatusInternalServerError, openapi.ModelsCommonBadRequestError{
		Code:    openapi.BADREQUEST,
		Message: "An internal server error occurred",
		Details: err.Error(),
	})
}

// HandleBadRequest バッドリクエストエラーを返す
func HandleBadRequest(ctx echo.Context, message string, details interface{}) error {
	return ctx.JSON(http.StatusBadRequest, openapi.ModelsCommonBadRequestError{
		Code:    openapi.BADREQUEST,
		Message: message,
		Details: details,
	})
}

// HandleNotFound ノットファウンドエラーを返す
func HandleNotFound(ctx echo.Context, message string) error {
	return ctx.JSON(http.StatusNotFound, openapi.ModelsCommonNotFoundError{
		Code:    openapi.NOTFOUND,
		Message: message,
	})
}

// HandleUnauthorized 認証エラーを返す
func HandleUnauthorized(ctx echo.Context, message string) error {
	return ctx.JSON(http.StatusUnauthorized, openapi.ModelsCommonUnauthorizedError{
		Code:    openapi.UNAUTHORIZED,
		Message: message,
	})
}

// HandleForbidden 禁止エラーを返す
func HandleForbidden(ctx echo.Context, message string) error {
	return ctx.JSON(http.StatusForbidden, openapi.ModelsCommonForbiddenError{
		Code:    openapi.FORBIDDEN,
		Message: message,
	})
}

// HandleValidationError バリデーションエラーを返す
func HandleValidationError(ctx echo.Context, message string, details interface{}) error {
	return HandleBadRequest(ctx, message, details)
}

// IsNotFoundError エラーがNotFoundエラーかどうかを判定
func IsNotFoundError(err error) bool {
	// TODO: カスタムエラー型を定義して、より詳細な判定を行う
	return errors.Is(err, echo.ErrNotFound)
}

// IsBadRequestError エラーがBadRequestエラーかどうかを判定
func IsBadRequestError(err error) bool {
	// TODO: カスタムエラー型を定義して、より詳細な判定を行う
	return errors.Is(err, echo.ErrBadRequest)
}

// ValidationError バリデーションエラー
type ValidationError struct {
	Field   string
	Message string
}

// ValidateTaskRequest タスクリクエストの基本バリデーション
func ValidateTaskRequest(title, date string, taskItemsCount int) []ValidationError {
	var errors []ValidationError

	// titleのバリデーション
	if len(title) == 0 {
		errors = append(errors, ValidationError{
			Field:   "title",
			Message: "titleは1文字以上である必要があります",
		})
	}

	// dateのバリデーション
	if date == "" {
		errors = append(errors, ValidationError{
			Field:   "date",
			Message: "dateは1文字以上である必要があります",
		})
	} else if _, err := time.Parse("2006-01-02", date); err != nil {
		errors = append(errors, ValidationError{
			Field:   "date",
			Message: "dateは有効な日付形式である必要があります",
		})
	}

	// taskItemsの最小数チェック
	if taskItemsCount == 0 {
		errors = append(errors, ValidationError{
			Field:   "taskItems",
			Message: "taskItemsは少なくとも1つ必要です",
		})
	}

	return errors
}

// ValidateCreateTaskItem タスクアイテム作成リクエストのバリデーション
func ValidateCreateTaskItem(item openapi.ModelsTaskCreateTaskItemRequest, index int) []ValidationError {
	var errors []ValidationError
	prefix := fmt.Sprintf("taskItems[%d]", index)

	// contentのバリデーション
	if len(item.Content) == 0 {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.content", prefix),
			Message: "contentは1文字以上である必要があります",
		})
	}

	// orderのバリデーション
	if item.Order < 0 {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.order", prefix),
			Message: "orderは0以上の整数である必要があります",
		})
	}

	// durationTimeのバリデーション
	switch item.DurationTime {
	case openapi.ModelsTaskCreateTaskItemRequestDurationTimeN15,
		openapi.ModelsTaskCreateTaskItemRequestDurationTimeN30,
		openapi.ModelsTaskCreateTaskItemRequestDurationTimeN45,
		openapi.ModelsTaskCreateTaskItemRequestDurationTimeN60:
		// 有効な値
	default:
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.durationTime", prefix),
			Message: "durationTimeは60、45、30、15のいずれかである必要があります",
		})
	}

	// priorityのバリデーション
	priority := task.Priority(item.Priority)
	if priority != task.PriorityHigh && priority != task.PriorityMedium && priority != task.PriorityLow {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.priority", prefix),
			Message: "priorityはHigh、Medium、Lowのいずれかである必要があります",
		})
	}

	// densityのバリデーション
	density := task.Density(item.Density)
	if density != task.DensityHigh && density != task.DensityMedium && density != task.DensityLow {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.density", prefix),
			Message: "densityはHigh、Medium、Lowのいずれかである必要があります",
		})
	}

	// statusのバリデーション（新規作成時はNotStartedのみ許可）
	status := task.Status(item.Status)
	if status != task.StatusNotStarted && status != task.StatusInProgress && status != task.StatusCompleted {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.status", prefix),
			Message: "statusはNotStarted、InProgress、Completedのいずれかである必要があります",
		})
	}

	return errors
}

// ValidateUpdateTaskItem タスクアイテム更新リクエストのバリデーション
func ValidateUpdateTaskItem(item openapi.ModelsTaskUpdateTaskItemRequest, index int) []ValidationError {
	var errors []ValidationError
	prefix := fmt.Sprintf("taskItems[%d]", index)

	// idのUUIDバリデーション
	if item.Id == "" {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.id", prefix),
			Message: "idは有効なUUIDである必要があります",
		})
	} else if _, err := uuid.Parse(item.Id); err != nil {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.id", prefix),
			Message: "idは有効なUUIDである必要があります",
		})
	}

	// contentのバリデーション
	if len(item.Content) == 0 {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.content", prefix),
			Message: "contentは1文字以上である必要があります",
		})
	}

	// orderのバリデーション
	if item.Order < 0 {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.order", prefix),
			Message: "orderは0以上の整数である必要があります",
		})
	}

	// durationTimeのバリデーション
	switch item.DurationTime {
	case openapi.N15, openapi.N30, openapi.N45, openapi.N60:
		// 有効な値
	default:
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.durationTime", prefix),
			Message: "durationTimeは60、45、30、15のいずれかである必要があります",
		})
	}

	// priorityのバリデーション
	priority := task.Priority(item.Priority)
	if priority != task.PriorityHigh && priority != task.PriorityMedium && priority != task.PriorityLow {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.priority", prefix),
			Message: "priorityはHigh、Medium、Lowのいずれかである必要があります",
		})
	}

	// densityのバリデーション
	density := task.Density(item.Density)
	if density != task.DensityHigh && density != task.DensityMedium && density != task.DensityLow {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.density", prefix),
			Message: "densityはHigh、Medium、Lowのいずれかである必要があります",
		})
	}

	// statusのバリデーション
	status := task.Status(item.Status)
	if status != task.StatusNotStarted && status != task.StatusInProgress && status != task.StatusCompleted {
		errors = append(errors, ValidationError{
			Field:   fmt.Sprintf("%s.status", prefix),
			Message: "statusはNotStarted、InProgress、Completedのいずれかである必要があります",
		})
	}

	return errors
}

// ConvertValidationErrorsToMap バリデーションエラーをmap形式に変換
func ConvertValidationErrorsToMap(errors []ValidationError) []map[string]string {
	result := make([]map[string]string, 0, len(errors))
	for _, err := range errors {
		result = append(result, map[string]string{
			"field":   err.Field,
			"message": err.Message,
		})
	}
	return result
}
