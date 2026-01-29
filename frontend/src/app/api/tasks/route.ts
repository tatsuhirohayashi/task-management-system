/**
 * Tasks API Route
 * GET /api/tasks - タスク一覧取得
 * POST /api/tasks - タスク作成
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createTaskCommand,
  ValidationError,
} from "../../../external/handler/task.command.server";
import { listTaskQuery } from "../../../external/handler/task.query.server";
import type { TaskFilters } from "../../../external/dto/task.dto";

/**
 * GET /api/tasks
 * タスク一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // クエリパラメータを取得
    const searchParams = request.nextUrl.searchParams;
    const filters: TaskFilters = {
      "year-month": searchParams.get("year-month") || undefined,
      ownerId: searchParams.get("ownerId") || undefined,
      q: searchParams.get("q") || undefined,
      sort: searchParams.get("sort") || undefined,
    };

    // ハンドラーを呼び出し
    const tasks = await listTaskQuery(filters);

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tasks
 * タスクを作成
 */
export async function POST(request: NextRequest) {
  try {
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
    const task = await createTaskCommand(ownerId, body);

    return NextResponse.json(task, { status: 201 });
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

    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

