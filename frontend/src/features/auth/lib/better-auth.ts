import "server-only";
import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
import { unstable_cache, updateTag } from "next/cache";
import { createOrGetAccountCommand } from "@/external/handler/account.command.server";
import { getAccountByEmailQuery } from "@/external/handler/account.query.server";
import type { AccountResponse } from "@/external/dto/account.dto";

/**
 * better-auth 認証フロー
 *
 * 【Google OAuth 認証時】
 * 1. ユーザーがGoogleでログイン
 * 2. Googleから認証情報（id, email, name, image）が返される
 * 3. onSuccess コールバックが呼ばれる（1回だけ）
 *    → ここでアカウントをDBに保存
 * 4. better-auth がセッション（Cookie）を作成
 *    → user, session は better-auth が自動で作成する基本情報
 * 5. customSession が呼ばれ、追加データ（account）をセッションに付与
 *
 * 【認証済みリクエスト時】
 * 1. リクエストごとに customSession が呼ばれる（毎回実行）
 * 2. Cookieから user, session を復元（better-auth が自動で行う）
 * 3. DBから account を取得してセッションに追加
 *
 * 【セッション構造】
 * - user: { id, email, name, image, ... }  ← better-auth が自動で作成
 * - session: { id, expiresAt, token, ... } ← better-auth が自動で作成
 * - account: { ... }                       ← customSession の return で追加
 */

// customSessionは毎回実行されるため、Next.jsのunstable_cacheでキャッシング
// キャッシュ期間: 5分（セッションの有効期間と同等）
// NOTE: unstable_cacheは関数の引数も自動的にキャッシュキーに含まれる
const getCachedAccount = unstable_cache(
  async (email: string): Promise<AccountResponse | null> => {
    return await getAccountByEmailQuery(email);
  },
  ["account-by-email"], // 引数emailは自動的にキャッシュキーに含まれる
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ["account"],
  },
);

export const auth = betterAuth({
  // データベース設定なし = stateless mode
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5分間キャッシュ
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      /**
       * OAuth認証成功時に1回だけ呼ばれるコールバック
       * ctx.user: Googleから取得したユーザー情報
       */
      async onSuccess(ctx: {
        user: {
          id: string;
          email: string;
          name: string;
          image?: string;
        };
      }) {
        try {
          await createOrGetAccountCommand({
            email: ctx.user.email,
            name: ctx.user.name || ctx.user.email,
            provider: "google",
            providerAccountId: ctx.user.id,
            thumbnail: ctx.user.image,
          });
          // アカウント更新後にキャッシュを無効化して、customSessionで最新データを取得
          updateTag("account");
        } catch (error) {
          console.error(
            "[better-auth] Failed to save account in onSuccess:",
            error,
          );
          throw error; // エラーを再スローして認証を失敗させる
        }
      },
    },
  },
  // ベースURLの設定
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  // セッション設定 - statelessモードではデフォルトでクッキーベース
  plugins: [
    /**
     * セッション検証時に毎回呼ばれるコールバック
     *
     * @param user - better-auth が自動で作成した基本ユーザー情報（Cookieから復元）
     *               { id, email, name, image, createdAt, updatedAt, emailVerified }
     * @param session - better-auth が自動で作成した基本セッション情報
     *               { id, userId, expiresAt, token, ipAddress, userAgent, ... }
     * @returns - return で返した値がセッションに追加される
     *            ここでは account を追加している
     */
    customSession(async ({ user, session }) => {
      let account = await getCachedAccount(user.email);

      // accountが存在する場合は、セッションに account を追加して返す
      if (account) {
        // user, session: 基本情報をそのまま返す
        // account: 追加データとしてセッションに含める → session.account でアクセス可能に
        return { user, session, account };
      }

      // accountが存在しない場合は、DB保存を試みる（初回ログイン時）
      try {
        await createOrGetAccountCommand({
          email: user.email,
          name: user.name || user.email,
          provider: "google",
          providerAccountId: user.id,
          thumbnail: user.image,
        });
        console.log("[better-auth] Account created successfully");

        // DB保存後、再度取得（キャッシュを経由せずに）
        account = await getAccountByEmailQuery(user.email);
        if (!account) {
          console.error("[better-auth] Account still not found after creation");
          throw new Error("Failed to create account");
        }

        return { user, session, account };
      } catch (error) {
        console.error("[better-auth] Failed to create account:", error);
        throw new Error("Failed to create account");
      }
    }),
  ],
});