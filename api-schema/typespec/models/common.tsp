import "@typespec/http";

using TypeSpec.Http;

namespace TaskManagement.Models.Common;

/**
 * 共通エラーレスポンス
 */
@error
model ErrorResponse {
  /** エラーコード */
  code: string;

  /** エラーメッセージ */
  message: string;

  /** 詳細情報（オプション） */
  details?: unknown;
}

/**
 * Not Found エラー（404）
 */
@error
model NotFoundError {
  @statusCode _: 404;
  code: "NOT_FOUND";
  message: string;
}

/**
 * Unauthorized エラー（401）
 */
@error
model UnauthorizedError {
  @statusCode _: 401;
  code: "UNAUTHORIZED";
  message: string;
}

/**
 * Forbidden エラー（403）
 */
@error
model ForbiddenError {
  @statusCode _: 403;
  code: "FORBIDDEN";
  message: string;
}

/**
 * Bad Request エラー（400）
 */
@error
model BadRequestError {
  @statusCode _: 400;
  code: "BAD_REQUEST";
  message: string;
  details?: unknown;
}

/**
 * 成功レスポンス（削除など）
 */
model SuccessResponse {
  success: boolean;
}

/**
 * ページネーション情報
 */
model PaginationInfo {
  page: int32;
  pageSize: int32;
  total: int32;
  totalPages: int32;
}

