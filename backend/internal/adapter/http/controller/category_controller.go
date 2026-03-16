package controller

import (
	"fmt"
	"net/http"

	"task-management-system/backend/internal/adapter/http/generated/openapi"
	"task-management-system/backend/internal/adapter/http/presenter"
	"task-management-system/backend/internal/usecase"

	"github.com/labstack/echo/v4"
)

// CategoryController カテゴリーコントローラー
type CategoryController struct {
	categoryUsecase *usecase.CategoryUsecase
}

// NewCategoryController カテゴリーコントローラーを作成
func NewCategoryController(categoryUsecase *usecase.CategoryUsecase) *CategoryController {
	return &CategoryController{
		categoryUsecase: categoryUsecase,
	}
}

func (c *CategoryController) ownerID(ctx echo.Context) (string, error) {
	accountID := ctx.Request().Header.Get("x-account-id")
	if accountID == "" {
		return "", nil
	}
	return accountID, nil
}

// ListCategories カテゴリー一覧を取得
func (c *CategoryController) ListCategories(ctx echo.Context) error {
	ownerID, err := c.ownerID(ctx)
	if err != nil || ownerID == "" {
		return HandleBadRequest(ctx, "Account ID is required", nil)
	}
	list, err := c.categoryUsecase.ListCategories(ctx.Request().Context(), ownerID)
	if err != nil {
		return HandleInternalServerError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, presenter.ToCategoryResponseList(list))
}

// CreateCategory カテゴリーを作成
func (c *CategoryController) CreateCategory(ctx echo.Context) error {
	ownerID, _ := c.ownerID(ctx)
	if ownerID == "" {
		return HandleBadRequest(ctx, "Account ID is required", nil)
	}
	var req openapi.ModelsCategoryCreateCategoryRequest
	if err := ctx.Bind(&req); err != nil {
		return HandleBadRequest(ctx, "Invalid request body", err)
	}
	cat, err := c.categoryUsecase.CreateCategory(ctx.Request().Context(), ownerID, req.Name)
	if err != nil {
		return HandleInternalServerError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, presenter.ToCategoryResponse(cat))
}

// UpdateCategory カテゴリーを更新
func (c *CategoryController) UpdateCategory(ctx echo.Context, categoryId string) error {
	ownerID, _ := c.ownerID(ctx)
	if ownerID == "" {
		return HandleBadRequest(ctx, "Account ID is required", nil)
	}
	var req openapi.ModelsCategoryUpdateCategoryRequest
	if err := ctx.Bind(&req); err != nil {
		return HandleBadRequest(ctx, "Invalid request body", err)
	}
	cat, err := c.categoryUsecase.UpdateCategory(ctx.Request().Context(), categoryId, ownerID, req.Name)
	if err != nil {
		if err.Error() == fmt.Sprintf("category not found: %s", categoryId) {
			return HandleNotFound(ctx, "Category not found")
		}
		if err.Error() == "category not owned by account" {
			return HandleForbidden(ctx, "Category not owned by account")
		}
		if err.Error() == "name is required" {
			return HandleBadRequest(ctx, "name is required", nil)
		}
		return HandleInternalServerError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, presenter.ToCategoryResponse(cat))
}

// DeleteCategory カテゴリーを削除
func (c *CategoryController) DeleteCategory(ctx echo.Context, categoryId string) error {
	ownerID, _ := c.ownerID(ctx)
	if ownerID == "" {
		return HandleBadRequest(ctx, "Account ID is required", nil)
	}
	if err := c.categoryUsecase.DeleteCategory(ctx.Request().Context(), categoryId, ownerID); err != nil {
		if err.Error() == fmt.Sprintf("category not found: %s", categoryId) {
			return HandleNotFound(ctx, "Category not found")
		}
		if err.Error() == "category not owned by account" {
			return HandleForbidden(ctx, "Category not owned by account")
		}
		return HandleInternalServerError(ctx, err)
	}
	return ctx.JSON(http.StatusOK, openapi.ModelsCategoryDeleteCategoryResponse{Success: true})
}
