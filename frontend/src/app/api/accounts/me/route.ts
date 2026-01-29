import { type NextRequest, NextResponse } from "next/server";
import { getCurrentAccountQuery } from "../../../../external/handler/account.query.server";

/**
 * Account API Route
 * GET /api/accounts/me - 現在のアカウント取得
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: 認証情報からaccountIdを取得（現在はリクエストから取得する必要がある）
    // 認証実装後は、セッションやJWTからaccountIdを取得する
    const accountId = request.headers.get("x-account-id") || "";

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    // ハンドラーを呼び出し
    const account = await getCurrentAccountQuery(accountId);

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    console.error("Error getting current account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

