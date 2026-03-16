import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "../models/category.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;
using TaskManagement.Models.Category;
using TaskManagement.Models.Common;

namespace TaskManagement.Routes;

@route("/api/categorys")
@tag("Categorys")
interface Categorys {
  /** カテゴリー一覧取得 */
  @get
  @summary("List categories")
  @doc("認証必須。自分のカテゴリー一覧を取得します。")
  listCategorys(): ListCategoryResponse | UnauthorizedError;

  /** カテゴリー作成 */
  @post
  @summary("Create category")
  @doc("認証必須。カテゴリー名の重複はNGです。")
  createCategory(
    @body request: CreateCategoryRequest
  ): CreateCategoryResponse | BadRequestError | UnauthorizedError;

  /** カテゴリー更新 */
  @put
  @route("/{categoryId}")
  @summary("Update category")
  @doc("認証必須。自分が所有するカテゴリーのみ更新可能です。")
  updateCategory(
    @path categoryId: string,
    @body request: UpdateCategoryRequest
  ): UpdateCategoryResponse | BadRequestError | NotFoundError | UnauthorizedError | ForbiddenError;

  /** カテゴリー削除 */
  @delete
  @route("/{categoryId}")
  @summary("Delete category")
  @doc("認証必須。自分が所有するカテゴリーが子タスクで使用されていない場合のみ削除可能です。")
  deleteCategory(
    @path categoryId: string
  ): DeleteCategoryResponse | NotFoundError | UnauthorizedError | ForbiddenError;
}
