/**
 * Task DTO
 * タスク関連のデータ転送オブジェクト
 */

import { z } from "zod";

/**
 * タスクIDのバリデーションスキーマ
 */
export const TaskIdSchema = z.string().uuid({
  message: "タスクIDは有効なUUIDである必要があります",
});

/**
 * タスクIDで取得するリクエストのスキーマ
 */
export const GetTaskByIdRequestSchema = z.object({
  id: TaskIdSchema,
});

/**
 * タスクIDで取得するリクエスト
 */
export type GetTaskByIdRequest = z.infer<typeof GetTaskByIdRequestSchema>;

/**
 * タスク一覧取得のクエリパラメータ
 */
export interface TaskFilters {
  "year-month"?: string; // 年月（例: "2026-01"）
  ownerId?: string; // 所有者IDでフィルタ
  q?: string; // タスクのタイトルと子タスクの内容をキーワード検索
  sort?: string; // 並び替え
}

/**
 * タスクレスポンスのオーナー情報
 */
export interface TaskOwnerResponse {
  id: string;
  firstName: string;
  lastName: string;
  thumbnail: string | null;
}

/**
 * タスクアイテムレスポンス
 */
export interface TaskItemResponse {
  id: string;
  taskId: string;
  priority: "High" | "Medium" | "Low";
  density: "High" | "Medium" | "Low";
  durationTime: 60 | 45 | 30 | 15;
  content: string;
  output: string | null;
  isRequired: boolean;
  order: number;
  status: "NotStarted" | "InProgress" | "Completed";
}

/**
 * タスクレスポンス
 */
export interface TaskResponse {
  id: string;
  ownerId: string;
  owner: TaskOwnerResponse;
  title: string;
  date: string; // ISO 8601形式
  review: string | null;
  taskItems: TaskItemResponse[];
  plannedTaskCount: number;
  plannedTaskDurationMinutes: number;
  completedTaskCount: number;
  completedTaskDurationMinutes: number;
  completionRate: number;
  HighTaskCount: number;
  HighTaskDuration: number;
  HighTaskRate: number;
  MediumTaskCount: number;
  MediumTaskDuration: number;
  MediumTaskRate: number;
  LowTaskCount: number;
  LowTaskDuration: number;
  LowTaskRate: number;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}

/**
 * タスク一覧レスポンス
 */
export type ListTaskResponse = TaskResponse[];

/**
 * タスクアイテム作成リクエストのスキーマ
 */
const CreateTaskItemRequestSchema = z.object({
  priority: z.enum(["High", "Medium", "Low"], {
    message: "priorityはHigh、Medium、Lowのいずれかである必要があります",
  }),
  density: z.enum(["High", "Medium", "Low"], {
    message: "densityはHigh、Medium、Lowのいずれかである必要があります",
  }),
  durationTime: z.union([z.literal(60), z.literal(45), z.literal(30), z.literal(15)], {
    message: "durationTimeは60、45、30、15のいずれかである必要があります",
  }),
  content: z.string().min(1, { message: "contentは1文字以上である必要があります" }),
  isRequired: z.boolean(),
  order: z.number().int().min(0, { message: "orderは0以上の整数である必要があります" }),
  status: z.enum(["NotStarted", "InProgress", "Completed"], {
    message: "statusはNotStarted、InProgress、Completedのいずれかである必要があります",
  }),
});

/**
 * タスク作成リクエストのスキーマ
 */
export const CreateTaskRequestSchema = z.object({
  title: z.string().min(1, { message: "titleは1文字以上である必要があります" }),
  date: z.string().min(1, { message: "dateは1文字以上である必要があります" }).refine(
    (val) => {
      const date = new Date(val);
      return !Number.isNaN(date.getTime());
    },
    { message: "dateは有効な日付形式である必要があります" },
  ),
  taskItems: z
    .array(CreateTaskItemRequestSchema)
    .min(1, { message: "taskItemsは少なくとも1つ必要です" }),
});

/**
 * タスク作成リクエスト
 */
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

/**
 * タスク作成レスポンス
 */
export type CreateTaskResponse = TaskResponse;

/**
 * タスクアイテム更新リクエストのスキーマ
 */
const UpdateTaskItemRequestSchema = z.object({
  id: z.string().uuid({ message: "idは有効なUUIDである必要があります" }),
  priority: z.enum(["High", "Medium", "Low"], {
    message: "priorityはHigh、Medium、Lowのいずれかである必要があります",
  }),
  density: z.enum(["High", "Medium", "Low"], {
    message: "densityはHigh、Medium、Lowのいずれかである必要があります",
  }),
  durationTime: z.union([z.literal(60), z.literal(45), z.literal(30), z.literal(15)], {
    message: "durationTimeは60、45、30、15のいずれかである必要があります",
  }),
  content: z.string().min(1, { message: "contentは1文字以上である必要があります" }),
  isRequired: z.boolean(),
  order: z.number().int().min(0, { message: "orderは0以上の整数である必要があります" }),
  status: z.enum(["NotStarted", "InProgress", "Completed"], {
    message: "statusはNotStarted、InProgress、Completedのいずれかである必要があります",
  }),
});

/**
 * タスク更新リクエストのスキーマ
 */
export const UpdateTaskRequestSchema = z.object({
  title: z.string().min(1, { message: "titleは1文字以上である必要があります" }),
  date: z.string().min(1, { message: "dateは1文字以上である必要があります" }).refine(
    (val) => {
      const date = new Date(val);
      return !Number.isNaN(date.getTime());
    },
    { message: "dateは有効な日付形式である必要があります" },
  ),
  taskItems: z
    .array(UpdateTaskItemRequestSchema)
    .min(1, { message: "taskItemsは少なくとも1つ必要です" }),
});

/**
 * タスク更新リクエスト
 */
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;

/**
 * タスク更新レスポンス
 */
export type UpdateTaskResponse = TaskResponse;

/**
 * タスク削除レスポンス
 */
export interface DeleteTaskResponse {
  success: boolean;
}

/**
 * 子タスク更新リクエストのスキーマ
 */
export const UpdateTaskItemOutputRequestSchema = z.object({
  output: z.string().min(1, { message: "outputは1文字以上である必要があります" }),
});

/**
 * 子タスク更新リクエスト
 */
export type UpdateTaskItemOutputRequest = z.infer<
  typeof UpdateTaskItemOutputRequestSchema
>;

/**
 * 子タスク更新レスポンス
 */
export type UpdateTaskItemOutputResponse = TaskResponse;

/**
 * タスク振り返り更新リクエストのスキーマ
 */
export const UpdateTaskReviewRequestSchema = z.object({
  review: z.string().nullable(),
});

/**
 * タスク振り返り更新リクエスト
 */
export type UpdateTaskReviewRequest = z.infer<
  typeof UpdateTaskReviewRequestSchema
>;

/**
 * タスク振り返り更新レスポンス
 */
export type UpdateTaskReviewResponse = TaskResponse;

