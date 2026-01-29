package presenter

import (
	"task-management-system/backend/internal/adapter/http/generated/openapi"
	"task-management-system/backend/internal/domain/account"
	"task-management-system/backend/internal/domain/task"
)

// ToTaskResponse タスクドメインエンティティをAPIレスポンスに変換
func ToTaskResponse(t *task.Task, owner *account.Account) openapi.ModelsTaskTaskResponse {
	// タスクアイテムを変換
	taskItemResponses := make([]openapi.ModelsTaskTaskItemResponse, 0, len(t.TaskItems))
	for _, item := range t.TaskItems {
		var output *string
		if item.Output != nil {
			output = item.Output
		}

		var durationTime openapi.ModelsTaskTaskItemResponseDurationTime
		switch item.DurationTime {
		case task.DurationTime15:
			durationTime = openapi.ModelsTaskTaskItemResponseDurationTimeN15
		case task.DurationTime30:
			durationTime = openapi.ModelsTaskTaskItemResponseDurationTimeN30
		case task.DurationTime45:
			durationTime = openapi.ModelsTaskTaskItemResponseDurationTimeN45
		case task.DurationTime60:
			durationTime = openapi.ModelsTaskTaskItemResponseDurationTimeN60
		default:
			durationTime = openapi.ModelsTaskTaskItemResponseDurationTimeN15
		}

		taskItemResponses = append(taskItemResponses, openapi.ModelsTaskTaskItemResponse{
			Id:           item.ID,
			TaskId:       item.TaskID,
			Priority:     openapi.ModelsTaskPriority(item.Priority),
			Density:      openapi.ModelsTaskDensity(item.Density),
			DurationTime: durationTime,
			Content:      item.Content,
			Output:       output,
			IsRequired:   item.IsRequired,
			Order:        item.Order,
			Status:       openapi.ModelsTaskStatus(item.Status),
		})
	}

	// 統計情報を計算
	plannedTaskCount := int32(len(t.TaskItems))
	var plannedTaskDurationMinutes int32
	var completedTaskCount int32
	var completedTaskDurationMinutes int32

	highTaskCount := int32(0)
	var highTaskDuration int32
	mediumTaskCount := int32(0)
	var mediumTaskDuration int32
	lowTaskCount := int32(0)
	var lowTaskDuration int32

	for _, item := range t.TaskItems {
		duration := int32(item.DurationTime)
		plannedTaskDurationMinutes += duration

		if item.Status == task.StatusCompleted {
			completedTaskCount++
			completedTaskDurationMinutes += duration
		}

		switch item.Density {
		case task.DensityHigh:
			highTaskCount++
			highTaskDuration += duration
		case task.DensityMedium:
			mediumTaskCount++
			mediumTaskDuration += duration
		case task.DensityLow:
			lowTaskCount++
			lowTaskDuration += duration
		}
	}

	var completionRate float32
	if plannedTaskCount > 0 {
		completionRate = float32(completedTaskCount) / float32(plannedTaskCount) * 100
	}

	var highTaskRate float32
	if plannedTaskDurationMinutes > 0 {
		highTaskRate = float32(highTaskDuration) / float32(plannedTaskDurationMinutes) * 100
	}

	var mediumTaskRate float32
	if plannedTaskDurationMinutes > 0 {
		mediumTaskRate = float32(mediumTaskDuration) / float32(plannedTaskDurationMinutes) * 100
	}

	var lowTaskRate float32
	if plannedTaskDurationMinutes > 0 {
		lowTaskRate = float32(lowTaskDuration) / float32(plannedTaskDurationMinutes) * 100
	}

	// 日付をISO 8601形式（YYYY-MM-DD）に変換
	dateStr := t.Date.Format("2006-01-02")

	// オーナー情報を変換
	var thumbnail *string
	if owner.Thumbnail != nil {
		thumbnail = owner.Thumbnail
	}

	return openapi.ModelsTaskTaskResponse{
		Id:      t.ID,
		OwnerId: t.OwnerID,
		Owner: openapi.ModelsTaskTaskOwnerResponse{
			Id:        owner.ID,
			FirstName: owner.FirstName,
			LastName:  owner.LastName,
			Thumbnail: thumbnail,
		},
		Title:                        t.Title,
		Date:                         dateStr,
		Review:                       t.Review,
		TaskItems:                    taskItemResponses,
		PlannedTaskCount:             plannedTaskCount,
		PlannedTaskDurationMinutes:   plannedTaskDurationMinutes,
		CompletedTaskCount:           completedTaskCount,
		CompletedTaskDurationMinutes: completedTaskDurationMinutes,
		CompletionRate:               completionRate,
		HighTaskCount:                highTaskCount,
		HighTaskDuration:             highTaskDuration,
		HighTaskRate:                 highTaskRate,
		MediumTaskCount:              mediumTaskCount,
		MediumTaskDuration:           mediumTaskDuration,
		MediumTaskRate:               mediumTaskRate,
		LowTaskCount:                 lowTaskCount,
		LowTaskDuration:              lowTaskDuration,
		LowTaskRate:                  lowTaskRate,
		CreatedAt:                    t.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:                    t.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// ToTaskResponseList タスクのリストをAPIレスポンスのリストに変換
// 自分のタスクのみを取得するAPIのため、すべてのタスクは同じオーナーを持つ
func ToTaskResponseList(tasks []*task.Task, owner *account.Account) []openapi.ModelsTaskTaskResponse {
	result := make([]openapi.ModelsTaskTaskResponse, 0, len(tasks))
	for _, t := range tasks {
		result = append(result, ToTaskResponse(t, owner))
	}

	return result
}
