package task

// ListTasksCondition タスク一覧取得の検索条件
type ListTasksCondition struct {
	OwnerID   *string
	YearMonth *string
	Keyword   *string
	Sort      *string
}

// CreateTaskItemInput タスクアイテム作成の入力
type CreateTaskItemInput struct {
	Priority     Priority
	Density      Density
	DurationTime DurationTime
	Content      string
	IsRequired   bool
	Order        int32
	Status       Status
}

// UpdateTaskItemInput タスクアイテム更新の入力
type UpdateTaskItemInput struct {
	ID           string
	Priority     Priority
	Density      Density
	DurationTime DurationTime
	Content      string
	IsRequired   bool
	Order        int32
	Status       Status
}
