package controller

import (
	"fmt"
	"net/http"
	"strings"

	"task-management-system/backend/internal/adapter/http/generated/openapi"
	"task-management-system/backend/internal/adapter/http/presenter"
	"task-management-system/backend/internal/domain/task"
	"task-management-system/backend/internal/usecase"

	"github.com/labstack/echo/v4"
)

// TaskController タスクコントローラー
type TaskController struct {
	taskUsecase *usecase.TaskUsecase
}

// NewTaskController タスクコントローラーを作成
func NewTaskController(taskUsecase *usecase.TaskUsecase) *TaskController {
	return &TaskController{
		taskUsecase: taskUsecase,
	}
}

// ListTasks タスク一覧を取得
func (c *TaskController) ListTasks(ctx echo.Context, params openapi.TasksListTasksParams) error {
	// 検索条件を構築
	condition := task.ListTasksCondition{}

	if params.OwnerId != nil {
		condition.OwnerID = params.OwnerId
	}

	if params.YearMonth != nil {
		condition.YearMonth = params.YearMonth
	}

	if params.Q != nil {
		condition.Keyword = params.Q
	}

	if params.Sort != nil {
		condition.Sort = params.Sort
	}

	// ユースケースを実行
	tasks, owner, err := c.taskUsecase.ListTasks(ctx.Request().Context(), condition)
	if err != nil {
		return HandleInternalServerError(ctx, err)
	}

	// タスクが0件の場合は空配列を返す
	if len(tasks) == 0 {
		return ctx.JSON(http.StatusOK, []openapi.ModelsTaskTaskResponse{})
	}

	// ownerがnilの場合はエラーを返す
	if owner == nil {
		return HandleInternalServerError(ctx, fmt.Errorf("owner account not found"))
	}

	// レスポンスに変換
	response := presenter.ToTaskResponseList(tasks, owner)

	return ctx.JSON(http.StatusOK, response)
}

// GetTaskByID タスクIDでタスクを取得
func (c *TaskController) GetTaskByID(ctx echo.Context, taskId string) error {
	// ユースケースを実行
	t, owner, err := c.taskUsecase.GetTaskByID(ctx.Request().Context(), taskId)
	if err != nil {
		return HandleInternalServerError(ctx, err)
	}

	// タスクが見つからない場合
	if t == nil {
		return HandleNotFound(ctx, "Task not found")
	}

	// レスポンスに変換
	response := presenter.ToTaskResponse(t, owner)

	return ctx.JSON(http.StatusOK, response)
}

// CreateTask タスクを作成
func (c *TaskController) CreateTask(ctx echo.Context, request openapi.ModelsTaskCreateTaskRequest) error {
	// リクエストからownerIdを取得
	ownerID := request.OwnerId
	if ownerID == "" {
		return HandleBadRequest(ctx, "Owner ID is required", nil)
	}

	ctx.Logger().Infof("CreateTask: ownerId=%s, title=%s, date=%s, taskItems=%d",
		ownerID, request.Title, request.Date, len(request.TaskItems))

	// バリデーション: 基本項目
	validationErrors := ValidateTaskRequest(request.Title, request.Date, len(request.TaskItems))
	if len(validationErrors) > 0 {
		return HandleValidationError(ctx, "Validation failed", map[string]interface{}{
			"errors": ConvertValidationErrorsToMap(validationErrors),
		})
	}

	// リクエストをドメインの入力に変換
	taskItems := make([]task.CreateTaskItemInput, 0, len(request.TaskItems))

	for i, item := range request.TaskItems {
		// バリデーション: タスクアイテム
		itemErrors := ValidateCreateTaskItem(item, i)
		if len(itemErrors) > 0 {
			validationErrors = append(validationErrors, itemErrors...)
			continue
		}

		// durationTimeを変換
		var durationTime task.DurationTime
		switch item.DurationTime {
		case openapi.ModelsTaskCreateTaskItemRequestDurationTimeN15:
			durationTime = task.DurationTime15
		case openapi.ModelsTaskCreateTaskItemRequestDurationTimeN30:
			durationTime = task.DurationTime30
		case openapi.ModelsTaskCreateTaskItemRequestDurationTimeN45:
			durationTime = task.DurationTime45
		case openapi.ModelsTaskCreateTaskItemRequestDurationTimeN60:
			durationTime = task.DurationTime60
		}

		// ビジネスルール: 新規作成時はStatusはNotStartedに固定
		// API設計書によると「新規作成時はReviewはnull、Outputはnull、StatusはNot Started」
		status := task.StatusNotStarted

		taskItems = append(taskItems, task.CreateTaskItemInput{
			Priority:     task.Priority(item.Priority),
			Density:      task.Density(item.Density),
			DurationTime: durationTime,
			Content:      item.Content,
			IsRequired:   item.IsRequired,
			Order:        item.Order,
			Status:       status,
		})
	}

	// バリデーションエラーがある場合は返す
	if len(validationErrors) > 0 {
		return HandleValidationError(ctx, "Validation failed", map[string]interface{}{
			"errors": ConvertValidationErrorsToMap(validationErrors),
		})
	}

	// ユースケースを実行
	ctx.Logger().Infof("Calling taskUsecase.CreateTask: ownerId=%s, title=%s, date=%s, taskItemsCount=%d",
		ownerID, request.Title, request.Date, len(taskItems))
	createdTask, owner, err := c.taskUsecase.CreateTask(ctx.Request().Context(), ownerID, request.Title, request.Date, taskItems)
	if err != nil {
		ctx.Logger().Errorf("taskUsecase.CreateTask failed: %v", err)
		return HandleInternalServerError(ctx, err)
	}

	if createdTask == nil {
		ctx.Logger().Errorf("createdTask is nil after taskUsecase.CreateTask")
		return HandleInternalServerError(ctx, fmt.Errorf("created task is nil"))
	}

	if owner == nil {
		ctx.Logger().Errorf("owner is nil after taskUsecase.CreateTask")
		return HandleInternalServerError(ctx, fmt.Errorf("owner is nil"))
	}

	// レスポンスに変換
	ctx.Logger().Infof("Converting to response: taskId=%s, ownerId=%s", createdTask.ID, owner.ID)
	response := presenter.ToTaskResponse(createdTask, owner)

	return ctx.JSON(http.StatusCreated, response)
}

// UpdateTask タスクを更新
func (c *TaskController) UpdateTask(ctx echo.Context, taskId string, request openapi.ModelsTaskUpdateTaskRequest) error {
	// リクエストからownerIdを取得
	ownerID := request.OwnerId
	if ownerID == "" {
		return HandleBadRequest(ctx, "Owner ID is required", nil)
	}

	// バリデーション: 基本項目
	validationErrors := ValidateTaskRequest(request.Title, request.Date, len(request.TaskItems))
	if len(validationErrors) > 0 {
		return HandleValidationError(ctx, "Validation failed", map[string]interface{}{
			"errors": ConvertValidationErrorsToMap(validationErrors),
		})
	}

	// リクエストをドメインの入力に変換
	taskItems := make([]task.UpdateTaskItemInput, 0, len(request.TaskItems))

	for i, item := range request.TaskItems {
		// バリデーション: タスクアイテム
		itemErrors := ValidateUpdateTaskItem(item, i)
		if len(itemErrors) > 0 {
			validationErrors = append(validationErrors, itemErrors...)
			continue
		}

		// durationTimeを変換
		var durationTime task.DurationTime
		switch item.DurationTime {
		case openapi.N15:
			durationTime = task.DurationTime15
		case openapi.N30:
			durationTime = task.DurationTime30
		case openapi.N45:
			durationTime = task.DurationTime45
		case openapi.N60:
			durationTime = task.DurationTime60
		}

		taskItems = append(taskItems, task.UpdateTaskItemInput{
			ID:           item.Id,
			Priority:     task.Priority(item.Priority),
			Density:      task.Density(item.Density),
			DurationTime: durationTime,
			Content:      item.Content,
			IsRequired:   item.IsRequired,
			Order:        item.Order,
			Status:       task.Status(item.Status),
		})
	}

	// バリデーションエラーがある場合は返す
	if len(validationErrors) > 0 {
		return HandleValidationError(ctx, "Validation failed", map[string]interface{}{
			"errors": ConvertValidationErrorsToMap(validationErrors),
		})
	}

	// ユースケースを実行
	updatedTask, owner, err := c.taskUsecase.UpdateTask(ctx.Request().Context(), taskId, ownerID, request.Title, request.Date, taskItems)
	if err != nil {
		// タスクが見つからない場合
		if strings.Contains(err.Error(), "task not found") {
			return HandleNotFound(ctx, "Task not found")
		}
		// 権限がない場合
		if strings.Contains(err.Error(), "permission") {
			return HandleForbidden(ctx, "You do not have permission to update this task")
		}
		return HandleInternalServerError(ctx, err)
	}

	// レスポンスに変換
	response := presenter.ToTaskResponse(updatedTask, owner)

	return ctx.JSON(http.StatusOK, response)
}

// DeleteTask タスクを削除
func (c *TaskController) DeleteTask(ctx echo.Context, taskId string) error {
	// リクエストボディをパース
	var request openapi.ModelsTaskDeleteTaskRequest
	if err := ctx.Bind(&request); err != nil {
		return HandleBadRequest(ctx, "Invalid request body", err)
	}

	// リクエストからownerIdを取得
	ownerID := request.OwnerId
	if ownerID == "" {
		return HandleBadRequest(ctx, "Owner ID is required", nil)
	}

	// ユースケースを実行
	err := c.taskUsecase.DeleteTask(ctx.Request().Context(), taskId, ownerID)
	if err != nil {
		// タスクが見つからない場合
		if strings.Contains(err.Error(), "task not found") {
			return HandleNotFound(ctx, "Task not found")
		}
		// 権限がない場合
		if strings.Contains(err.Error(), "permission") {
			return HandleForbidden(ctx, "You do not have permission to delete this task")
		}
		return HandleInternalServerError(ctx, err)
	}

	// レスポンスを返す
	return ctx.JSON(http.StatusOK, openapi.ModelsTaskDeleteTaskResponse{
		Success: true,
	})
}

// UpdateTaskItemOutput タスクアイテムのアウトプットを更新
func (c *TaskController) UpdateTaskItemOutput(ctx echo.Context, taskItemId string, request openapi.ModelsTaskUpdateTaskItemOutputRequest) error {
	// リクエストからownerIdを取得
	ownerID := request.OwnerId
	if ownerID == "" {
		return HandleBadRequest(ctx, "Owner ID is required", nil)
	}

	// バリデーション: outputの最小長チェック
	if len(request.Output) == 0 {
		return HandleValidationError(ctx, "Validation failed", map[string]interface{}{
			"errors": []map[string]string{
				{"field": "output", "message": "outputは1文字以上である必要があります"},
			},
		})
	}

	// ユースケースを実行
	updatedTask, owner, err := c.taskUsecase.UpdateTaskItemOutput(ctx.Request().Context(), taskItemId, ownerID, request.Output)
	if err != nil {
		// タスクが見つからない場合
		if strings.Contains(err.Error(), "task not found") {
			return HandleNotFound(ctx, "Task not found")
		}
		// タスクアイテムが見つからない場合
		if strings.Contains(err.Error(), "task item not found") {
			return HandleNotFound(ctx, "Task item not found")
		}
		// 権限がない場合
		if strings.Contains(err.Error(), "permission") {
			return HandleForbidden(ctx, "You do not have permission to update this task item")
		}
		return HandleInternalServerError(ctx, err)
	}

	// レスポンスに変換
	response := presenter.ToTaskResponse(updatedTask, owner)

	return ctx.JSON(http.StatusOK, response)
}

// UpdateTaskReview タスクの振り返りを更新
func (c *TaskController) UpdateTaskReview(ctx echo.Context, taskId string) error {
	// リクエストボディをパース
	var request openapi.ModelsTaskUpdateTaskReviewRequest
	if err := ctx.Bind(&request); err != nil {
		return HandleBadRequest(ctx, "Invalid request body", err)
	}

	// リクエストからownerIdを取得
	ownerID := request.OwnerId
	if ownerID == "" {
		return HandleBadRequest(ctx, "Owner ID is required", nil)
	}

	// ユースケースを実行
	updatedTask, owner, err := c.taskUsecase.UpdateTaskReview(ctx.Request().Context(), taskId, ownerID, request.Review)
	if err != nil {
		// タスクが見つからない場合
		if strings.Contains(err.Error(), "task not found") {
			return HandleNotFound(ctx, "Task not found")
		}
		// 権限がない場合
		if strings.Contains(err.Error(), "permission") {
			return HandleForbidden(ctx, "You do not have permission to update this task review")
		}
		return HandleInternalServerError(ctx, err)
	}

	// レスポンスに変換
	response := presenter.ToTaskResponse(updatedTask, owner)

	return ctx.JSON(http.StatusOK, response)
}
