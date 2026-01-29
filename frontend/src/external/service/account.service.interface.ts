/**
 * Account Service Interface
 * アカウントサービスのインターフェイス
 */

import type { Account } from "../domain/account/account.entity";

/**
 * アカウントサービスインターフェイス
 */
export interface IAccountService {
  /**
   * アカウントIDでアカウントを取得
   * @param id アカウントID
   * @returns アカウント（存在しない場合はnull）
   */
  getAccountById(id: string): Promise<Account | null>;

  /**
   * 複数のアカウントIDでアカウントを取得
   * @param ids アカウントIDの配列
   * @returns アカウントの配列
   */
  getAccountsByIds(ids: string[]): Promise<Account[]>;

  /**
   * Emailでアカウントを取得
   * @param email メールアドレス
   * @returns アカウント（存在しない場合はnull）
   */
  getAccountByEmail(email: string): Promise<Account | null>;

  /**
   * アカウントを作成または取得
   * @param data アカウント作成データ
   * @returns アカウント
   */
  createOrGetAccount(data: {
    email: string;
    name: string;
    provider: string;
    providerAccountId: string;
    thumbnail?: string;
  }): Promise<Account>;
}

