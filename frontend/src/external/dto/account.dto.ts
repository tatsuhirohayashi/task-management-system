/**
 * Account DTO
 * アカウント関連のデータ転送オブジェクト
 */

import { z } from "zod";

/**
 * アカウントレスポンス
 */
export interface AccountResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  thumbnail: string | null;
  lastLoginAt: string | null; // ISO 8601形式
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}

/**
 * 現在のアカウント取得レスポンス
 */
export type GetCurrentAccountResponse = AccountResponse;

/**
 * アカウントIDのバリデーションスキーマ
 */
export const AccountIdSchema = z.string().uuid({
  message: "アカウントIDは有効なUUIDである必要があります",
});

/**
 * Emailのバリデーションスキーマ
 */
export const EmailSchema = z
  .string()
  .min(1, { message: "Emailは必須です" })
  .email({ message: "有効なEmail形式である必要があります" });

/**
 * アカウント作成または取得リクエストのスキーマ
 */
export const CreateOrGetAccountRequestSchema = z.object({
  email: EmailSchema,
  name: z.string().min(1, { message: "nameは1文字以上である必要があります" }),
  provider: z.string().min(1, { message: "providerは必須です" }),
  providerAccountId: z.string().min(1, { message: "providerAccountIdは必須です" }),
  thumbnail: z
    .string()
    .url({ message: "thumbnailは有効なURL形式である必要があります" })
    .optional(),
});

/**
 * アカウント作成または取得リクエスト
 */
export type CreateOrGetAccountRequest = z.infer<
  typeof CreateOrGetAccountRequestSchema
>;

/**
 * アカウント作成または取得レスポンス
 */
export type CreateOrGetAccountResponse = AccountResponse;

