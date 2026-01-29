package controller

import (
	"fmt"
	"net/http"
	"strings"

	"task-management-system/backend/internal/adapter/http/generated/openapi"
	"task-management-system/backend/internal/adapter/http/presenter"
	"task-management-system/backend/internal/usecase"

	"github.com/labstack/echo/v4"
)

// AccountController アカウントコントローラー
type AccountController struct {
	accountUsecase *usecase.AccountUsecase
}

// NewAccountController アカウントコントローラーを作成
func NewAccountController(accountUsecase *usecase.AccountUsecase) *AccountController {
	return &AccountController{
		accountUsecase: accountUsecase,
	}
}

// GetCurrentAccount 現在のアカウントを取得
func (c *AccountController) GetCurrentAccount(ctx echo.Context) error {
	// TODO: 認証情報からaccountIdを取得（現在はリクエストヘッダーから取得する必要がある）
	// 認証実装後は、セッションやJWTからaccountIdを取得する
	accountID := ctx.Request().Header.Get("x-account-id")
	if accountID == "" {
		return HandleBadRequest(ctx, "Account ID is required", nil)
	}

	// ユースケースを実行
	account, err := c.accountUsecase.GetCurrentAccount(ctx.Request().Context(), accountID)
	if err != nil {
		// アカウントが見つからない場合
		if err.Error() == fmt.Sprintf("account not found: %s", accountID) {
			return HandleNotFound(ctx, "Account not found")
		}
		return HandleInternalServerError(ctx, err)
	}

	// レスポンスに変換
	response := presenter.ToAccountResponse(account)

	return ctx.JSON(http.StatusOK, response)
}

// GetAccountByID アカウントIDでアカウントを取得
func (c *AccountController) GetAccountByID(ctx echo.Context, accountId string) error {
	// ユースケースを実行
	account, err := c.accountUsecase.GetAccountByID(ctx.Request().Context(), accountId)
	if err != nil {
		return HandleInternalServerError(ctx, err)
	}

	// アカウントが見つからない場合
	if account == nil {
		return HandleNotFound(ctx, "Account not found")
	}

	// レスポンスに変換
	response := presenter.ToAccountResponse(account)

	return ctx.JSON(http.StatusOK, response)
}

// GetAccountByEmail メールアドレスでアカウントを取得
func (c *AccountController) GetAccountByEmail(ctx echo.Context, params openapi.AccountsGetAccountByEmailParams) error {
	// メールアドレスが指定されていない場合
	if params.Email == "" {
		return HandleBadRequest(ctx, "Email is required", nil)
	}

	// ユースケースを実行
	account, err := c.accountUsecase.GetAccountByEmail(ctx.Request().Context(), params.Email)
	if err != nil {
		return HandleInternalServerError(ctx, err)
	}

	// アカウントが見つからない場合
	if account == nil {
		return HandleNotFound(ctx, "Account not found")
	}

	// レスポンスに変換
	response := presenter.ToAccountResponse(account)

	return ctx.JSON(http.StatusOK, response)
}

// CreateOrGetAccount OAuth連携時のアカウント作成または取得
func (c *AccountController) CreateOrGetAccount(ctx echo.Context, request openapi.ModelsAccountCreateOrGetAccountRequest) error {
	// バリデーション: 必須フィールドのチェック
	if request.Email == "" {
		return HandleBadRequest(ctx, "Email is required", nil)
	}
	if request.Name == "" {
		return HandleBadRequest(ctx, "Name is required", nil)
	}
	if request.Provider == "" {
		return HandleBadRequest(ctx, "Provider is required", nil)
	}
	if request.ProviderAccountId == "" {
		return HandleBadRequest(ctx, "ProviderAccountId is required", nil)
	}

	// nameを姓名に分割（スペースで分割、最初の部分をfirstName、残りをlastName）
	nameParts := strings.Fields(strings.TrimSpace(request.Name))
	var firstName, lastName string
	if len(nameParts) > 0 {
		firstName = nameParts[0]
		if len(nameParts) > 1 {
			lastName = strings.Join(nameParts[1:], " ")
		}
	}

	// ユースケースを実行
	account, err := c.accountUsecase.CreateOrGetAccount(
		ctx.Request().Context(),
		request.Email,
		firstName,
		lastName,
		request.Provider,
		request.ProviderAccountId,
		request.Thumbnail,
	)
	if err != nil {
		return HandleInternalServerError(ctx, err)
	}

	// レスポンスに変換
	response := presenter.ToAccountResponse(account)

	return ctx.JSON(http.StatusOK, response)
}
