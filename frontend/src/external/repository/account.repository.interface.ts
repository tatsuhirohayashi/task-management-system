/**
 * Account Repository Interface
 * アカウントリポジトリのインターフェイス
 */

import type { Account } from "../domain/account/account.entity";

/**
 * アカウントリポジトリインターフェイス
 */
export interface IAccountRepository {
  /**
   * アカウントIDでアカウントを取得
   * @param id アカウントID
   * @returns アカウント（存在しない場合はnull）
   */
  findById(id: string): Promise<Account | null>;

  /**
   * 複数のアカウントIDでアカウントを取得
   * @param ids アカウントIDの配列
   * @returns アカウントの配列
   */
  findManyByIds(ids: string[]): Promise<Account[]>;

  /**
   * Emailでアカウントを取得
   * @param email メールアドレス
   * @returns アカウント（存在しない場合はnull）
   */
  findByEmail(email: string): Promise<Account | null>;

  /**
   * アカウントを作成
   * @param data アカウント作成データ
   * @returns 作成されたアカウント
   */
  create(data: {
    email: string;
    firstName: string;
    lastName: string;
    provider: string;
    providerAccountId: string;
    thumbnail?: string | null;
  }): Promise<Account>;
}

