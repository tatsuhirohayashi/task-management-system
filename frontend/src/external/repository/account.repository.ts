/**
 * Account Repository Implementation
 * アカウントリポジトリの実装
 */

import { eq, inArray } from "drizzle-orm";
import { db } from "../client/database";
import { accounts } from "../client/database/schema";
import { Account } from "../domain/account/account.entity";
import { Email } from "../domain/shared/value-objects";
import type { IAccountRepository } from "./account.repository.interface";

/**
 * アカウントリポジトリの実装
 */
export class AccountRepository implements IAccountRepository {
  /**
   * アカウントIDでアカウントを取得
   */
  async findById(id: string): Promise<Account | null> {
    const result = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const accountData = result[0];

    // Accountエンティティを作成
    return Account.create({
      id: accountData.id,
      email: Email.create(accountData.email),
      firstName: accountData.firstName,
      lastName: accountData.lastName,
      isActive: accountData.isActive,
      provider: accountData.provider,
      providerAccountId: accountData.providerAccountId,
      thumbnail: accountData.thumbnail,
      lastLoginAt: accountData.lastLoginAt,
      createdAt: accountData.createdAt,
      updatedAt: accountData.updatedAt,
    });
  }

  /**
   * 複数のアカウントIDでアカウントを取得
   */
  async findManyByIds(ids: string[]): Promise<Account[]> {
    if (ids.length === 0) {
      return [];
    }

    const results = await db
      .select()
      .from(accounts)
      .where(inArray(accounts.id, ids));

    // Accountエンティティを作成
    return results.map((accountData) =>
      Account.create({
        id: accountData.id,
        email: Email.create(accountData.email),
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        isActive: accountData.isActive,
        provider: accountData.provider,
        providerAccountId: accountData.providerAccountId,
        thumbnail: accountData.thumbnail,
        lastLoginAt: accountData.lastLoginAt,
        createdAt: accountData.createdAt,
        updatedAt: accountData.updatedAt,
      }),
    );
  }

  /**
   * Emailでアカウントを取得
   */
  async findByEmail(email: string): Promise<Account | null> {
    const result = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, email))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const accountData = result[0];

    // Accountエンティティを作成
    return Account.create({
      id: accountData.id,
      email: Email.create(accountData.email),
      firstName: accountData.firstName,
      lastName: accountData.lastName,
      isActive: accountData.isActive,
      provider: accountData.provider,
      providerAccountId: accountData.providerAccountId,
      thumbnail: accountData.thumbnail,
      lastLoginAt: accountData.lastLoginAt,
      createdAt: accountData.createdAt,
      updatedAt: accountData.updatedAt,
    });
  }

  /**
   * アカウントを作成
   */
  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    provider: string;
    providerAccountId: string;
    thumbnail?: string | null;
  }): Promise<Account> {
    const result = await db
      .insert(accounts)
      .values({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        thumbnail: data.thumbnail ?? null,
      })
      .returning();

    const accountData = result[0];

    // Accountエンティティを作成
    return Account.create({
      id: accountData.id,
      email: Email.create(accountData.email),
      firstName: accountData.firstName,
      lastName: accountData.lastName,
      isActive: accountData.isActive,
      provider: accountData.provider,
      providerAccountId: accountData.providerAccountId,
      thumbnail: accountData.thumbnail,
      lastLoginAt: accountData.lastLoginAt,
      createdAt: accountData.createdAt,
      updatedAt: accountData.updatedAt,
    });
  }
}

// シングルトンインスタンスをエクスポート
export const accountRepository = new AccountRepository();

