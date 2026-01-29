/**
 * Task Repository Implementation
 * タスクリポジトリの実装
 */

import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import type { Database } from "../client/database/client";
import { db } from "../client/database";
import { taskItems, tasks } from "../client/database/schema";
import { Task } from "../domain/task/task.entity";
import { TaskItem } from "../domain/task/task-item.entity";
import {
  Density,
  DurationTime,
  Priority,
  Status,
} from "../domain/shared/value-objects";
import type {
  ITaskRepository,
  TaskSearchCondition,
} from "./task.repository.interface";

/**
 * タスクリポジトリの実装
 */
export class TaskRepository implements ITaskRepository {
  /**
   * タスク一覧を取得
   */
  async findMany(condition: TaskSearchCondition): Promise<Task[]> {
    const conditions = [];

    // ownerIdでフィルタ
    if (condition.ownerId) {
      conditions.push(eq(tasks.ownerId, condition.ownerId));
    }

    // year-monthでフィルタ（年月の範囲で検索）
    if (condition.yearMonth) {
      const [year, month] = condition.yearMonth.split("-");
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0)
        .toISOString()
        .split("T")[0];
      conditions.push(
        and(
          sql`${tasks.date} >= ${startDate}`,
          sql`${tasks.date} <= ${endDate}`,
        ),
      );
    }

    // キーワード検索（タイトルと子タスクの内容）
    if (condition.keyword) {
      conditions.push(
        or(
          ilike(tasks.title, `%${condition.keyword}%`),
          sql`EXISTS (
            SELECT 1 FROM ${taskItems}
            WHERE ${taskItems.taskId} = ${tasks.id}
            AND ${taskItems.content} ILIKE ${`%${condition.keyword}%`}
          )`,
        ),
      );
    }

    // クエリ構築（Taskのみ）
    const baseQuery = db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // 並び替え
    let results;
    if (condition.sort) {
      switch (condition.sort) {
        case "newest":
          results = await baseQuery.orderBy(desc(tasks.createdAt));
          break;
        case "oldest":
          results = await baseQuery.orderBy(asc(tasks.createdAt));
          break;
        case "date-asc":
          results = await baseQuery.orderBy(asc(tasks.date));
          break;
        case "date-desc":
          results = await baseQuery.orderBy(desc(tasks.date));
          break;
        default:
          results = await baseQuery.orderBy(desc(tasks.createdAt));
      }
    } else {
      results = await baseQuery.orderBy(desc(tasks.createdAt));
    }

    // タスクIDのリストを取得
    const taskIds = results.map((r) => r.id);

    // 子タスクを取得
    const taskItemsData =
      taskIds.length > 0
        ? await db
            .select()
            .from(taskItems)
            .where(inArray(taskItems.taskId, taskIds))
            .orderBy(asc(taskItems.order))
        : [];

    // タスクアイテムをタスクIDでグループ化
    const taskItemsMap = new Map<string, typeof taskItemsData>();
    for (const item of taskItemsData) {
      if (!taskItemsMap.has(item.taskId)) {
        taskItemsMap.set(item.taskId, []);
      }
      taskItemsMap.get(item.taskId)!.push(item);
    }

    // ドメインエンティティに変換
    const taskEntities: Task[] = [];

    for (const taskData of results) {
      const items = taskItemsMap.get(taskData.id) || [];

      // TaskItemエンティティを作成
      const taskItemEntities = items.map((item) =>
        TaskItem.create({
          id: item.id,
          taskId: item.taskId,
          priority: Priority.create(item.priority),
          density: Density.create(item.density),
          durationTime: DurationTime.create(item.durationTime),
          content: item.content,
          output: item.output,
          isRequired: item.isRequired,
          order: item.order,
          status: Status.create(item.status),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }),
      );

      // Taskエンティティを作成
      const taskEntity = Task.create({
        id: taskData.id,
        ownerId: taskData.ownerId,
        title: taskData.title,
        date: new Date(taskData.date),
        review: taskData.review,
        taskItems: taskItemEntities,
        createdAt: taskData.createdAt,
        updatedAt: taskData.updatedAt,
      });

      taskEntities.push(taskEntity);
    }

    // 完了率で並び替えが必要な場合
    if (condition.sort === "highest-completion" || condition.sort === "lowest-completion") {
      taskEntities.sort((a, b) => {
        // 完了率を計算
        const calculateCompletionRate = (task: Task): number => {
          if (task.taskItems.length === 0) return 0;
          const completedCount = task.taskItems.filter(
            (item) => item.status.getValue() === "Completed",
          ).length;
          return (completedCount / task.taskItems.length) * 100;
        };

        const rateA = calculateCompletionRate(a);
        const rateB = calculateCompletionRate(b);

        if (condition.sort === "highest-completion") {
          return rateB - rateA; // 降順（高い順）
        } else {
          return rateA - rateB; // 昇順（低い順）
        }
      });
    }

    // 完了したタスクの時間で並び替えが必要な場合
    if (condition.sort === "most-quantity" || condition.sort === "least-quantity") {
      taskEntities.sort((a, b) => {
        // 完了したタスクアイテムの合計時間を計算
        const calculateCompletedDuration = (task: Task): number => {
          return task.taskItems
            .filter((item) => item.status.getValue() === "Completed")
            .reduce((sum, item) => sum + item.durationTime.getValue(), 0);
        };

        const durationA = calculateCompletedDuration(a);
        const durationB = calculateCompletedDuration(b);

        if (condition.sort === "most-quantity") {
          return durationB - durationA; // 降順（多い順）
        } else {
          return durationA - durationB; // 昇順（少ない順）
        }
      });
    }

    return taskEntities;
  }

  /**
   * タスクIDでタスクを取得
   */
  async findById(id: string): Promise<Task | null> {
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const taskData = result[0];

    // 子タスクを取得
    const taskItemsData = await db
      .select()
      .from(taskItems)
      .where(eq(taskItems.taskId, id))
      .orderBy(asc(taskItems.order));

    // TaskItemエンティティを作成
    const taskItemEntities = taskItemsData.map((item) =>
      TaskItem.create({
        id: item.id,
        taskId: item.taskId,
        priority: Priority.create(item.priority),
        density: Density.create(item.density),
        durationTime: DurationTime.create(item.durationTime),
        content: item.content,
        output: item.output,
        isRequired: item.isRequired,
        order: item.order,
        status: Status.create(item.status),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }),
    );

    // Taskエンティティを作成
    const taskEntity = Task.create({
      id: taskData.id,
      ownerId: taskData.ownerId,
      title: taskData.title,
      date: new Date(taskData.date),
      review: taskData.review,
      taskItems: taskItemEntities,
      createdAt: taskData.createdAt,
      updatedAt: taskData.updatedAt,
    });

    return taskEntity;
  }

  /**
   * タスクを作成（トランザクション内で実行）
   */
  async createInTransaction(
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
  ): Promise<string> {
    // タスクを挿入（IDとタイムスタンプはデータベースで生成）
    const [insertedTask] = await tx
      .insert(tasks)
      .values({
        ownerId: data.ownerId,
        title: data.title,
        date: data.date.toISOString().split("T")[0],
        review: null, // 新規作成時はnull
      })
      .returning();

    // 子タスクを挿入
    if (data.taskItems.length > 0) {
      await tx.insert(taskItems).values(
        data.taskItems.map((item) => ({
          taskId: insertedTask.id,
          priority: item.priority,
          density: item.density,
          durationTime: item.durationTime,
          content: item.content,
          output: null, // 新規作成時はnull
          isRequired: item.isRequired,
          order: item.order,
          status: item.status,
        })),
      );
    }

    return insertedTask.id;
  }

  /**
   * タスクを更新（トランザクション内で実行）
   */
  async updateInTransaction(
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
  ): Promise<void> {
    // タスクを更新
    await tx
      .update(tasks)
      .set({
        title: data.title,
        date: data.date.toISOString().split("T")[0],
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    // 既存の子タスクを削除
    await tx.delete(taskItems).where(eq(taskItems.taskId, taskId));

    // 新しい子タスクを挿入
    if (data.taskItems.length > 0) {
      await tx.insert(taskItems).values(
        data.taskItems.map((item) => ({
          id: item.id,
          taskId,
          priority: item.priority,
          density: item.density,
          durationTime: item.durationTime,
          content: item.content,
          output: null, // 更新時は既存のoutputを保持する場合は別途処理が必要
          isRequired: item.isRequired,
          order: item.order,
          status: item.status,
        })),
      );
    }
  }

  /**
   * タスクを削除（トランザクション内で実行）
   * ON DELETE CASCADEにより、子タスクも自動的に削除される
   */
  async deleteInTransaction(tx: Database, taskId: string): Promise<void> {
    // タスクを削除（ON DELETE CASCADEにより、子タスクも自動的に削除される）
    await tx.delete(tasks).where(eq(tasks.id, taskId));
  }

  /**
   * 子タスクIDでタスクを取得（子タスクの更新時に使用）
   */
  async findByTaskItemId(taskItemId: string): Promise<Task | null> {
    // 子タスクを取得してタスクIDを取得
    const taskItemResult = await db
      .select()
      .from(taskItems)
      .where(eq(taskItems.id, taskItemId))
      .limit(1);

    if (taskItemResult.length === 0) {
      return null;
    }

    const taskItemData = taskItemResult[0];
    const taskId = taskItemData.taskId;

    // タスクIDでタスクを取得
    return await this.findById(taskId);
  }

  /**
   * 子タスクのアウトプットを更新（トランザクション内で実行）
   * アウトプットを更新するとステータスはcompleted
   */
  async updateTaskItemOutputInTransaction(
    tx: Database,
    taskItemId: string,
    output: string,
  ): Promise<void> {
    // 子タスクのアウトプットとステータスを更新
    await tx
      .update(taskItems)
      .set({
        output,
        status: "Completed", // アウトプットを更新するとステータスはcompleted
        updatedAt: new Date(),
      })
      .where(eq(taskItems.id, taskItemId));
  }

  /**
   * タスクの振り返りを更新（トランザクション内で実行）
   */
  async updateReviewInTransaction(
    tx: Database,
    taskId: string,
    review: string | null,
  ): Promise<void> {
    // タスクの振り返りを更新
    await tx
      .update(tasks)
      .set({
        review,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));
  }
}

// シングルトンインスタンスをエクスポート
export const taskRepository = new TaskRepository();
