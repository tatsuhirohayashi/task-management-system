/**
 * Domain Service
 * ドメイン設計書に基づくドメインサービス
 * 複数の集約にまたがるビジネスロジックを扱う
 */

import type { Account } from './account/account.entity';
import type { Task } from './task/task.entity';
import type { TaskItem } from './task/task-item.entity';

/**
 * 子タスクの優先度を変更していいかを判定する
 * オーナーならOK、他人ならNGという条件をチェックする係
 * 関わるドメイン: Account + Task
 */
export function canChangePriority(
  account: Account,
  task: Task,
  taskItem: TaskItem,
): boolean {
  // タスクのオーナーかどうかを確認
  if (!task.isOwnedBy(account.id)) {
    return false;
  }
  // TaskItemがTaskに属しているか確認
  const belongsToTask = task.taskItems.some((item) => item.id === taskItem.id);
  if (!belongsToTask) {
    return false;
  }
  return true;
}

/**
 * 子タスクの密度を変更していいかを判定する
 * オーナーならOK、他人ならNGという条件をチェックする係
 * 関わるドメイン: Account + Task
 */
export function canChangeDensity(
  account: Account,
  task: Task,
  taskItem: TaskItem,
): boolean {
  // タスクのオーナーかどうかを確認
  if (!task.isOwnedBy(account.id)) {
    return false;
  }
  // TaskItemがTaskに属しているか確認
  const belongsToTask = task.taskItems.some((item) => item.id === taskItem.id);
  if (!belongsToTask) {
    return false;
  }
  return true;
}

/**
 * 子タスクの継続時間を変更していいかを判定する
 * オーナーならOK、他人ならNGという条件をチェックする係
 * 関わるドメイン: Account + Task
 */
export function canChangeDurationTime(
  account: Account,
  task: Task,
  taskItem: TaskItem,
): boolean {
  // タスクのオーナーかどうかを確認
  if (!task.isOwnedBy(account.id)) {
    return false;
  }
  // TaskItemがTaskに属しているか確認
  const belongsToTask = task.taskItems.some((item) => item.id === taskItem.id);
  if (!belongsToTask) {
    return false;
  }
  return true;
}

/**
 * 子タスクのステータスを変更していいかを判定する
 * オーナーならOK、他人ならNGという条件をチェックする係
 * 関わるドメイン: Account + Task
 */
export function canChangeStatus(
  account: Account,
  task: Task,
  taskItem: TaskItem,
): boolean {
  // タスクのオーナーかどうかを確認
  if (!task.isOwnedBy(account.id)) {
    return false;
  }
  // TaskItemがTaskに属しているか確認
  const belongsToTask = task.taskItems.some((item) => item.id === taskItem.id);
  if (!belongsToTask) {
    return false;
  }
  return true;
}

