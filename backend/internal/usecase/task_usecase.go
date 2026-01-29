package usecase

import (
	"context"
	"fmt"

	"task-management-system/backend/internal/domain/account"
	"task-management-system/backend/internal/domain/task"
	"task-management-system/backend/internal/port/repository"
)

// TaskUsecase タスクユースケース
type TaskUsecase struct {
	taskRepo    repository.TaskRepository
	accountRepo repository.AccountRepository
}

// NewTaskUsecase タスクユースケースを作成
func NewTaskUsecase(taskRepo repository.TaskRepository, accountRepo repository.AccountRepository) *TaskUsecase {
	return &TaskUsecase{
		taskRepo:    taskRepo,
		accountRepo: accountRepo,
	}
}

// ListTasks タスク一覧を取得
// 自分のタスクのみを取得するAPIのため、すべてのタスクは同じオーナーを持つ
func (u *TaskUsecase) ListTasks(ctx context.Context, condition task.ListTasksCondition) ([]*task.Task, *account.Account, error) {
	// タスクを取得
	tasks, err := u.taskRepo.ListTasks(ctx, condition)
	if err != nil {
		return nil, nil, err
	}

	if len(tasks) == 0 {
		return []*task.Task{}, nil, nil
	}

	// 最初のタスクのオーナーIDを使用（すべてのタスクは同じオーナーを持つ）
	ownerID := tasks[0].OwnerID

	// アカウントを取得
	accounts, err := u.accountRepo.GetAccountsByIDs(ctx, []string{ownerID})
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, fmt.Errorf("owner account not found: %s", ownerID)
	}

	owner := accounts[0]

	return tasks, owner, nil
}

// GetTaskByID タスクIDでタスクを取得
func (u *TaskUsecase) GetTaskByID(ctx context.Context, taskID string) (*task.Task, *account.Account, error) {
	// タスクを取得
	t, err := u.taskRepo.GetTaskByID(ctx, taskID)
	if err != nil {
		return nil, nil, err
	}

	// タスクが見つからない場合
	if t == nil {
		return nil, nil, nil
	}

	// オーナーを取得
	accounts, err := u.accountRepo.GetAccountsByIDs(ctx, []string{t.OwnerID})
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, fmt.Errorf("owner account not found: %s", t.OwnerID)
	}

	owner := accounts[0]

	return t, owner, nil
}

// CreateTask タスクを作成
func (u *TaskUsecase) CreateTask(ctx context.Context, ownerID string, title string, date string, taskItems []task.CreateTaskItemInput) (*task.Task, *account.Account, error) {
	// タスクを作成
	createdTask, err := u.taskRepo.CreateTask(ctx, ownerID, title, date, taskItems)
	if err != nil {
		return nil, nil, err
	}

	// オーナーを取得
	accounts, err := u.accountRepo.GetAccountsByIDs(ctx, []string{ownerID})
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, fmt.Errorf("owner account not found: %s", ownerID)
	}

	owner := accounts[0]

	return createdTask, owner, nil
}

// UpdateTask タスクを更新
func (u *TaskUsecase) UpdateTask(ctx context.Context, taskID string, ownerID string, title string, date string, taskItems []task.UpdateTaskItemInput) (*task.Task, *account.Account, error) {
	// タスクを更新
	updatedTask, err := u.taskRepo.UpdateTask(ctx, taskID, ownerID, title, date, taskItems)
	if err != nil {
		return nil, nil, err
	}

	// オーナーを取得
	accounts, err := u.accountRepo.GetAccountsByIDs(ctx, []string{ownerID})
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, fmt.Errorf("owner account not found: %s", ownerID)
	}

	owner := accounts[0]

	return updatedTask, owner, nil
}

// DeleteTask タスクを削除
func (u *TaskUsecase) DeleteTask(ctx context.Context, taskID string, ownerID string) error {
	// 既存のタスクを取得してオーナーチェック
	existingTask, err := u.taskRepo.GetTaskByID(ctx, taskID)
	if err != nil {
		return err
	}
	if existingTask == nil {
		return fmt.Errorf("task not found: %s", taskID)
	}
	if existingTask.OwnerID != ownerID {
		return fmt.Errorf("you do not have permission to delete this task")
	}

	// タスクを削除（ON DELETE CASCADEにより、子タスクも自動的に削除される）
	if err := u.taskRepo.DeleteTask(ctx, taskID); err != nil {
		return err
	}

	return nil
}

// UpdateTaskReview タスクの振り返りを更新
func (u *TaskUsecase) UpdateTaskReview(ctx context.Context, taskID string, ownerID string, review *string) (*task.Task, *account.Account, error) {
	// 既存のタスクを取得してオーナーチェック
	existingTask, err := u.taskRepo.GetTaskByID(ctx, taskID)
	if err != nil {
		return nil, nil, err
	}
	if existingTask == nil {
		return nil, nil, fmt.Errorf("task not found")
	}
	if existingTask.OwnerID != ownerID {
		return nil, nil, fmt.Errorf("you do not have permission to update this task review")
	}

	// タスクの振り返りを更新
	if err := u.taskRepo.UpdateTaskReview(ctx, taskID, review); err != nil {
		return nil, nil, err
	}

	// 更新されたタスクを再取得
	updatedTask, err := u.taskRepo.GetTaskByID(ctx, taskID)
	if err != nil {
		return nil, nil, err
	}
	if updatedTask == nil {
		return nil, nil, fmt.Errorf("failed to update task review")
	}

	// オーナーを取得
	accounts, err := u.accountRepo.GetAccountsByIDs(ctx, []string{ownerID})
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, fmt.Errorf("owner account not found: %s", ownerID)
	}

	owner := accounts[0]

	return updatedTask, owner, nil
}

// UpdateTaskItemOutput タスクアイテムのアウトプットを更新
func (u *TaskUsecase) UpdateTaskItemOutput(ctx context.Context, taskItemID string, ownerID string, output string) (*task.Task, *account.Account, error) {
	// タスクアイテムIDからタスクを取得
	t, err := u.taskRepo.GetTaskByTaskItemID(ctx, taskItemID)
	if err != nil {
		return nil, nil, err
	}
	if t == nil {
		return nil, nil, fmt.Errorf("task not found")
	}

	// オーナーチェック
	if t.OwnerID != ownerID {
		return nil, nil, fmt.Errorf("you do not have permission to update this task item")
	}

	// タスクアイテムが存在するか確認
	var taskItemExists bool
	for _, item := range t.TaskItems {
		if item.ID == taskItemID {
			taskItemExists = true
			break
		}
	}
	if !taskItemExists {
		return nil, nil, fmt.Errorf("task item not found")
	}

	// タスクアイテムのアウトプットを更新（ステータスはCompletedに）
	if err := u.taskRepo.UpdateTaskItemOutput(ctx, taskItemID, output); err != nil {
		return nil, nil, err
	}

	// 更新されたタスクを再取得
	updatedTask, err := u.taskRepo.GetTaskByID(ctx, t.ID)
	if err != nil {
		return nil, nil, err
	}
	if updatedTask == nil {
		return nil, nil, fmt.Errorf("failed to update task item")
	}

	// オーナーを取得
	accounts, err := u.accountRepo.GetAccountsByIDs(ctx, []string{ownerID})
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, fmt.Errorf("owner account not found: %s", ownerID)
	}

	owner := accounts[0]

	return updatedTask, owner, nil
}
