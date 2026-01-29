/**
 * Transaction Repository
 * トランザクション処理を共通化
 */

import { db } from "../client/database";
import type { Database } from "../client/database/client";

/**
 * トランザクション内で処理を実行
 * @param callback トランザクション内で実行する処理
 * @returns 処理の結果
 */
export async function withTransaction<T>(
  callback: (tx: Database) => Promise<T>,
): Promise<T> {
  return await db.transaction(callback);
}

