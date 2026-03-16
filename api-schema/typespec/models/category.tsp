import "./common.tsp";

namespace TaskManagement.Models.Category;

/**
 * カテゴリーレスポンス
 */
model CategoryResponse {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}

/**
 * カテゴリー一覧レスポンス
 */
alias ListCategoryResponse = CategoryResponse[];

/**
 * カテゴリー作成リクエスト
 */
model CreateCategoryRequest {
  name: string;
}

/**
 * カテゴリー作成レスポンス
 */
alias CreateCategoryResponse = CategoryResponse;

/**
 * カテゴリー更新リクエスト
 */
model UpdateCategoryRequest {
  name: string;
}

/**
 * カテゴリー更新レスポンス
 */
alias UpdateCategoryResponse = CategoryResponse;

/**
 * カテゴリー削除レスポンス
 */
model DeleteCategoryResponse {
  success: boolean;
}
