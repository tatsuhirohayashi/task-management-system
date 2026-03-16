/**
 * Category DTO
 * カテゴリー関連のデータ転送オブジェクト
 */

import { z } from "zod";

/**
 * カテゴリーレスポンス
 * backend / TypeSpec の CategoryResponse に対応
 */
export interface CategoryResponse {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}

/**
 * カテゴリー一覧レスポンス
 */
export type ListCategoryResponse = CategoryResponse[];

/**
 * カテゴリー作成リクエストのスキーマ
 */
export const CreateCategoryRequestSchema = z.object({
  name: z
    .string()
    .min(1, { message: "nameは1文字以上である必要があります" }),
});

/**
 * カテゴリー作成リクエスト
 */
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;

/**
 * カテゴリー作成レスポンス
 */
export type CreateCategoryResponse = CategoryResponse;

/**
 * カテゴリー更新リクエストのスキーマ
 */
export const UpdateCategoryRequestSchema = z.object({
  name: z
    .string()
    .min(1, { message: "nameは1文字以上である必要があります" }),
});

/**
 * カテゴリー更新リクエスト
 */
export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;

/**
 * カテゴリー更新レスポンス
 */
export type UpdateCategoryResponse = CategoryResponse;

/**
 * カテゴリー削除レスポンス
 */
export interface DeleteCategoryResponse {
  success: boolean;
}

