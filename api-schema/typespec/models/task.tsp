import "./common.tsp";

namespace TaskManagement.Models.Task;

/**
 * 優先度
 */
enum Priority {
  High,
  Medium,
  Low,
}

/**
 * 密度（負荷）
 */
enum Density {
  High,
  Medium,
  Low,
}

/**
 * ステータス
 */
enum Status {
  NotStarted,
  InProgress,
  Completed,
}

/**
 * 継続時間（分）
 */
alias DurationTime = 15 | 30 | 45 | 60;

/**
 * タスクアイテム
 */
model TaskItem {
  id: string;
  priority: Priority;
  density: Density;
  durationTime: DurationTime;
  content: string;
  output?: string;
  status: Status;
  isRequired: boolean;
  order: int32;
}

/**
 * タスク
 */
model Task {
  id: string;
  ownerId: string;
  title: string;
  date: string; // ISO 8601形式（YYYY-MM-DD）
  review?: string;
  taskItems: TaskItem[];
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}

/**
 * タスクレスポンス
 */
model TaskResponse {
  id: string;
  ownerId: string;
  owner: TaskOwnerResponse;
  title: string;
  date: string; // ISO 8601形式（YYYY-MM-DD）
  review?: string;
  taskItems: TaskItemResponse[];
  completionRate: float32;
  plannedTaskCount: int32;
  plannedTaskDurationMinutes: int32;
  completedTaskCount: int32;
  completedTaskDurationMinutes: int32;
  HighTaskCount: int32;
  HighTaskDuration: int32;
  HighTaskRate: float32;
  MediumTaskCount: int32;
  MediumTaskDuration: int32;
  MediumTaskRate: float32;
  LowTaskCount: int32;
  LowTaskDuration: int32;
  LowTaskRate: float32;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}

/**
 * タスクオーナーレスポンス
 */
model TaskOwnerResponse {
  id: string;
  firstName: string;
  lastName: string;
  thumbnail?: string;
}

/**
 * タスクアイテムレスポンス
 */
model TaskItemResponse {
  id: string;
  taskId: string;
  priority: Priority;
  density: Density;
  durationTime: DurationTime;
  content: string;
  output?: string;
  status: Status;
  isRequired: boolean;
  order: int32;
}

/**
 * タスク一覧レスポンス
 */
alias ListTaskResponse = TaskResponse[];

/**
 * タスクアイテム作成リクエスト
 */
model CreateTaskItemRequest {
  priority: Priority;
  density: Density;
  durationTime: DurationTime;
  content: string;
  isRequired: boolean;
  order: int32;
  status: Status;
}

/**
 * タスク作成リクエスト
 */
model CreateTaskRequest {
  title: string;
  date: string; // ISO 8601形式
  taskItems: CreateTaskItemRequest[];
}

/**
 * タスク作成レスポンス
 */
alias CreateTaskResponse = TaskResponse;

/**
 * タスクアイテム更新リクエスト
 */
model UpdateTaskItemRequest {
  id: string;
  priority: Priority;
  density: Density;
  durationTime: DurationTime;
  content: string;
  isRequired: boolean;
  order: int32;
  status: Status;
}

/**
 * タスク更新リクエスト
 */
model UpdateTaskRequest {
  title: string;
  date: string; // ISO 8601形式
  taskItems: UpdateTaskItemRequest[];
}

/**
 * タスク更新レスポンス
 */
alias UpdateTaskResponse = TaskResponse;

/**
 * タスク削除レスポンス
 */
model DeleteTaskResponse {
  success: boolean;
}

/**
 * 子タスクアウトプット更新リクエスト
 */
model UpdateTaskItemOutputRequest {
  output: string;
}

/**
 * 子タスクアウトプット更新レスポンス
 */
alias UpdateTaskItemOutputResponse = TaskResponse;

/**
 * タスク振り返り更新リクエスト
 */
model UpdateTaskReviewRequest {
  review?: string;
}

/**
 * タスク振り返り更新レスポンス
 */
alias UpdateTaskReviewResponse = TaskResponse;

