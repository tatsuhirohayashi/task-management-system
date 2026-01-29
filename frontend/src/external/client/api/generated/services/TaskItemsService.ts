/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { Models_Task_TaskResponse } from '../models/Models_Task_TaskResponse';
import type { Models_Task_UpdateTaskItemOutputRequest } from '../models/Models_Task_UpdateTaskItemOutputRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TaskItemsService {

    /**
     * Update task item output
     * 子タスクのアウトプットを更新します。自分が所有する子タスクのみ更新可能です。アウトプットを更新するとステータスはCompletedになります。
     * @returns Models_Task_TaskResponse The request has succeeded.
     * @throws ApiError
     */
    public static taskItemsUpdateTaskItemOutput({
        taskItemId,
        requestBody,
    }: {
        taskItemId: string,
        requestBody: Models_Task_UpdateTaskItemOutputRequest,
    }): CancelablePromise<Models_Task_TaskResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/taskitems/{taskItemId}',
            path: {
                'taskItemId': taskItemId,
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

}
