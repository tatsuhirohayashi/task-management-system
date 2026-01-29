/**
 * Account Converter
 * アカウントエンティティをDTOに変換
 */

import type { Account } from "../domain/account/account.entity";
import type { AccountResponse } from "../dto/account.dto";

/**
 * AccountエンティティをAccountResponseに変換
 */
export function toAccountResponse(account: Account): AccountResponse {
  return {
    id: account.id,
    email: account.email.getValue(),
    firstName: account.firstName,
    lastName: account.lastName,
    fullName: account.getFullName(),
    thumbnail: account.thumbnail,
    lastLoginAt: account.lastLoginAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

