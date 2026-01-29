package repository

import (
	"context"

	"task-management-system/backend/internal/domain/account"
	"task-management-system/backend/internal/domain/task"
)

// TaskRepository タスクリポジトリインターフェース
type TaskRepository interface {
	ListTasks(ctx context.Context, condition task.ListTasksCondition) ([]*task.Task, error)
	GetTaskByID(ctx context.Context, taskID string) (*task.Task, error)
	GetTaskByTaskItemID(ctx context.Context, taskItemID string) (*task.Task, error)
	CreateTask(ctx context.Context, ownerID string, title string, date string, taskItems []task.CreateTaskItemInput) (*task.Task, error)
	UpdateTask(ctx context.Context, taskID string, ownerID string, title string, date string, taskItems []task.UpdateTaskItemInput) (*task.Task, error)
	UpdateTaskReview(ctx context.Context, taskID string, review *string) error
	UpdateTaskItemOutput(ctx context.Context, taskItemID string, output string) error
	DeleteTask(ctx context.Context, taskID string) error
}

// AccountRepository アカウントリポジトリインターフェース
type AccountRepository interface {
	GetAccountsByIDs(ctx context.Context, accountIDs []string) ([]*account.Account, error)
	GetAccountByID(ctx context.Context, accountID string) (*account.Account, error)
	GetAccountByEmail(ctx context.Context, email string) (*account.Account, error)
	CreateAccount(ctx context.Context, email string, firstName string, lastName string, provider string, providerAccountID string, thumbnail *string) (*account.Account, error)
}
