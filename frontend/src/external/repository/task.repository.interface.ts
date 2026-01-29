/**
 * Task Repository Interface
 * タスクリポジトリのインターフェイス
 */

import type { Database } from "../client/database/client";
import type { Task } from "../domain/task/task.entity";

/**
 * タスク検索条件
 */
export interface TaskSearchCondition {
  yearMonth?: string; // 年月（例: "2026-01"）
  ownerId?: string; // 所有者ID
  keyword?: string; // キーワード検索（タイトルと子タスクの内容）
  sort?: string; // 並び替え
}

/**
 * タスクリポジトリインターフェイス
 */
export interface ITaskRepository {
  /**
   * タスク一覧を取得
   * @param condition 検索条件
   * @returns タスク一覧
   */
  findMany(condition: TaskSearchCondition): Promise<Task[]>;

  /**
   * タスクIDでタスクを取得
   * @param id タスクID
   * @returns タスク（存在しない場合はnull）
   */
  findById(id: string): Promise<Task | null>;

  /**
   * タスクを作成（トランザクション内で実行）
   * @param tx トランザクション
   * @param data タスク作成データ
   * @returns 作成されたタスクのID
   */
  createInTransaction(
    tx: Database,
    data: {
      ownerId: string;
      title: string;
      date: Date;
      taskItems: {
        priority: string;
        density: string;
        durationTime: number;
        content: string;
        isRequired: boolean;
        order: number;
        status: string;
      }[];
    },
  ): Promise<string>;

  /**
   * タスクを更新（トランザクション内で実行）
   * @param tx トランザクション
   * @param taskId タスクID
   * @param data タスク更新データ
   */
  updateInTransaction(
    tx: Database,
    taskId: string,
    data: {
      title: string;
      date: Date;
      taskItems: {
        id: string;
        priority: string;
        density: string;
        durationTime: number;
        content: string;
        isRequired: boolean;
        order: number;
        status: string;
      }[];
    },
  ): Promise<void>;

  /**
   * タスクを削除（トランザクション内で実行）
   * @param tx トランザクション
   * @param taskId タスクID
   */
  deleteInTransaction(tx: Database, taskId: string): Promise<void>;

  /**
   * 子タスクIDでタスクを取得（子タスクの更新時に使用）
   * @param taskItemId 子タスクID
   * @returns タスク（存在しない場合はnull）
   */
  findByTaskItemId(taskItemId: string): Promise<Task | null>;

  /**
   * 子タスクのアウトプットを更新（トランザクション内で実行）
   * @param tx トランザクション
   * @param taskItemId 子タスクID
   * @param output アウトプット
   */
  updateTaskItemOutputInTransaction(
    tx: Database,
    taskItemId: string,
    output: string,
  ): Promise<void>;

  /**
   * タスクの振り返りを更新（トランザクション内で実行）
   * @param tx トランザクション
   * @param taskId タスクID
   * @param review 振り返り
   */
  updateReviewInTransaction(
    tx: Database,
    taskId: string,
    review: string | null,
  ): Promise<void>;
}

