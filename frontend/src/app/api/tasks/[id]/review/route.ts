import { type NextRequest, NextResponse } from "next/server";
import {
  updateTaskReviewCommand,
  ValidationError,
} from "../../../../../external/handler/task.command.server";

/**
 * Task Review API Route
 * PUT /api/tasks/:id/review - タスクの振り返り更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // TODO: 認証情報からownerIdを取得（現在はリクエストから取得する必要がある）
    // 認証実装後は、セッションやJWTからownerIdを取得する
    const ownerId = request.headers.get("x-owner-id") || "";

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 },
      );
    }

    // リクエストボディを取得
    const body = await request.json();

    // ハンドラーを呼び出し（バリデーション含む）
    const result = await updateTaskReviewCommand(id, ownerId, body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // バリデーションエラーの処理
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    // エラーメッセージに基づいて適切なステータスコードを返す
    if (error instanceof Error) {
      if (error.message === "Task not found") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 },
        );
      }
      if (error.message.includes("permission")) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 },
        );
      }
    }

    console.error("Error updating task review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

