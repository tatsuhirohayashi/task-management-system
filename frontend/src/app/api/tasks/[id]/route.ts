/**
 * Task Detail API Route
 * GET /api/tasks/:id - タスク詳細取得
 * PUT /api/tasks/:id - タスク更新
 * DELETE /api/tasks/:id - タスク削除
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  deleteTaskCommand,
  updateTaskCommand,
  ValidationError,
} from "../../../../external/handler/task.command.server";
import { getTaskByIdQuery } from "../../../../external/handler/task.query.server";

/**
 * GET /api/tasks/:id
 * タスク詳細を取得
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // ハンドラーを呼び出し
    const task = await getTaskByIdQuery(id);

    // タスクが存在しない場合は404を返す
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/tasks/:id
 * タスクを更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // リクエストボディを取得
    const body = await request.json();

    // TODO: 認証情報からownerIdを取得（現在はリクエストから取得する必要がある）
    // 認証実装後は、セッションやJWTからownerIdを取得する
    const ownerId = request.headers.get("x-owner-id") || "";

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 },
      );
    }

    // ハンドラーを呼び出し（バリデーション含む）
    const task = await updateTaskCommand(id, ownerId, body);

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    // バリデーションエラーの場合
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    // エラーメッセージに基づいて適切なステータスコードを返す
    if (error instanceof Error) {
      if (error.message === "Task not found") {
        return NextResponse.json(
          { error: "Task not found" },
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

    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/tasks/:id
 * タスクを削除
 */
export async function DELETE(
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

    // ハンドラーを呼び出し（オーナーチェック含む）
    const result = await deleteTaskCommand(id, ownerId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // エラーメッセージに基づいて適切なステータスコードを返す
    if (error instanceof Error) {
      if (error.message === "Task not found") {
        return NextResponse.json(
          { error: "Task not found" },
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

    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

