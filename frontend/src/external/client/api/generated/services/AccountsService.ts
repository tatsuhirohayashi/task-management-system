/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { Models_Account_AccountResponse } from '../models/Models_Account_AccountResponse';
import type { Models_Account_CreateOrGetAccountRequest } from '../models/Models_Account_CreateOrGetAccountRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AccountsService {

    /**
     * Create or get account via OAuth
     * OAuth認証時にアカウントを作成または取得します。better-authで使用される内部APIです。既存のアカウントが存在する場合は取得、存在しない場合は新規作成します。
     * @returns Models_Account_AccountResponse The request has succeeded.
     * @throws ApiError
     */
    public static accountsCreateOrGetAccount({
        requestBody,
    }: {
        requestBody: Models_Account_CreateOrGetAccountRequest,
    }): CancelablePromise<Models_Account_AccountResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/accounts/auth',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request エラー（400）`,
            },
        });
    }

    /**
     * Get account by email
     * 認証必須。メールアドレスでアカウント情報を取得します。better-authで使用される内部APIです。
     * @returns Models_Account_AccountResponse The request has succeeded.
     * @throws ApiError
     */
    public static accountsGetAccountByEmail({
        email,
    }: {
        email: string,
    }): CancelablePromise<Models_Account_AccountResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounts/by-email',
            query: {
                'email': email,
            },
            errors: {
                401: `Unauthorized エラー（401）`,
                404: `Not Found エラー（404）`,
            },
        });
    }

    /**
     * Get current account
     * 認証必須。ログインユーザーのアカウント情報を取得します。
     * @returns Models_Account_AccountResponse The request has succeeded.
     * @throws ApiError
     */
    public static accountsGetCurrentAccount(): CancelablePromise<Models_Account_AccountResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounts/me',
            errors: {
                400: `Bad Request エラー（400）`,
                401: `Unauthorized エラー（401）`,
                404: `Not Found エラー（404）`,
            },
        });
    }

    /**
     * Get account by ID
     * 認証必須。アカウントIDでアカウント情報を取得します。存在しないIDの場合は404を返します。
     * @returns Models_Account_AccountResponse The request has succeeded.
     * @throws ApiError
     */
    public static accountsGetAccountById({
        accountId,
    }: {
        accountId: string,
    }): CancelablePromise<Models_Account_AccountResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounts/{accountId}',
            path: {
                'accountId': accountId,
            },
            errors: {
                401: `Unauthorized エラー（401）`,
                404: `Not Found エラー（404）`,
            },
        });
    }

}
