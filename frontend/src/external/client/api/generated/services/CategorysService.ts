/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Models_Category_CategoryResponse } from '../models/Models_Category_CategoryResponse';
import type { Models_Category_CreateCategoryRequest } from '../models/Models_Category_CreateCategoryRequest';
import type { Models_Category_DeleteCategoryResponse } from '../models/Models_Category_DeleteCategoryResponse';
import type { Models_Category_UpdateCategoryRequest } from '../models/Models_Category_UpdateCategoryRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CategorysService {

    /**
     * List categories
     * 認証必須。自分のカテゴリー一覧を取得します。
     * @returns Models_Category_CategoryResponse The request has succeeded.
     * @throws ApiError
     */
    public static categorysListCategorys(): CancelablePromise<Array<Models_Category_CategoryResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/categorys',
            errors: {
                401: `Unauthorized エラー（401）`,
            },
        });
    }

    /**
     * Create category
     * 認証必須。カテゴリー名の重複はNGです。
     * @returns Models_Category_CategoryResponse The request has succeeded.
     * @throws ApiError
     */
    public static categorysCreateCategory({
        requestBody,
    }: {
        requestBody: Models_Category_CreateCategoryRequest,
    }): CancelablePromise<Models_Category_CategoryResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/categorys',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request エラー（400）`,
                401: `Unauthorized エラー（401）`,
            },
        });
    }

    /**
     * Update category
     * 認証必須。自分が所有するカテゴリーのみ更新可能です。
     * @returns Models_Category_CategoryResponse The request has succeeded.
     * @throws ApiError
     */
    public static categorysUpdateCategory({
        categoryId,
        requestBody,
    }: {
        categoryId: string,
        requestBody: Models_Category_UpdateCategoryRequest,
    }): CancelablePromise<Models_Category_CategoryResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/categorys/{categoryId}',
            path: {
                'categoryId': categoryId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request エラー（400）`,
                401: `Unauthorized エラー（401）`,
                403: `Forbidden エラー（403）`,
                404: `Not Found エラー（404）`,
            },
        });
    }

    /**
     * Delete category
     * 認証必須。自分が所有するカテゴリーが子タスクで使用されていない場合のみ削除可能です。
     * @returns Models_Category_DeleteCategoryResponse The request has succeeded.
     * @throws ApiError
     */
    public static categorysDeleteCategory({
        categoryId,
    }: {
        categoryId: string,
    }): CancelablePromise<Models_Category_DeleteCategoryResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/categorys/{categoryId}',
            path: {
                'categoryId': categoryId,
            },
            errors: {
                401: `Unauthorized エラー（401）`,
                403: `Forbidden エラー（403）`,
                404: `Not Found エラー（404）`,
            },
        });
    }

}
