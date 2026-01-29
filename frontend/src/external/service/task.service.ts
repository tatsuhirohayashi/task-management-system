/**
 * Task Service Implementation
 * タスクサービスの実装
 */

import type { TaskFilters } from "../dto/task.dto";
import type { Task } from "../domain/task/task.entity";
import type { ITaskRepository } from "../repository/task.repository.interface";
import { taskRepository } from "../repository/task.repository";
import { withTransaction } from "../repository/transaction.repository";
import type { ITaskService } from "./task.service.interface";

/**
 * タスクサービスの実装
 */
export class TaskService implements ITaskService {
  private readonly taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * タスク一覧を取得
   */
  async getTaskList(filters: TaskFilters): Promise<Task[]> {
    // フィルタ条件をリポジトリ用の検索条件に変換
    const condition = {
      yearMonth: filters["year-month"],
      ownerId: filters.ownerId,
      keyword: filters.q,
      sort: filters.sort,
    };

    // リポジトリからタスク一覧を取得（ドメインエンティティ）
    const tasks = await this.taskRepository.findMany(condition);

    return tasks;
  }

  /**
   * タスクIDでタスクを取得
   */
  async getTaskById(id: string): Promise<Task | null> {
    return await this.taskRepository.findById(id);
  }

  /**
   * タスクを作成
   */
  async createTask(
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
  ): Promise<Task> {
    // トランザクション内でタスクと子タスクを同時に作成
    const taskId = await withTransaction(async (tx) => {
      return await this.taskRepository.createInTransaction(tx, {
        ownerId,
        title,
        date,
        taskItems,
      });
    });

    // 作成されたタスクを再取得（子タスクも含む）してエンティティを作成
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Failed to create task");
    }
    return task;
  }

  /**
   * タスクを更新
   */
  async updateTask(
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
  ): Promise<Task> {
    // 既存のタスクを取得
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error("Task not found");
    }
    // エンティティのメソッドで更新可能かチェック
    if (!existingTask.canUpdate(ownerId)) {
      throw new Error("You do not have permission to update this task");
    }

    // トランザクション内でタスクと子タスクを更新
    await withTransaction(async (tx) => {
      await this.taskRepository.updateInTransaction(tx, taskId, {
        title,
        date,
        taskItems: taskItems.map((item) => ({
          id: item.id,
          priority: item.priority,
          density: item.density,
          durationTime: item.durationTime,
          content: item.content,
          isRequired: item.isRequired,
          order: item.order,
          status: item.status,
        })),
      });
    });

    // 更新されたタスクを再取得（子タスクも含む）してエンティティを作成
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Failed to update task");
    }
    return task;
  }

  /**
   * タスクを削除
   */
  async deleteTask(taskId: string, ownerId: string): Promise<void> {
    // 既存のタスクを取得
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error("Task not found");
    }
    // エンティティのメソッドで削除可能かチェック
    if (!existingTask.canDelete(ownerId)) {
      throw new Error("You do not have permission to delete this task");
    }

    // トランザクション内でタスクを削除（ON DELETE CASCADEにより、子タスクも自動的に削除される）
    await withTransaction(async (tx) => {
      await this.taskRepository.deleteInTransaction(tx, taskId);
    });
  }

  /**
   * 子タスクのアウトプットを更新
   */
  async updateTaskItemOutput(
    taskItemId: string,
    ownerId: string,
    output: string,
  ): Promise<Task> {
    // 子タスクIDでタスクを取得
    const task = await this.taskRepository.findByTaskItemId(taskItemId);
    if (!task) {
      throw new Error("Task not found");
    }

    // エンティティのメソッドで更新可能かチェック
    if (!task.canUpdate(ownerId)) {
      throw new Error("You do not have permission to update this task item");
    }

    // 子タスクが存在するか確認
    const taskItem = task.taskItems.find((item) => item.id === taskItemId);
    if (!taskItem) {
      throw new Error("Task item not found");
    }

    // トランザクション内で子タスクのアウトプットを更新
    await withTransaction(async (tx) => {
      await this.taskRepository.updateTaskItemOutputInTransaction(
        tx,
        taskItemId,
        output,
      );
    });

    // 更新されたタスクを再取得（子タスクも含む）してエンティティを作成
    const updatedTask = await this.taskRepository.findById(task.id);
    if (!updatedTask) {
      throw new Error("Failed to update task item");
    }
    return updatedTask;
  }

  /**
   * タスクの振り返りを更新
   */
  async updateReview(
    taskId: string,
    ownerId: string,
    review: string | null,
  ): Promise<Task> {
    // 既存のタスクを取得
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error("Task not found");
    }
    // エンティティのメソッドで更新可能かチェック
    if (!existingTask.canUpdate(ownerId)) {
      throw new Error("You do not have permission to update this task review");
    }

    // トランザクション内でタスクの振り返りを更新
    await withTransaction(async (tx) => {
      await this.taskRepository.updateReviewInTransaction(tx, taskId, review);
    });

    // 更新されたタスクを再取得（子タスクも含む）してエンティティを作成
    const updatedTask = await this.taskRepository.findById(taskId);
    if (!updatedTask) {
      throw new Error("Failed to update task review");
    }
    return updatedTask;
  }
}

// シングルトンインスタンスをエクスポート
export const taskService = new TaskService(taskRepository);

