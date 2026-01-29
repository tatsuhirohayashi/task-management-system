package handler

import (
	"task-management-system/backend/internal/adapter/http/controller"
	"task-management-system/backend/internal/adapter/http/generated/openapi"

	"github.com/labstack/echo/v4"
)

// Server ServerInterfaceの実装
type Server struct {
	taskController    *controller.TaskController
	accountController *controller.AccountController
}

// NewServer サーバーを作成
func NewServer(taskController *controller.TaskController, accountController *controller.AccountController) *Server {
	return &Server{
		taskController:    taskController,
		accountController: accountController,
	}
}

// TasksListTasks タスク一覧を取得
func (s *Server) TasksListTasks(ctx echo.Context, params openapi.TasksListTasksParams) error {
	return s.taskController.ListTasks(ctx, params)
}

// AccountsCreateOrGetAccount アカウント作成または取得（OAuth）
func (s *Server) AccountsCreateOrGetAccount(ctx echo.Context) error {
	var request openapi.ModelsAccountCreateOrGetAccountRequest
	if err := ctx.Bind(&request); err != nil {
		return ctx.JSON(400, map[string]string{"error": "Invalid request body"})
	}
	return s.accountController.CreateOrGetAccount(ctx, request)
}

// AccountsGetAccountByEmail メールアドレスでアカウントを取得
func (s *Server) AccountsGetAccountByEmail(ctx echo.Context, params openapi.AccountsGetAccountByEmailParams) error {
	return s.accountController.GetAccountByEmail(ctx, params)
}

// AccountsGetCurrentAccount 現在のアカウントを取得
func (s *Server) AccountsGetCurrentAccount(ctx echo.Context) error {
	return s.accountController.GetCurrentAccount(ctx)
}

// AccountsGetAccountById アカウントIDでアカウントを取得
func (s *Server) AccountsGetAccountById(ctx echo.Context, accountId string) error {
	return s.accountController.GetAccountByID(ctx, accountId)
}

// TaskItemsUpdateTaskItemOutput タスクアイテムのアウトプットを更新
func (s *Server) TaskItemsUpdateTaskItemOutput(ctx echo.Context, taskItemId string) error {
	var request openapi.ModelsTaskUpdateTaskItemOutputRequest
	if err := ctx.Bind(&request); err != nil {
		return ctx.JSON(400, map[string]string{"error": "Invalid request body"})
	}
	return s.taskController.UpdateTaskItemOutput(ctx, taskItemId, request)
}

// TasksCreateTask タスクを作成
func (s *Server) TasksCreateTask(ctx echo.Context) error {
	var request openapi.ModelsTaskCreateTaskRequest
	if err := ctx.Bind(&request); err != nil {
		ctx.Logger().Errorf("Failed to bind request body: %v", err)
		return ctx.JSON(400, openapi.ModelsCommonBadRequestError{
			Code:    "BAD_REQUEST",
			Message: "Invalid request body",
			Details: err.Error(),
		})
	}
	return s.taskController.CreateTask(ctx, request)
}

// TasksDeleteTask タスクを削除
func (s *Server) TasksDeleteTask(ctx echo.Context, taskId string) error {
	return s.taskController.DeleteTask(ctx, taskId)
}

// TasksGetTaskById タスクIDでタスクを取得
func (s *Server) TasksGetTaskById(ctx echo.Context, taskId string) error {
	return s.taskController.GetTaskByID(ctx, taskId)
}

// TasksUpdateTask タスクを更新
func (s *Server) TasksUpdateTask(ctx echo.Context, taskId string) error {
	var request openapi.ModelsTaskUpdateTaskRequest
	if err := ctx.Bind(&request); err != nil {
		return ctx.JSON(400, map[string]string{"error": "Invalid request body"})
	}
	return s.taskController.UpdateTask(ctx, taskId, request)
}

// TasksUpdateTaskReview タスクの振り返りを更新
func (s *Server) TasksUpdateTaskReview(ctx echo.Context, taskId string) error {
	return s.taskController.UpdateTaskReview(ctx, taskId)
}
