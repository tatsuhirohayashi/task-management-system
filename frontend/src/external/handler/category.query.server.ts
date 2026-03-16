import "server-only";

/**
 * Category Query Handler (Server Only)
 * カテゴリー関連のクエリハンドラー（サーバー側のみ）
 */

import type { ListCategoryResponse } from "../dto/category.dto";
import { CategorysService, OpenAPI } from "../client/api/generated";
import { requireAuthServer } from "@/features/auth/servers/redirect.server";

/**
 * カテゴリー一覧を取得
 * 認証済みユーザーのカテゴリー一覧を取得します。
 */
export async function listCategoriesQuery(
  accountId: string,
): Promise<ListCategoryResponse> {
  await requireAuthServer();

  // 認証済みアカウントIDをヘッダーに付与してGo APIを呼び出す
  OpenAPI.HEADERS = {
    "x-account-id": accountId,
  };

  const response = await CategorysService.categorysListCategorys();

  return response as ListCategoryResponse;
}

