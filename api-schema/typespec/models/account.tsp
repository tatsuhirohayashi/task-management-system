import "./common.tsp";

namespace TaskManagement.Models.Account;

/**
 * アカウント情報
 */
model Account {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  thumbnail?: string;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

/**
 * アカウントレスポンス
 */
model AccountResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  thumbnail?: string;
  lastLoginAt?: string; // ISO 8601形式
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}

/**
 * OAuth認証リクエスト
 */
model CreateOrGetAccountRequest {
  email: string;
  name: string;
  thumbnail?: string;
  provider: string;
  providerAccountId: string;
}

