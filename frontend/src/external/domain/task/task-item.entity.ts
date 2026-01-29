/**
 * TaskItem Entity
 * ドメイン設計書に基づくTaskItemエンティティ
 */

import { Priority, Density, DurationTime, Status } from '../shared/value-objects';

/**
 * TaskItemエンティティ
 * Taskの内の1つのタスク
 */
export class TaskItem {
  private constructor(
    public readonly id: string,
    public readonly taskId: string,
    public readonly priority: Priority,
    public readonly density: Density,
    public readonly durationTime: DurationTime,
    public readonly content: string,
    public readonly output: string | null,
    public readonly isRequired: boolean,
    public readonly order: number,
    public readonly status: Status,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    // contentは必須
    if (!content || content.trim().length === 0) {
      throw new Error('contentは必須です');
    }
    // orderは0以上
    if (order < 0) {
      throw new Error('orderは0以上である必要があります');
    }
  }

  /**
   * TaskItemエンティティを作成
   */
  static create(params: {
    id: string;
    taskId: string;
    priority: Priority;
    density: Density;
    durationTime: DurationTime;
    content: string;
    output?: string | null;
    isRequired: boolean;
    order: number;
    status: Status;
    createdAt?: Date;
    updatedAt?: Date;
  }): TaskItem {
    const now = new Date();
    return new TaskItem(
      params.id,
      params.taskId,
      params.priority,
      params.density,
      params.durationTime,
      params.content,
      params.output ?? null,
      params.isRequired,
      params.order,
      params.status,
      params.createdAt ?? now,
      params.updatedAt ?? now,
    );
  }

  /**
   * アウトプットを更新（アウトプットを更新するとステータスはcompleted）
   */
  updateOutput(output: string): TaskItem {
    const now = new Date();
    return new TaskItem(
      this.id,
      this.taskId,
      this.priority,
      this.density,
      this.durationTime,
      this.content,
      output,
      this.isRequired,
      this.order,
      Status.Completed(), // アウトプットを更新するとステータスはcompleted
      this.createdAt,
      now,
    );
  }

  /**
   * 優先度を更新
   */
  updatePriority(priority: Priority): TaskItem {
    const now = new Date();
    return new TaskItem(
      this.id,
      this.taskId,
      priority,
      this.density,
      this.durationTime,
      this.content,
      this.output,
      this.isRequired,
      this.order,
      this.status,
      this.createdAt,
      now,
    );
  }

  /**
   * 密度を更新
   */
  updateDensity(density: Density): TaskItem {
    const now = new Date();
    return new TaskItem(
      this.id,
      this.taskId,
      this.priority,
      density,
      this.durationTime,
      this.content,
      this.output,
      this.isRequired,
      this.order,
      this.status,
      this.createdAt,
      now,
    );
  }

  /**
   * 継続時間を更新
   */
  updateDurationTime(durationTime: DurationTime): TaskItem {
    const now = new Date();
    return new TaskItem(
      this.id,
      this.taskId,
      this.priority,
      this.density,
      durationTime,
      this.content,
      this.output,
      this.isRequired,
      this.order,
      this.status,
      this.createdAt,
      now,
    );
  }

  /**
   * ステータスを更新
   */
  updateStatus(status: Status): TaskItem {
    const now = new Date();
    return new TaskItem(
      this.id,
      this.taskId,
      this.priority,
      this.density,
      this.durationTime,
      this.content,
      this.output,
      this.isRequired,
      this.order,
      status,
      this.createdAt,
      now,
    );
  }

  /**
   * 順序を更新
   */
  updateOrder(order: number): TaskItem {
    const now = new Date();
    return new TaskItem(
      this.id,
      this.taskId,
      this.priority,
      this.density,
      this.durationTime,
      this.content,
      this.output,
      this.isRequired,
      order,
      this.status,
      this.createdAt,
      now,
    );
  }

  /**
   * 内容を更新
   */
  updateContent(content: string): TaskItem {
    const now = new Date();
    return new TaskItem(
      this.id,
      this.taskId,
      this.priority,
      this.density,
      this.durationTime,
      content,
      this.output,
      this.isRequired,
      this.order,
      this.status,
      this.createdAt,
      now,
    );
  }

  /**
   * 同一TaskItemかどうかを判定
   */
  equals(other: TaskItem): boolean {
    return this.id === other.id;
  }
}

