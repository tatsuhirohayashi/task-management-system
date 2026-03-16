/**
 * Categories API Route
 * GET /api/categories    - カテゴリー一覧取得
 * POST /api/categories   - カテゴリー作成
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  createCategoryCommand,
  ValidationError,
} from "../../../external/handler/category.command.server";
import { listCategoriesQuery } from "../../../external/handler/category.query.server";

/**
 * GET /api/categories
 * カテゴリー一覧を取得
 */
export async function GET(_request: NextRequest) {
  try {
    const categories = await listCategoriesQuery();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/categories
 * カテゴリーを作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: 認証情報からownerIdを取得（現在はリクエストヘッダーから取得）
    const ownerId = request.headers.get("x-owner-id") || "";

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 },
      );
    }

    const category = await createCategoryCommand(ownerId, body);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

