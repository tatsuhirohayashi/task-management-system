/**
 * Task Service Interface
 * タスクサービスのインターフェイス
 */

import type { TaskFilters } from "../dto/task.dto";
import type { Task } from "../domain/task/task.entity";

/**
 * タスクサービスインターフェイス
 */
export interface ITaskService {
  /**
   * タスク一覧を取得
   * @param filters フィルタ条件
   * @returns タスク一覧
   */
  getTaskList(filters: TaskFilters): Promise<Task[]>;

  /**
   * タスクIDでタスクを取得
   * @param id タスクID
   * @returns タスク（存在しない場合はnull）
   */
  getTaskById(id: string): Promise<Task | null>;

  /**
   * タスクを作成
   * @param ownerId オーナーID
   * @param title タイトル
   * @param date 日付
   * @param taskItems 子タスクの配列（バリデーション済み）
   * @returns 作成されたタスク
   */
  createTask(
    ownerId: string,
    title: string,
    date: Date,
    taskItems: {
      priority: "High" | "Medium" | "Low";
      density: "High" | "Medium" | "Low";
      durationTime: 60 | 45 | 30 | 15;
      content: string;
      isRequired: boolean;
      order: number;
      status: "NotStarted" | "InProgress" | "Completed";
    }[],
  ): Promise<Task>;

  /**
   * タスクを更新
   * @param taskId タスクID
   * @param ownerId オーナーID（権限チェック用）
   * @param title タイトル
   * @param date 日付
   * @param taskItems 子タスクの配列（バリデーション済み）
   * @returns 更新されたタスク
   */
  updateTask(
    taskId: string,
    ownerId: string,
    title: string,
    date: Date,
    taskItems: {
      id: string;
      priority: "High" | "Medium" | "Low";
      density: "High" | "Medium" | "Low";
      durationTime: 60 | 45 | 30 | 15;
      content: string;
      isRequired: boolean;
      order: number;
      status: "NotStarted" | "InProgress" | "Completed";
    }[],
  ): Promise<Task>;

  /**
   * タスクを削除
   * @param taskId タスクID
   * @param ownerId オーナーID（権限チェック用）
   */
  deleteTask(taskId: string, ownerId: string): Promise<void>;

  /**
   * 子タスクのアウトプットを更新
   * @param taskItemId 子タスクID
   * @param ownerId オーナーID（権限チェック用）
   * @param output アウトプット
   * @returns 更新されたタスク
   */
  updateTaskItemOutput(
    taskItemId: string,
    ownerId: string,
    output: string,
  ): Promise<Task>;

  /**
   * タスクの振り返りを更新
   * @param taskId タスクID
   * @param ownerId オーナーID（権限チェック用）
   * @param review 振り返り（null可）
   * @returns 更新されたタスク
   */
  updateReview(taskId: string, ownerId: string, review: string | null): Promise<Task>;
}

