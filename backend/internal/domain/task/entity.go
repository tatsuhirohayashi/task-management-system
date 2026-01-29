package task

import (
	"time"
)

// Task タスクエンティティ（集約ルート）
type Task struct {
	ID        string
	OwnerID   string
	Title     string
	Date      time.Time
	Review    *string
	TaskItems []TaskItem
	CreatedAt time.Time
	UpdatedAt time.Time
}

// TaskItem タスクアイテムエンティティ（集約メンバー）
type TaskItem struct {
	ID           string
	TaskID       string
	Priority     Priority
	Density      Density
	DurationTime DurationTime
	Content      string
	Output       *string
	IsRequired   bool
	Order        int32
	Status       Status
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// Priority 優先度
type Priority string

const (
	PriorityHigh   Priority = "High"
	PriorityMedium Priority = "Medium"
	PriorityLow    Priority = "Low"
)

// Density 密度（負荷）
type Density string

const (
	DensityHigh   Density = "High"
	DensityMedium Density = "Medium"
	DensityLow    Density = "Low"
)

// Status ステータス
type Status string

const (
	StatusNotStarted Status = "NotStarted"
	StatusInProgress Status = "InProgress"
	StatusCompleted  Status = "Completed"
)

// DurationTime 継続時間（分）
type DurationTime int32

const (
	DurationTime15 DurationTime = 15
	DurationTime30 DurationTime = 30
	DurationTime45 DurationTime = 45
	DurationTime60 DurationTime = 60
)

