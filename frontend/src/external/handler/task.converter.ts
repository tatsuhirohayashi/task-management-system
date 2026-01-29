/**
 * Task Converter
 * ドメインエンティティをDTOに変換する
 */

import type {
  ListTaskResponse,
  TaskItemResponse,
  TaskOwnerResponse,
  TaskResponse,
} from "../dto/task.dto";
import type { Account } from "../domain/account/account.entity";
import type { Task } from "../domain/task/task.entity";
import type { TaskItem } from "../domain/task/task-item.entity";

/**
 * TaskItemエンティティをTaskItemResponse DTOに変換
 */
function toTaskItemResponse(taskItem: TaskItem): TaskItemResponse {
  return {
    id: taskItem.id,
    taskId: taskItem.taskId,
    priority: taskItem.priority.getValue() as "High" | "Medium" | "Low",
    density: taskItem.density.getValue() as "High" | "Medium" | "Low",
    durationTime: taskItem.durationTime.getValue() as 60 | 45 | 30 | 15,
    content: taskItem.content,
    output: taskItem.output,
    isRequired: taskItem.isRequired,
    order: taskItem.order,
    status: taskItem.status.getValue() as "NotStarted" | "InProgress" | "Completed",
  };
}

/**
 * AccountエンティティをTaskOwnerResponse DTOに変換
 */
function toTaskOwnerResponse(account: Account): TaskOwnerResponse {
  return {
    id: account.id,
    firstName: account.firstName,
    lastName: account.lastName,
    thumbnail: account.thumbnail,
  };
}

/**
 * TaskエンティティとAccountエンティティをTaskResponse DTOに変換
 */
export function toTaskResponse(
  task: Task,
  owner: Account,
): TaskResponse {
  const taskItemResponses: TaskItemResponse[] = task.taskItems.map(
    toTaskItemResponse,
  );

  // 統計情報を計算
  const plannedTaskCount = taskItemResponses.length;
  const plannedTaskDurationMinutes = taskItemResponses.reduce(
    (sum, item) => sum + item.durationTime,
    0,
  );
  const completedTaskCount = taskItemResponses.filter(
    (item) => item.status === "Completed",
  ).length;
  const completedTaskDurationMinutes = taskItemResponses
    .filter((item) => item.status === "Completed")
    .reduce((sum, item) => sum + item.durationTime, 0);
  const completionRate =
    plannedTaskCount > 0
      ? Math.round(((completedTaskCount / plannedTaskCount) * 100) * 10) / 10
      : 0;

  // 密度別の統計
  const highTasks = taskItemResponses.filter(
    (item) => item.density === "High",
  );
  const mediumTasks = taskItemResponses.filter(
    (item) => item.density === "Medium",
  );
  const lowTasks = taskItemResponses.filter(
    (item) => item.density === "Low",
  );

  const highTaskCount = highTasks.length;
  const highTaskDuration = highTasks.reduce(
    (sum, item) => sum + item.durationTime,
    0,
  );
  const highTaskRate =
    plannedTaskDurationMinutes > 0
      ? Math.round(((highTaskDuration / plannedTaskDurationMinutes) * 100) * 10) / 10
      : 0;

  const mediumTaskCount = mediumTasks.length;
  const mediumTaskDuration = mediumTasks.reduce(
    (sum, item) => sum + item.durationTime,
    0,
  );
  const mediumTaskRate =
    plannedTaskDurationMinutes > 0
      ? Math.round(((mediumTaskDuration / plannedTaskDurationMinutes) * 100) * 10) / 10
      : 0;

  const lowTaskCount = lowTasks.length;
  const lowTaskDuration = lowTasks.reduce(
    (sum, item) => sum + item.durationTime,
    0,
  );
  const lowTaskRate =
    plannedTaskDurationMinutes > 0
      ? Math.round(((lowTaskDuration / plannedTaskDurationMinutes) * 100) * 10) / 10
      : 0;

  return {
    id: task.id,
    ownerId: task.ownerId,
    owner: toTaskOwnerResponse(owner),
    title: task.title,
    date: task.date.toISOString().split("T")[0],
    review: task.review,
    taskItems: taskItemResponses,
    plannedTaskCount,
    plannedTaskDurationMinutes,
    completedTaskCount,
    completedTaskDurationMinutes,
    completionRate,
    HighTaskCount: highTaskCount,
    HighTaskDuration: highTaskDuration,
    HighTaskRate: highTaskRate,
    MediumTaskCount: mediumTaskCount,
    MediumTaskDuration: mediumTaskDuration,
    MediumTaskRate: mediumTaskRate,
    LowTaskCount: lowTaskCount,
    LowTaskDuration: lowTaskDuration,
    LowTaskRate: lowTaskRate,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

/**
 * Taskの配列とAccountのMapをTaskResponseの配列に変換
 */
export function toTaskResponseList(
  tasks: Task[],
  accountMap: Map<string, Account>,
): ListTaskResponse {
  return tasks
    .map((task) => {
      const owner = accountMap.get(task.ownerId);
      if (!owner) {
        return null; // オーナーが存在しない場合はスキップ
      }
      return toTaskResponse(task, owner);
    })
    .filter((item): item is TaskResponse => item !== null);
}

