/**
 * Account Service Implementation
 * アカウントサービスの実装
 */

import type { Account } from "../domain/account/account.entity";
import type { IAccountRepository } from "../repository/account.repository.interface";
import { accountRepository } from "../repository/account.repository";
import type { IAccountService } from "./account.service.interface";

/**
 * アカウントサービスの実装
 */
export class AccountService implements IAccountService {
  private readonly accountRepository: IAccountRepository;

  constructor(accountRepository: IAccountRepository) {
    this.accountRepository = accountRepository;
  }

  /**
   * アカウントIDでアカウントを取得
   */
  async getAccountById(id: string): Promise<Account | null> {
    return await this.accountRepository.findById(id);
  }

  /**
   * 複数のアカウントIDでアカウントを取得
   */
  async getAccountsByIds(ids: string[]): Promise<Account[]> {
    return await this.accountRepository.findManyByIds(ids);
  }

  /**
   * Emailでアカウントを取得
   */
  async getAccountByEmail(email: string): Promise<Account | null> {
    return await this.accountRepository.findByEmail(email);
  }

  /**
   * アカウントを作成または取得
   * nameは姓名に分割される
   */
  async createOrGetAccount(data: {
    email: string;
    name: string;
    provider: string;
    providerAccountId: string;
    thumbnail?: string;
  }): Promise<Account> {
    // 既存のアカウントを取得
    const existingAccount = await this.accountRepository.findByEmail(data.email);
    if (existingAccount) {
      return existingAccount;
    }

    // nameを姓名に分割（スペースで分割、最初の部分をfirstName、残りをlastName）
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // アカウントを作成
    return await this.accountRepository.create({
      email: data.email,
      firstName,
      lastName,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      thumbnail: data.thumbnail ?? null,
    });
  }
}

// シングルトンインスタンスをエクスポート
export const accountService = new AccountService(accountRepository);

