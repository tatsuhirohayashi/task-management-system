import "server-only";

/**
 * Account Command Handler (Server Only)
 * アカウント関連のコマンドハンドラー（サーバー側のみ）
 */

import type { CreateOrGetAccountResponse } from "../dto/account.dto";
import { CreateOrGetAccountRequestSchema } from "../dto/account.dto";
// import { accountService } from "../service/account.service";
// import { toAccountResponse } from "./account.converter";
import { AccountsService } from "../client/api/generated";
import { OpenAPI } from "../client/api/generated";
import type { Models_Account_CreateOrGetAccountRequest } from "../client/api/generated";

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
 * アカウントを作成または取得
 * @param request アカウント作成または取得リクエスト（未検証）
 * @returns アカウント情報
 * @throws {ValidationError} バリデーションエラー時
 */
export async function createOrGetAccountCommand(
  request: unknown,
): Promise<CreateOrGetAccountResponse> {
  // バリデーション
  const parseResult = CreateOrGetAccountRequestSchema.safeParse(request);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  // GoのAPIエンドポイントを呼び出し（/api/accounts/auth）
  const response = await AccountsService.accountsCreateOrGetAccount({
    requestBody: parseResult.data as Models_Account_CreateOrGetAccountRequest,
  });

  return response as CreateOrGetAccountResponse;

  // 以下は既存のサービス層呼び出し（コメントアウト）
  // // サービスを呼び出し（バリデーション済みデータをそのまま渡す）
  // const account = await accountService.createOrGetAccount({
  //   email: parseResult.data.email,
  //   name: parseResult.data.name,
  //   provider: parseResult.data.provider,
  //   providerAccountId: parseResult.data.providerAccountId,
  //   thumbnail: parseResult.data.thumbnail,
  // });
  //
  // // ドメインエンティティをDTOに変換
  // return toAccountResponse(account);
}
