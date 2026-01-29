import "server-only";

/**
 * Task Command Handler (Server Only)
 * タスク関連のコマンドハンドラー（サーバー側のみ）
 */

import type {
  CreateTaskResponse,
  DeleteTaskResponse,
  UpdateTaskResponse,
  UpdateTaskItemOutputResponse,
  UpdateTaskReviewResponse,
  CreateTaskRequest,
} from "../dto/task.dto";
import {
  CreateTaskRequestSchema,
  UpdateTaskRequestSchema,
  UpdateTaskItemOutputRequestSchema,
  UpdateTaskReviewRequestSchema,
} from "../dto/task.dto";
// import { accountService } from "../service/account.service";
// import { taskService } from "../service/task.service";
// import { toTaskResponse } from "./task.converter";
import { OpenAPI } from "../client/api/generated";
import { TasksService } from "../client/api/generated";
import { TaskItemsService } from "../client/api/generated";
import type {
  Models_Task_CreateTaskRequest,
  Models_Task_DeleteTaskRequest,
  Models_Task_UpdateTaskRequest,
  Models_Task_UpdateTaskItemOutputRequest,
  Models_Task_UpdateTaskReviewRequest,
} from "../client/api/generated";

// GoのAPIベースURLを環境変数から設定（デフォルト: http://localhost:8080）
if (typeof process !== "undefined" && process.env) {
  OpenAPI.BASE = process.env.API_BASE_URL || "http://localhost:8080";
}

/**
 * バリデーションエラー
 */
export class ValidationError extends Error {
  constructor(
    public readonly errors: Array<{ field: string; message: string }>,
  ) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

/**
 * タスクを作成
 * @param ownerId オーナーID
 * @param request タスク作成リクエスト（未検証）
 * @returns 作成されたタスク
 * @throws {ValidationError} バリデーションエラー時
 */
export async function createTaskCommand(
  ownerId: string,
  request: CreateTaskRequest,
): Promise<CreateTaskResponse> {
  // バリデーション
  const parseResult = CreateTaskRequestSchema.safeParse(request);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  // GoのAPIエンドポイントを呼び出し
  const response = await TasksService.tasksCreateTask({
    requestBody: {
      ...parseResult.data,
      ownerId: ownerId,
    } as Models_Task_CreateTaskRequest,
  });

  return response as CreateTaskResponse;

  // 以下は既存のサービス層呼び出し（コメントアウト）
  // // 日付をDateオブジェクトに変換
  // const date = new Date(parseResult.data.date);
  //
  // // サービスを呼び出し（バリデーション済みデータをそのまま渡す）
  // const task = await taskService.createTask(
  //   ownerId,
  //   parseResult.data.title,
  //   date,
  //   parseResult.data.taskItems,
  // );
  //
  // // AccountServiceからアカウント情報を取得
  // const owner = await accountService.getAccountById(task.ownerId);
  //
  // if (!owner) {
  //   throw new Error("Owner not found");
  // }
  //
  // // ドメインエンティティをDTOに変換
  // return toTaskResponse(task, owner);
}

/**
 * タスクを更新
 * @param taskId タスクID
 * @param ownerId オーナーID
 * @param request タスク更新リクエスト（未検証）
 * @returns 更新されたタスク
 * @throws {ValidationError} バリデーションエラー時
 */
export async function updateTaskCommand(
  taskId: string,
  ownerId: string,
  request: unknown,
): Promise<UpdateTaskResponse> {
  // バリデーション
  const parseResult = UpdateTaskRequestSchema.safeParse(request);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  // GoのAPIエンドポイントを呼び出し
  const response = await TasksService.tasksUpdateTask({
    taskId: taskId,
    requestBody: {
      ...parseResult.data,
      ownerId: ownerId,
    } as Models_Task_UpdateTaskRequest,
  });

  return response as UpdateTaskResponse;

  // 以下は既存のサービス層呼び出し（コメントアウト）
  // // 日付をDateオブジェクトに変換
  // const date = new Date(parseResult.data.date);
  //
  // // サービスを呼び出し（バリデーション済みデータをそのまま渡す）
  // const task = await taskService.updateTask(
  //   taskId,
  //   ownerId,
  //   parseResult.data.title,
  //   date,
  //   parseResult.data.taskItems,
  // );
  //
  // // AccountServiceからアカウント情報を取得
  // const owner = await accountService.getAccountById(task.ownerId);
  //
  // if (!owner) {
  //   throw new Error("Owner not found");
  // }
  //
  // // ドメインエンティティをDTOに変換
  // return toTaskResponse(task, owner);
}

/**
 * タスクを削除
 * @param taskId タスクID
 * @param ownerId オーナーID
 * @returns 削除結果
 */
export async function deleteTaskCommand(
  taskId: string,
  ownerId: string,
): Promise<DeleteTaskResponse> {
  // GoのAPIエンドポイントを呼び出し
  const response = await TasksService.tasksDeleteTask({
    taskId: taskId,
    requestBody: {
      ownerId: ownerId,
    } as Models_Task_DeleteTaskRequest,
  });

  return response as DeleteTaskResponse;

  // 以下は既存のサービス層呼び出し（コメントアウト）
  // // サービスを呼び出し（オーナーチェック含む）
  // await taskService.deleteTask(taskId, ownerId);
  //
  // return { success: true };
}

/**
 * 子タスクのアウトプットを更新
 * @param taskItemId 子タスクID
 * @param ownerId オーナーID
 * @param request 子タスク更新リクエスト（未検証）
 * @returns 更新されたタスク
 * @throws {ValidationError} バリデーションエラー時
 */
export async function updateTaskItemCommand(
  taskItemId: string,
  ownerId: string,
  request: unknown,
): Promise<UpdateTaskItemOutputResponse> {
  // バリデーション
  const parseResult = UpdateTaskItemOutputRequestSchema.safeParse(request);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  // GoのAPIエンドポイントを呼び出し
  const response = await TaskItemsService.taskItemsUpdateTaskItemOutput({
    taskItemId: taskItemId,
    requestBody: {
      ...parseResult.data,
      ownerId: ownerId,
    } as Models_Task_UpdateTaskItemOutputRequest,
  });

  return response as UpdateTaskItemOutputResponse;

  // 以下は既存のサービス層呼び出し（コメントアウト）
  // // サービスを呼び出し（バリデーション済みデータをそのまま渡す）
  // const task = await taskService.updateTaskItemOutput(
  //   taskItemId,
  //   ownerId,
  //   parseResult.data.output,
  // );
  //
  // // AccountServiceからアカウント情報を取得
  // const owner = await accountService.getAccountById(task.ownerId);
  //
  // if (!owner) {
  //   throw new Error("Owner not found");
  // }
  //
  // // ドメインエンティティをDTOに変換
  // return toTaskResponse(task, owner);
}

/**
 * タスクの振り返りを更新
 * @param taskId タスクID
 * @param ownerId オーナーID
 * @param request タスク振り返り更新リクエスト（未検証）
 * @returns 更新されたタスク
 * @throws {ValidationError} バリデーションエラー時
 */
export async function updateTaskReviewCommand(
  taskId: string,
  ownerId: string,
  request: unknown,
): Promise<UpdateTaskReviewResponse> {
  // バリデーション
  const parseResult = UpdateTaskReviewRequestSchema.safeParse(request);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  // GoのAPIエンドポイントを呼び出し
  const response = await TasksService.tasksUpdateTaskReview({
    taskId: taskId,
    requestBody: {
      ...parseResult.data,
      ownerId: ownerId,
    } as Models_Task_UpdateTaskReviewRequest,
  });

  return response as UpdateTaskReviewResponse;

  // 以下は既存のサービス層呼び出し（コメントアウト）
  // // サービスを呼び出し（バリデーション済みデータをそのまま渡す）
  // const task = await taskService.updateReview(
  //   taskId,
  //   ownerId,
  //   parseResult.data.review,
  // );
  //
  // // AccountServiceからアカウント情報を取得
  // const owner = await accountService.getAccountById(task.ownerId);
  //
  // if (!owner) {
  //   throw new Error("Owner not found");
  // }
  //
  // // ドメインエンティティをDTOに変換
  // return toTaskResponse(task, owner);
}
