import "server-only";

/**
 * Task Query Handler (Server Only)
 * タスク関連のクエリハンドラー（サーバー側のみ）
 */

import type {
  GetTaskByIdRequest,
  ListTaskResponse,
  TaskFilters,
  TaskResponse,
} from "../dto/task.dto";
import { GetTaskByIdRequestSchema } from "../dto/task.dto";
// import type { Account } from "../domain/account/account.entity";
// import { accountService } from "../service/account.service";
// import { toTaskResponse, toTaskResponseList } from "./task.converter";
// import { taskService } from "../service/task.service";
import { ValidationError } from "./task.command.server";
import { TasksService } from "../client/api/generated";
import { OpenAPI } from "../client/api/generated";
import { requireAuthServer } from "@/features/auth/servers/redirect.server";

// GoのAPIベースURLを環境変数から設定（デフォルト: http://localhost:8080）
if (typeof process !== "undefined" && process.env) {
  OpenAPI.BASE = process.env.API_BASE_URL || "http://localhost:8080";
}

/**
 * タスク一覧を取得
 * @param filters フィルタ条件
 * @param accountId 認証されたアカウントID（オプショナル、フィルタにownerIdが指定されていない場合に使用）
 * @returns タスク一覧
 */
export async function listTaskQuery(
  filters: TaskFilters,
  accountId?: string,
): Promise<ListTaskResponse> {
  await requireAuthServer();
  // ownerIdが指定されていない場合は、認証されたアカウントIDを使用
  const ownerId = filters.ownerId || accountId;

  // GoのAPIエンドポイントを呼び出し（/api/tasks）
  const response = await TasksService.tasksListTasks({
    yearMonth: filters["year-month"],
    ownerId: ownerId,
    q: filters.q,
    sort: filters.sort,
  });

  return response as ListTaskResponse;

  // 以下は既存のサービス層呼び出し（コメントアウト）
  // // サービスを呼び出し（ドメインエンティティを取得）
  // const tasks = await taskService.getTaskList(filters);
  //
  // // オーナーIDのリストを取得
  // const ownerIds = [...new Set(tasks.map((task) => task.ownerId))];
  //
  // // AccountServiceからアカウント情報を取得
  // const accounts = await accountService.getAccountsByIds(ownerIds);
  //
  // // アカウントをIDでマッピング
  // const accountMap = new Map<string, Account>(
  //   accounts.map((account) => [account.id, account]),
  // );
  //
  // // ドメインエンティティをDTOに変換
  // return toTaskResponseList(tasks, accountMap);
}

/**
 * タスクIDでタスクを取得
 * @param request タスクID取得リクエスト（未検証）
 * @param accountId 認証されたアカウントID（オプショナル、将来的に権限チェックなどで使用）
 * @returns タスク（存在しない場合はnull）
 * @throws {ValidationError} バリデーションエラー時
 */
export async function getTaskByIdQuery(
  request: GetTaskByIdRequest,
  _accountId?: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<TaskResponse | null> {
  // バリデーション
  const parseResult = GetTaskByIdRequestSchema.safeParse(request);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  try {
    // GoのAPIエンドポイントを呼び出し（/api/tasks/{taskId}）
    const response = await TasksService.tasksGetTaskById({
      taskId: parseResult.data.id,
    });

    return response as TaskResponse;
  } catch (error: unknown) {
    // 404エラーの場合はnullを返す
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return null;
    }
    throw error;
  }

  // 以下は既存のサービス層呼び出し（コメントアウト）
  // // サービスを呼び出し（ドメインエンティティを取得）
  // const task = await taskService.getTaskById(parseResult.data.id);
  //
  // // タスクが存在しない場合はnullを返す
  // if (!task) {
  //   return null;
  // }
  //
  // // AccountServiceからアカウント情報を取得
  // const owner = await accountService.getAccountById(task.ownerId);
  //
  // // オーナーが存在しない場合はnullを返す
  // if (!owner) {
  //   return null;
  // }
  //
  // // ドメインエンティティをDTOに変換
  // return toTaskResponse(task, owner);
}
