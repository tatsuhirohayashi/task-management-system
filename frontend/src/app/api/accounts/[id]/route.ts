import { type NextRequest, NextResponse } from "next/server";
import { getAccountByIdQuery } from "../../../../external/handler/account.query.server";

/**
 * Account Detail API Route
 * GET /api/accounts/:id - アカウント詳細取得
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // ハンドラーを呼び出し
    const account = await getAccountByIdQuery(id);

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    console.error("Error getting account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

