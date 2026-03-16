import "server-only";

/**
 * Category Command Handler (Server Only)
 * カテゴリー関連のコマンドハンドラー（サーバー側のみ）
 */

import type {
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
} from "../dto/category.dto";
import {
  CreateCategoryRequestSchema,
  UpdateCategoryRequestSchema,
} from "../dto/category.dto";
import { CategorysService, OpenAPI } from "../client/api/generated";

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
 * カテゴリーを作成
 * @param ownerId オーナーID
 * @param request カテゴリー作成リクエスト（未検証）
 * @returns 作成されたカテゴリー
 * @throws {ValidationError} バリデーションエラー時
 */
export async function createCategoryCommand(
  ownerId: string,
  request: unknown,
): Promise<CreateCategoryResponse> {
  const parseResult = CreateCategoryRequestSchema.safeParse(
    request as CreateCategoryRequest,
  );
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  // 認証済みアカウントIDをヘッダーに付与してGo APIを呼び出す
  OpenAPI.HEADERS = {
    "x-account-id": ownerId,
  };

  const response = await CategorysService.categorysCreateCategory({
    requestBody: {
      name: parseResult.data.name,
    },
  });

  return response as CreateCategoryResponse;
}

/**
 * カテゴリーを更新
 * @param categoryId カテゴリーID
 * @param ownerId オーナーID
 * @param request カテゴリー更新リクエスト（未検証）
 * @returns 更新されたカテゴリー
 * @throws {ValidationError} バリデーションエラー時
 */
export async function updateCategoryCommand(
  categoryId: string,
  ownerId: string,
  request: unknown,
): Promise<UpdateCategoryResponse> {
  const parseResult = UpdateCategoryRequestSchema.safeParse(
    request as UpdateCategoryRequest,
  );
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  OpenAPI.HEADERS = {
    "x-account-id": ownerId,
  };

  const response = await CategorysService.categorysUpdateCategory({
    categoryId,
    requestBody: {
      name: parseResult.data.name,
    },
  });

  return response as UpdateCategoryResponse;
}

/**
 * カテゴリーを削除
 * @param categoryId カテゴリーID
 * @param ownerId オーナーID
 * @returns 削除結果
 */
export async function deleteCategoryCommand(
  categoryId: string,
  ownerId: string,
): Promise<DeleteCategoryResponse> {
  OpenAPI.HEADERS = {
    "x-account-id": ownerId,
  };
  await CategorysService.categorysDeleteCategory({
    categoryId,
  });

  return { success: true };
}

