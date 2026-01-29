/**
 * Task Entity
 * ドメイン設計書に基づくTaskエンティティ（集約ルート）
 */

import type { TaskItem } from './task-item.entity';

/**
 * Taskエンティティ（集約ルート）
 * ルール:
 * - タスクを消したら中の子タスクも一緒に消す
 * - 新しいタスクを作る時、子タスクも作る
 * - TaskItem（子タスク）の順番はかぶらない
 * - TaskItem（子タスク）の追加、削除、並び替えはTaskがまとめて行う
 */
export class Task {
  private constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly title: string,
    public readonly date: Date,
    public readonly review: string | null,
    public readonly taskItems: readonly TaskItem[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    // titleは必須
    if (!title || title.trim().length === 0) {
      throw new Error('titleは必須です');
    }
    // TaskItem（子タスク）の順番はかぶらない
    this.validateTaskItemOrders();
  }

  /**
   * Taskエンティティを作成（新しいタスクを作る時、子タスクも作る）
   */
  static create(params: {
    id: string;
    ownerId: string;
    title: string;
    date: Date;
    review?: string | null;
    taskItems: TaskItem[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Task {
    const now = new Date();
    const task = new Task(
      params.id,
      params.ownerId,
      params.title,
      params.date,
      params.review ?? null,
      params.taskItems,
      params.createdAt ?? now,
      params.updatedAt ?? now,
    );
    return task;
  }

  /**
   * TaskItem（子タスク）の順番が重複していないか検証
   */
  private validateTaskItemOrders(): void {
    const orders = this.taskItems.map((item) => item.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error('TaskItem（子タスク）の順番は重複できません');
    }
  }

  /**
   * タイトルを更新
   */
  updateTitle(title: string): Task {
    const now = new Date();
    return new Task(
      this.id,
      this.ownerId,
      title,
      this.date,
      this.review,
      this.taskItems,
      this.createdAt,
      now,
    );
  }

  /**
   * 日付を更新
   */
  updateDate(date: Date): Task {
    const now = new Date();
    return new Task(
      this.id,
      this.ownerId,
      this.title,
      date,
      this.review,
      this.taskItems,
      this.createdAt,
      now,
    );
  }

  /**
   * 振り返りを更新
   */
  updateReview(review: string | null): Task {
    const now = new Date();
    return new Task(
      this.id,
      this.ownerId,
      this.title,
      this.date,
      review,
      this.taskItems,
      this.createdAt,
      now,
    );
  }

  /**
   * TaskItem（子タスク）を追加
   * TaskItem（子タスク）の追加、削除、並び替えはTaskがまとめて行う
   */
  addTaskItem(taskItem: TaskItem): Task {
    // 同じtaskIdかどうか確認
    if (taskItem.taskId !== this.id) {
      throw new Error('TaskItemのtaskIdがTaskのidと一致しません');
    }
    const now = new Date();
    const newTaskItems = [...this.taskItems, taskItem];
    const task = new Task(
      this.id,
      this.ownerId,
      this.title,
      this.date,
      this.review,
      newTaskItems,
      this.createdAt,
      now,
    );
    return task;
  }

  /**
   * TaskItem（子タスク）を削除
   * TaskItem（子タスク）の追加、削除、並び替えはTaskがまとめて行う
   */
  removeTaskItem(taskItemId: string): Task {
    const now = new Date();
    const newTaskItems = this.taskItems.filter((item) => item.id !== taskItemId);
    return new Task(
      this.id,
      this.ownerId,
      this.title,
      this.date,
      this.review,
      newTaskItems,
      this.createdAt,
      now,
    );
  }

  /**
   * TaskItem（子タスク）を更新
   * TaskItem（子タスク）の追加、削除、並び替えはTaskがまとめて行う
   */
  updateTaskItem(updatedTaskItem: TaskItem): Task {
    // 同じtaskIdかどうか確認
    if (updatedTaskItem.taskId !== this.id) {
      throw new Error('TaskItemのtaskIdがTaskのidと一致しません');
    }
    const now = new Date();
    const newTaskItems = this.taskItems.map((item) =>
      item.id === updatedTaskItem.id ? updatedTaskItem : item,
    );
    return new Task(
      this.id,
      this.ownerId,
      this.title,
      this.date,
      this.review,
      newTaskItems,
      this.createdAt,
      now,
    );
  }

  /**
   * TaskItem（子タスク）を並び替え
   * TaskItem（子タスク）の追加、削除、並び替えはTaskがまとめて行う
   */
  reorderTaskItems(taskItemIds: string[]): Task {
    // すべてのTaskItemが含まれているか確認
    if (taskItemIds.length !== this.taskItems.length) {
      throw new Error('すべてのTaskItemを含める必要があります');
    }
    const taskItemMap = new Map(this.taskItems.map((item) => [item.id, item]));
    const reorderedTaskItems = taskItemIds.map((id, index) => {
      const taskItem = taskItemMap.get(id);
      if (!taskItem) {
        throw new Error(`TaskItem with id ${id} not found`);
      }
      return taskItem.updateOrder(index);
    });
    const now = new Date();
    return new Task(
      this.id,
      this.ownerId,
      this.title,
      this.date,
      this.review,
      reorderedTaskItems,
      this.createdAt,
      now,
    );
  }

  /**
   * オーナーかどうかを判定
   */
  isOwnedBy(accountId: string): boolean {
    return this.ownerId === accountId;
  }

  /**
   * 更新可能かどうかを判定
   * 自分が所有するタスクのみ更新可能
   */
  canUpdate(accountId: string): boolean {
    return this.isOwnedBy(accountId);
  }

  /**
   * 削除可能かどうかを判定
   * 自分が所有するタスクのみ削除可能
   */
  canDelete(accountId: string): boolean {
    return this.isOwnedBy(accountId);
  }

  /**
   * 同一Taskかどうかを判定
   */
  equals(other: Task): boolean {
    return this.id === other.id;
  }
}

