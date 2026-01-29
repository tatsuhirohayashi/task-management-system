/**
 * Account Entity
 * ドメイン設計書に基づくAccountエンティティ
 */

import { Email } from '../shared/value-objects';

/**
 * Accountエンティティ
 * ルール:
 * - 少なくとも名前（firstName）か苗字（lastName）のどちらかは必須
 * - provider + providerAccountIdの組み合わせは一意
 * - ログイン時にプロフィール情報と最終ログイン時刻を更新
 */
export class Account {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly isActive: boolean,
    public readonly provider: string,
    public readonly providerAccountId: string,
    public readonly thumbnail: string | null,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    // 少なくとも名前（firstName）か苗字（lastName）のどちらかは必須
    if (!firstName && !lastName) {
      throw new Error('firstNameまたはlastNameのどちらかは必須です');
    }
  }

  /**
   * Accountエンティティを作成
   */
  static create(params: {
    id: string;
    email: Email;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    provider: string;
    providerAccountId: string;
    thumbnail?: string | null;
    lastLoginAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Account {
    const now = new Date();
    return new Account(
      params.id,
      params.email,
      params.firstName,
      params.lastName,
      params.isActive ?? true,
      params.provider,
      params.providerAccountId,
      params.thumbnail ?? null,
      params.lastLoginAt ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now,
    );
  }

  /**
   * ログイン時にプロフィール情報と最終ログイン時刻を更新
   */
  updateOnLogin(params: {
    firstName?: string;
    lastName?: string;
    thumbnail?: string | null;
  }): Account {
    const now = new Date();
    return new Account(
      this.id,
      this.email,
      params.firstName ?? this.firstName,
      params.lastName ?? this.lastName,
      this.isActive,
      this.provider,
      this.providerAccountId,
      params.thumbnail ?? this.thumbnail,
      now, // 最終ログイン時刻を更新
      this.createdAt,
      now, // updatedAtを更新
    );
  }

  /**
   * フルネームを取得
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * 同一アカウントかどうかを判定
   */
  equals(other: Account): boolean {
    return this.id === other.id;
  }
}

