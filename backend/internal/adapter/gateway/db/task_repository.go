package db

import (
	"context"
	"errors"
	"fmt"
	"time"

	dbgen "task-management-system/backend/internal/adapter/gateway/db/sqlc/generated"
	"task-management-system/backend/internal/domain/task"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// TaskRepository タスクリポジトリ
type TaskRepository struct {
	queries *dbgen.Queries
	db      dbgen.DBTX
}

// NewTaskRepository タスクリポジトリを作成
func NewTaskRepository(db dbgen.DBTX) *TaskRepository {
	return &TaskRepository{
		queries: dbgen.New(db),
		db:      db,
	}
}

// ListTasks タスク一覧を取得
func (r *TaskRepository) ListTasks(ctx context.Context, condition task.ListTasksCondition) ([]*task.Task, error) {
	params := dbgen.ListTasksParams{}

	// ownerIdをUUIDに変換
	if condition.OwnerID != nil {
		ownerUUID, err := uuid.Parse(*condition.OwnerID)
		if err != nil {
			return nil, fmt.Errorf("invalid owner_id: %w", err)
		}
		var pgUUID pgtype.UUID
		if err := pgUUID.Scan(ownerUUID.String()); err != nil {
			return nil, fmt.Errorf("failed to convert owner_id to pgtype.UUID: %w", err)
		}
		params.OwnerID = pgUUID
	}

	// year-monthを設定
	if condition.YearMonth != nil {
		params.YearMonth = *condition.YearMonth
	}

	// keywordを設定
	if condition.Keyword != nil {
		params.Keyword = *condition.Keyword
	}

	// sortを設定
	if condition.Sort != nil {
		params.Sort = *condition.Sort
	}

	// タスクを取得
	tasks, err := r.queries.ListTasks(ctx, params)
	if err != nil {
		return nil, err
	}

	if len(tasks) == 0 {
		return []*task.Task{}, nil
	}

	// タスクIDのリストを取得
	taskIDs := make([]pgtype.UUID, 0, len(tasks))
	for _, t := range tasks {
		taskIDs = append(taskIDs, t.ID)
	}

	// タスクアイテムを取得
	taskItems, err := r.queries.GetTaskItemsByTaskIDs(ctx, taskIDs)
	if err != nil {
		return nil, err
	}

	// タスクアイテムをタスクIDでグループ化
	taskItemsMap := make(map[string][]dbgen.TaskItem)
	for _, item := range taskItems {
		taskID := UUIDFromPgtype(item.TaskID)
		taskItemsMap[taskID] = append(taskItemsMap[taskID], item)
	}

	// ドメインエンティティに変換
	result := make([]*task.Task, 0, len(tasks))
	for _, t := range tasks {
		taskID := UUIDFromPgtype(t.ID)
		ownerID := UUIDFromPgtype(t.OwnerID)

		// タスクアイテムを変換
		items := taskItemsMap[taskID]
		taskItemEntities := make([]task.TaskItem, 0, len(items))
		for _, item := range items {
			itemID := UUIDFromPgtype(item.ID)
			itemTaskID := UUIDFromPgtype(item.TaskID)

			var output *string
			if item.Output.Valid {
				output = &item.Output.String
			}

			taskItemEntities = append(taskItemEntities, task.TaskItem{
				ID:           itemID,
				TaskID:       itemTaskID,
				Priority:     task.Priority(item.Priority),
				Density:      task.Density(item.Density),
				DurationTime: task.DurationTime(item.DurationTime),
				Content:      item.Content,
				Output:       output,
				IsRequired:   item.IsRequired,
				Order:        item.Order,
				Status:       task.Status(item.Status),
				CreatedAt:    item.CreatedAt.Time,
				UpdatedAt:    item.UpdatedAt.Time,
			})
		}

		var review *string
		if t.Review.Valid {
			review = &t.Review.String
		}

		result = append(result, &task.Task{
			ID:        taskID,
			OwnerID:   ownerID,
			Title:     t.Title,
			Date:      t.Date.Time,
			Review:    review,
			TaskItems: taskItemEntities,
			CreatedAt: t.CreatedAt.Time,
			UpdatedAt: t.UpdatedAt.Time,
		})
	}

	return result, nil
}

// GetTaskByID タスクIDでタスクを取得
func (r *TaskRepository) GetTaskByID(ctx context.Context, taskID string) (*task.Task, error) {
	// taskIDをUUIDに変換
	taskUUID, err := uuid.Parse(taskID)
	if err != nil {
		return nil, fmt.Errorf("invalid task_id: %w", err)
	}
	var pgUUID pgtype.UUID
	if err := pgUUID.Scan(taskUUID.String()); err != nil {
		return nil, fmt.Errorf("failed to convert task_id to pgtype.UUID: %w", err)
	}

	// タスクを取得
	t, err := r.queries.GetTaskByID(ctx, pgUUID)
	if err != nil {
		// pgx.ErrNoRowsの場合はnilを返す（タスクが見つからない）
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// タスクアイテムを取得
	taskItems, err := r.queries.GetTaskItemsByTaskIDs(ctx, []pgtype.UUID{t.ID})
	if err != nil {
		return nil, err
	}

	// タスクアイテムを変換
	taskItemEntities := make([]task.TaskItem, 0, len(taskItems))
	for _, item := range taskItems {
		itemID := UUIDFromPgtype(item.ID)
		itemTaskID := UUIDFromPgtype(item.TaskID)

		var output *string
		if item.Output.Valid {
			output = &item.Output.String
		}

		taskItemEntities = append(taskItemEntities, task.TaskItem{
			ID:           itemID,
			TaskID:       itemTaskID,
			Priority:     task.Priority(item.Priority),
			Density:      task.Density(item.Density),
			DurationTime: task.DurationTime(item.DurationTime),
			Content:      item.Content,
			Output:       output,
			IsRequired:   item.IsRequired,
			Order:        item.Order,
			Status:       task.Status(item.Status),
			CreatedAt:    item.CreatedAt.Time,
			UpdatedAt:    item.UpdatedAt.Time,
		})
	}

	var review *string
	if t.Review.Valid {
		review = &t.Review.String
	}

	return &task.Task{
		ID:        UUIDFromPgtype(t.ID),
		OwnerID:   UUIDFromPgtype(t.OwnerID),
		Title:     t.Title,
		Date:      t.Date.Time,
		Review:    review,
		TaskItems: taskItemEntities,
		CreatedAt: t.CreatedAt.Time,
		UpdatedAt: t.UpdatedAt.Time,
	}, nil
}

// CreateTask タスクを作成
func (r *TaskRepository) CreateTask(ctx context.Context, ownerID string, title string, date string, taskItems []task.CreateTaskItemInput) (*task.Task, error) {
	// DBTXからpgx.Conn、pgxpool.Pool、またはpgx.Txを取得
	switch v := r.db.(type) {
	case *pgx.Conn:
		// 単一接続からトランザクションを開始
		tx, err := v.Begin(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to begin transaction: %w", err)
		}
		defer func() {
			if err != nil {
				tx.Rollback(ctx)
			}
		}()

		result, err := r.createTaskInTx(ctx, tx, ownerID, title, date, taskItems)
		if err != nil {
			return nil, err
		}

		if err := tx.Commit(ctx); err != nil {
			return nil, fmt.Errorf("failed to commit transaction: %w", err)
		}

		return result, nil
	case *pgxpool.Pool:
		// 接続プールからトランザクションを開始
		tx, err := v.Begin(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to begin transaction: %w", err)
		}
		defer func() {
			if err != nil {
				tx.Rollback(ctx)
			}
		}()

		result, err := r.createTaskInTx(ctx, tx, ownerID, title, date, taskItems)
		if err != nil {
			return nil, err
		}

		if err := tx.Commit(ctx); err != nil {
			return nil, fmt.Errorf("failed to commit transaction: %w", err)
		}

		return result, nil
	case pgx.Tx:
		// 既にトランザクション内の場合は、そのトランザクションを使用
		return r.createTaskInTx(ctx, v, ownerID, title, date, taskItems)
	default:
		return nil, fmt.Errorf("unsupported database connection type for transaction: %T", r.db)
	}
}

// createTaskInTx トランザクション内でタスクを作成
func (r *TaskRepository) createTaskInTx(ctx context.Context, tx pgx.Tx, ownerID string, title string, date string, taskItems []task.CreateTaskItemInput) (*task.Task, error) {
	qtx := r.queries.WithTx(tx)

	// ownerIDをUUIDに変換
	ownerUUID, err := uuid.Parse(ownerID)
	if err != nil {
		return nil, fmt.Errorf("invalid owner_id: %w", err)
	}
	var ownerPgUUID pgtype.UUID
	if err := ownerPgUUID.Scan(ownerUUID.String()); err != nil {
		return nil, fmt.Errorf("failed to convert owner_id to pgtype.UUID: %w", err)
	}

	// 日付をパース
	dateTime, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: %w", err)
	}
	var datePg pgtype.Date
	if err := datePg.Scan(dateTime); err != nil {
		return nil, fmt.Errorf("failed to convert date to pgtype.Date: %w", err)
	}

	// タスクを作成
	createdTask, err := qtx.CreateTask(ctx, dbgen.CreateTaskParams{
		OwnerID: ownerPgUUID,
		Title:   title,
		Date:    datePg,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	taskID := UUIDFromPgtype(createdTask.ID)

	// タスクアイテムを作成
	taskItemEntities := make([]task.TaskItem, 0, len(taskItems))
	for _, itemInput := range taskItems {
		// createdTask.IDは既にpgtype.UUID型なので、そのまま使用
		createdItem, err := qtx.CreateTaskItem(ctx, dbgen.CreateTaskItemParams{
			TaskID:       createdTask.ID,
			Priority:     string(itemInput.Priority),
			Density:      string(itemInput.Density),
			DurationTime: int32(itemInput.DurationTime),
			Content:      itemInput.Content,
			IsRequired:   itemInput.IsRequired,
			OrderValue:   itemInput.Order,
			Status:       string(itemInput.Status),
		})
		if err != nil {
			return nil, fmt.Errorf("failed to create task item: %w", err)
		}

		itemID := UUIDFromPgtype(createdItem.ID)
		itemTaskID := UUIDFromPgtype(createdItem.TaskID)

		taskItemEntities = append(taskItemEntities, task.TaskItem{
			ID:           itemID,
			TaskID:       itemTaskID,
			Priority:     itemInput.Priority,
			Density:      itemInput.Density,
			DurationTime: itemInput.DurationTime,
			Content:      itemInput.Content,
			Output:       nil,
			IsRequired:   itemInput.IsRequired,
			Order:        itemInput.Order,
			Status:       itemInput.Status,
			CreatedAt:    createdItem.CreatedAt.Time,
			UpdatedAt:    createdItem.UpdatedAt.Time,
		})
	}

	// トランザクションをコミット（createTaskInTxは呼び出し元でコミットを制御するため、ここではコミットしない）
	// コミットはCreateTaskメソッドで行う

	var review *string
	if createdTask.Review.Valid {
		review = &createdTask.Review.String
	}

	return &task.Task{
		ID:        taskID,
		OwnerID:   ownerID,
		Title:     title,
		Date:      dateTime,
		Review:    review,
		TaskItems: taskItemEntities,
		CreatedAt: createdTask.CreatedAt.Time,
		UpdatedAt: createdTask.UpdatedAt.Time,
	}, nil
}

// UpdateTask タスクを更新
func (r *TaskRepository) UpdateTask(ctx context.Context, taskID string, ownerID string, title string, date string, taskItems []task.UpdateTaskItemInput) (*task.Task, error) {
	// 既存のタスクを取得してオーナーチェック
	existingTask, err := r.GetTaskByID(ctx, taskID)
	if err != nil {
		return nil, err
	}
	if existingTask == nil {
		return nil, fmt.Errorf("task not found: %s", taskID)
	}
	if existingTask.OwnerID != ownerID {
		return nil, fmt.Errorf("you do not have permission to update this task")
	}

	// DBTXからpgx.Conn、pgxpool.Pool、またはpgx.Txを取得
	switch v := r.db.(type) {
	case *pgx.Conn:
		// 単一接続からトランザクションを開始
		tx, err := v.Begin(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to begin transaction: %w", err)
		}
		defer func() {
			if err != nil {
				tx.Rollback(ctx)
			}
		}()

		result, err := r.updateTaskInTx(ctx, tx, taskID, title, date, taskItems)
		if err != nil {
			return nil, err
		}

		if err := tx.Commit(ctx); err != nil {
			return nil, fmt.Errorf("failed to commit transaction: %w", err)
		}

		return result, nil
	case *pgxpool.Pool:
		// 接続プールからトランザクションを開始
		tx, err := v.Begin(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to begin transaction: %w", err)
		}
		defer func() {
			if err != nil {
				tx.Rollback(ctx)
			}
		}()

		result, err := r.updateTaskInTx(ctx, tx, taskID, title, date, taskItems)
		if err != nil {
			return nil, err
		}

		if err := tx.Commit(ctx); err != nil {
			return nil, fmt.Errorf("failed to commit transaction: %w", err)
		}

		return result, nil
	case pgx.Tx:
		// 既にトランザクション内の場合は、そのトランザクションを使用
		return r.updateTaskInTx(ctx, v, taskID, title, date, taskItems)
	default:
		return nil, fmt.Errorf("unsupported database connection type for transaction: %T", r.db)
	}
}

// updateTaskInTx トランザクション内でタスクを更新
func (r *TaskRepository) updateTaskInTx(ctx context.Context, tx pgx.Tx, taskID string, title string, date string, taskItems []task.UpdateTaskItemInput) (*task.Task, error) {
	qtx := r.queries.WithTx(tx)

	// taskIDをUUIDに変換
	taskUUID, err := uuid.Parse(taskID)
	if err != nil {
		return nil, fmt.Errorf("invalid task_id: %w", err)
	}
	// pgtype.UUIDを直接構築（Bytesフィールドを設定）
	taskPgUUID := pgtype.UUID{
		Bytes: [16]byte(taskUUID),
		Valid: true,
	}

	// 日付をパース
	dateTime, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: %w", err)
	}
	var datePg pgtype.Date
	if err := datePg.Scan(dateTime); err != nil {
		return nil, fmt.Errorf("failed to convert date to pgtype.Date: %w", err)
	}

	// タスクを更新
	updatedTask, err := qtx.UpdateTask(ctx, dbgen.UpdateTaskParams{
		Title:  title,
		Date:   datePg,
		TaskID: taskPgUUID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	// 既存のタスクアイテムを全て削除
	if err := qtx.DeleteTaskItemsByTaskID(ctx, taskPgUUID); err != nil {
		return nil, fmt.Errorf("failed to delete task items: %w", err)
	}

	// タスクアイテムを作成（既存のIDがある場合は更新、ない場合は新規作成）
	taskItemEntities := make([]task.TaskItem, 0, len(taskItems))
	for _, itemInput := range taskItems {
		// タスクアイテムIDをUUIDに変換
		itemUUID, err := uuid.Parse(itemInput.ID)
		if err != nil {
			return nil, fmt.Errorf("invalid task_item_id: %w", err)
		}
		// pgtype.UUIDを直接構築（Bytesフィールドを設定）
		itemPgUUID := pgtype.UUID{
			Bytes: [16]byte(itemUUID),
			Valid: true,
		}

		// 既存のタスクアイテムを更新
		updatedItem, err := qtx.UpdateTaskItem(ctx, dbgen.UpdateTaskItemParams{
			TaskItemID:   itemPgUUID,
			Priority:     string(itemInput.Priority),
			Density:      string(itemInput.Density),
			DurationTime: int32(itemInput.DurationTime),
			Content:      itemInput.Content,
			IsRequired:   itemInput.IsRequired,
			OrderValue:   itemInput.Order,
			Status:       string(itemInput.Status),
		})
		if err != nil {
			// 更新に失敗した場合（存在しない場合）は新規作成
			if errors.Is(err, pgx.ErrNoRows) {
				createdItem, createErr := qtx.CreateTaskItem(ctx, dbgen.CreateTaskItemParams{
					TaskID:       taskPgUUID,
					Priority:     string(itemInput.Priority),
					Density:      string(itemInput.Density),
					DurationTime: int32(itemInput.DurationTime),
					Content:      itemInput.Content,
					IsRequired:   itemInput.IsRequired,
					OrderValue:   itemInput.Order,
					Status:       string(itemInput.Status),
				})
				if createErr != nil {
					return nil, fmt.Errorf("failed to create task item: %w", createErr)
				}
				updatedItem = createdItem
			} else {
				return nil, fmt.Errorf("failed to update task item: %w", err)
			}
		}

		createdItem := updatedItem

		itemID := UUIDFromPgtype(createdItem.ID)
		itemTaskID := UUIDFromPgtype(createdItem.TaskID)

		var output *string
		if createdItem.Output.Valid {
			output = &createdItem.Output.String
		}

		taskItemEntities = append(taskItemEntities, task.TaskItem{
			ID:           itemID,
			TaskID:       itemTaskID,
			Priority:     itemInput.Priority,
			Density:      itemInput.Density,
			DurationTime: itemInput.DurationTime,
			Content:      itemInput.Content,
			Output:       output,
			IsRequired:   itemInput.IsRequired,
			Order:        itemInput.Order,
			Status:       itemInput.Status,
			CreatedAt:    createdItem.CreatedAt.Time,
			UpdatedAt:    createdItem.UpdatedAt.Time,
		})
	}

	var review *string
	if updatedTask.Review.Valid {
		review = &updatedTask.Review.String
	}

	return &task.Task{
		ID:        UUIDFromPgtype(updatedTask.ID),
		OwnerID:   UUIDFromPgtype(updatedTask.OwnerID),
		Title:     title,
		Date:      dateTime,
		Review:    review,
		TaskItems: taskItemEntities,
		CreatedAt: updatedTask.CreatedAt.Time,
		UpdatedAt: updatedTask.UpdatedAt.Time,
	}, nil
}

// GetTaskByTaskItemID タスクアイテムIDからタスクを取得
func (r *TaskRepository) GetTaskByTaskItemID(ctx context.Context, taskItemID string) (*task.Task, error) {
	// taskItemIDをUUIDに変換
	taskItemUUID, err := uuid.Parse(taskItemID)
	if err != nil {
		return nil, fmt.Errorf("invalid task_item_id: %w", err)
	}
	var taskItemPgUUID pgtype.UUID
	if err := taskItemPgUUID.Scan(taskItemUUID.String()); err != nil {
		return nil, fmt.Errorf("failed to convert task_item_id to pgtype.UUID: %w", err)
	}

	// タスクを取得
	t, err := r.queries.GetTaskByTaskItemID(ctx, taskItemPgUUID)
	if err != nil {
		// pgx.ErrNoRowsの場合はnilを返す（タスクが見つからない）
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// タスクアイテムを取得
	taskItems, err := r.queries.GetTaskItemsByTaskIDs(ctx, []pgtype.UUID{t.ID})
	if err != nil {
		return nil, err
	}

	// タスクアイテムを変換
	taskItemEntities := make([]task.TaskItem, 0, len(taskItems))
	for _, item := range taskItems {
		itemID := UUIDFromPgtype(item.ID)
		itemTaskID := UUIDFromPgtype(item.TaskID)

		var output *string
		if item.Output.Valid {
			output = &item.Output.String
		}

		taskItemEntities = append(taskItemEntities, task.TaskItem{
			ID:           itemID,
			TaskID:       itemTaskID,
			Priority:     task.Priority(item.Priority),
			Density:      task.Density(item.Density),
			DurationTime: task.DurationTime(item.DurationTime),
			Content:      item.Content,
			Output:       output,
			IsRequired:   item.IsRequired,
			Order:        item.Order,
			Status:       task.Status(item.Status),
			CreatedAt:    item.CreatedAt.Time,
			UpdatedAt:    item.UpdatedAt.Time,
		})
	}

	var review *string
	if t.Review.Valid {
		review = &t.Review.String
	}

	return &task.Task{
		ID:        UUIDFromPgtype(t.ID),
		OwnerID:   UUIDFromPgtype(t.OwnerID),
		Title:     t.Title,
		Date:      t.Date.Time,
		Review:    review,
		TaskItems: taskItemEntities,
		CreatedAt: t.CreatedAt.Time,
		UpdatedAt: t.UpdatedAt.Time,
	}, nil
}

// UpdateTaskReview タスクの振り返りを更新
func (r *TaskRepository) UpdateTaskReview(ctx context.Context, taskID string, review *string) error {
	// taskIDをUUIDに変換
	taskUUID, err := uuid.Parse(taskID)
	if err != nil {
		return fmt.Errorf("invalid task_id: %w", err)
	}
	var taskPgUUID pgtype.UUID
	if err := taskPgUUID.Scan(taskUUID.String()); err != nil {
		return fmt.Errorf("failed to convert task_id to pgtype.UUID: %w", err)
	}

	// reviewをstringに変換（nilの場合は空文字列、NULLIFによりNULLに変換される）
	reviewStr := ""
	if review != nil {
		reviewStr = *review
	}

	// タスクの振り返りを更新
	_, err = r.queries.UpdateTaskReview(ctx, dbgen.UpdateTaskReviewParams{
		TaskID: taskPgUUID,
		Review: reviewStr,
	})
	if err != nil {
		return fmt.Errorf("failed to update task review: %w", err)
	}

	return nil
}

// UpdateTaskItemOutput タスクアイテムのアウトプットを更新
func (r *TaskRepository) UpdateTaskItemOutput(ctx context.Context, taskItemID string, output string) error {
	// taskItemIDをUUIDに変換
	taskItemUUID, err := uuid.Parse(taskItemID)
	if err != nil {
		return fmt.Errorf("invalid task_item_id: %w", err)
	}
	var taskItemPgUUID pgtype.UUID
	if err := taskItemPgUUID.Scan(taskItemUUID.String()); err != nil {
		return fmt.Errorf("failed to convert task_item_id to pgtype.UUID: %w", err)
	}

	// タスクアイテムのアウトプットとステータスを更新（ステータスはCompletedに）
	_, err = r.queries.UpdateTaskItemOutput(ctx, dbgen.UpdateTaskItemOutputParams{
		TaskItemID: taskItemPgUUID,
		Output:     output,
	})
	if err != nil {
		return fmt.Errorf("failed to update task item output: %w", err)
	}

	return nil
}

// DeleteTask タスクを削除
func (r *TaskRepository) DeleteTask(ctx context.Context, taskID string) error {
	// taskIDをUUIDに変換
	taskUUID, err := uuid.Parse(taskID)
	if err != nil {
		return fmt.Errorf("invalid task_id: %w", err)
	}
	var taskPgUUID pgtype.UUID
	if err := taskPgUUID.Scan(taskUUID.String()); err != nil {
		return fmt.Errorf("failed to convert task_id to pgtype.UUID: %w", err)
	}

	// タスクを削除（ON DELETE CASCADEにより、子タスクも自動的に削除される）
	if err := r.queries.DeleteTask(ctx, taskPgUUID); err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	return nil
}
