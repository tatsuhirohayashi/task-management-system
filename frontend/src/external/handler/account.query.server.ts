import "server-only";

/**
 * Account Query Handler (Server Only)
 * アカウント関連のクエリハンドラー（サーバー側のみ）
 */

import type { GetCurrentAccountResponse } from "../dto/account.dto";
import { AccountIdSchema, EmailSchema } from "../dto/account.dto";
// import { accountService } from "../service/account.service";
// import { toAccountResponse } from "./account.converter";
import { AccountsService } from "../client/api/generated";
import { OpenAPI } from "../client/api/generated";

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
 * 現在のアカウントを取得
 * @param accountId アカウントID
 * @returns アカウント情報
 * @throws {ValidationError} バリデーションエラー時
 */
export async function getCurrentAccountQuery(
  accountId: string,
): Promise<GetCurrentAccountResponse | null> {
  // バリデーション
  const parseResult = AccountIdSchema.safeParse(accountId);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join(".") || "accountId",
        message: issue.message,
      })),
    );
  }

  try {
    // GoのAPIエンドポイントを呼び出し（/api/accounts/me）
    const response = await AccountsService.accountsGetCurrentAccount();
    return response as GetCurrentAccountResponse;
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
  // // サービスからアカウントを取得
  // const account = await accountService.getAccountById(parseResult.data);
  //
  // if (!account) {
  //   return null;
  // }
  //
  // // ドメインエンティティをDTOに変換
  // return toAccountResponse(account);
}

/**
 * アカウントIDでアカウントを取得
 * @param accountId アカウントID
 * @returns アカウント情報（存在しない場合はnull）
 * @throws {ValidationError} バリデーションエラー時
 */
export async function getAccountByIdQuery(
  accountId: string,
): Promise<GetCurrentAccountResponse | null> {
  // バリデーション
  const parseResult = AccountIdSchema.safeParse(accountId);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join(".") || "accountId",
        message: issue.message,
      })),
    );
  }

  try {
    // GoのAPIエンドポイントを呼び出し（/api/accounts/{accountId}）
    const response = await AccountsService.accountsGetAccountById({
      accountId: parseResult.data,
    });
    return response as GetCurrentAccountResponse;
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
  // // サービスからアカウントを取得
  // const account = await accountService.getAccountById(parseResult.data);
  //
  // if (!account) {
  //   return null;
  // }
  //
  // // ドメインエンティティをDTOに変換
  // return toAccountResponse(account);
}

/**
 * Emailでアカウントを取得
 * @param email メールアドレス
 * @returns アカウント情報（存在しない場合はnull）
 * @throws {ValidationError} バリデーションエラー時
 */
export async function getAccountByEmailQuery(
  email: string,
): Promise<GetCurrentAccountResponse | null> {
  // バリデーション
  const parseResult = EmailSchema.safeParse(email);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join(".") || "email",
        message: issue.message,
      })),
    );
  }

  try {
    // GoのAPIエンドポイントを呼び出し（/api/accounts/by-email）
    const response = await AccountsService.accountsGetAccountByEmail({
      email: parseResult.data,
    });
    return response as GetCurrentAccountResponse;
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
  // // サービスからアカウントを取得
  // const account = await accountService.getAccountByEmail(parseResult.data);
  //
  // if (!account) {
  //   return null;
  // }
  //
  // // ドメインエンティティをDTOに変換
  // return toAccountResponse(account);
}
