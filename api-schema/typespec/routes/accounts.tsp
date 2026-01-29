import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "../models/account.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;
using TaskManagement.Models.Account;
using TaskManagement.Models.Common;

namespace TaskManagement.Routes;

@route("/api/accounts")
@tag("Accounts")
interface Accounts {
  /** 現在のアカウント取得 */
  @get
  @route("/me")
  @summary("Get current account")
  @doc("認証必須。ログインユーザーのアカウント情報を取得します。")
  getCurrentAccount(): AccountResponse | BadRequestError | NotFoundError | UnauthorizedError;

  /** アカウント詳細取得 */
  @get
  @route("/{accountId}")
  @summary("Get account by ID")
  @doc("認証必須。アカウントIDでアカウント情報を取得します。存在しないIDの場合は404を返します。")
  getAccountById(
    @path accountId: string
  ): AccountResponse | NotFoundError | UnauthorizedError;

  /** メールアドレスでアカウント取得（内部処理） */
  @get
  @route("/by-email")
  @summary("Get account by email")
  @doc("認証必須。メールアドレスでアカウント情報を取得します。better-authで使用される内部APIです。")
  getAccountByEmail(
    @query email: string
  ): AccountResponse | NotFoundError | UnauthorizedError;

  /** OAuth認証（内部処理） */
  @post
  @route("/auth")
  @summary("Create or get account via OAuth")
  @doc("OAuth認証時にアカウントを作成または取得します。better-authで使用される内部APIです。既存のアカウントが存在する場合は取得、存在しない場合は新規作成します。")
  createOrGetAccount(
    @body request: CreateOrGetAccountRequest
  ): AccountResponse | BadRequestError;
}

