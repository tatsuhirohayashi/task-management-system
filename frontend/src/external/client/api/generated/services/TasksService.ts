/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { Models_Task_CreateTaskRequest } from '../models/Models_Task_CreateTaskRequest';
import type { Models_Task_DeleteTaskRequest } from '../models/Models_Task_DeleteTaskRequest';
import type { Models_Task_DeleteTaskResponse } from '../models/Models_Task_DeleteTaskResponse';
import type { Models_Task_TaskResponse } from '../models/Models_Task_TaskResponse';
import type { Models_Task_UpdateTaskRequest } from '../models/Models_Task_UpdateTaskRequest';
import type { Models_Task_UpdateTaskReviewRequest } from '../models/Models_Task_UpdateTaskReviewRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TasksService {

    /**
     * Get task list
     * タスク一覧を取得します。クエリパラメータでフィルタリング可能です。
     * @returns Models_Task_TaskResponse The request has succeeded.
     * @throws ApiError
     */
    public static tasksListTasks({
        yearMonth,
        ownerId,
        q,
        sort,
    }: {
        yearMonth?: string,
        ownerId?: string,
        q?: string,
        sort?: string,
    }): CancelablePromise<Array<Models_Task_TaskResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tasks',
            query: {
                'year-month': yearMonth,
                'ownerId': ownerId,
                'q': q,
                'sort': sort,
            },
            errors: {
                401: `Unauthorized エラー（401）`,
            },
        });
    }

    /**
     * Create task
     * 新しいタスクを作成します。
     * @returns Models_Task_TaskResponse The request has succeeded.
     * @throws ApiError
     */
    public static tasksCreateTask({
        requestBody,
    }: {
        requestBody: Models_Task_CreateTaskRequest,
    }): CancelablePromise<Models_Task_TaskResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tasks',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request エラー（400）`,
                401: `Unauthorized エラー（401）`,
            },
        });
    }

    /**
     * Get task by ID
     * タスクIDでタスクを取得します。
     * @returns Models_Task_TaskResponse The request has succeeded.
     * @throws ApiError
     */
    public static tasksGetTaskById({
        taskId,
    }: {
        taskId: string,
    }): CancelablePromise<Models_Task_TaskResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tasks/{taskId}',
            path: {
                'taskId': taskId,
            },
            errors: {
                401: `Unauthorized エラー（401）`,
                404: `Not Found エラー（404）`,
            },
        });
    }

    /**
     * Update task
     * タスクを更新します。自分が所有するタスクのみ更新可能です。
     * @returns Models_Task_TaskResponse The request has succeeded.
     * @throws ApiError
     */
    public static tasksUpdateTask({
        taskId,
        requestBody,
    }: {
        taskId: string,
        requestBody: Models_Task_UpdateTaskRequest,
    }): CancelablePromise<Models_Task_TaskResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/tasks/{taskId}',
            path: {
                'taskId': taskId,
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
     * Delete task
     * タスクを削除します。自分が所有するタスクのみ削除可能です。
     * @returns Models_Task_DeleteTaskResponse The request has succeeded.
     * @throws ApiError
     */
    public static tasksDeleteTask({
        taskId,
        requestBody,
    }: {
        taskId: string,
        requestBody: Models_Task_DeleteTaskRequest,
    }): CancelablePromise<Models_Task_DeleteTaskResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/tasks/{taskId}',
            path: {
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized エラー（401）`,
                403: `Forbidden エラー（403）`,
                404: `Not Found エラー（404）`,
            },
        });
    }

    /**
     * Update task review
     * タスクの振り返りを更新します。自分が所有するタスクのみ更新可能です。
     * @returns Models_Task_TaskResponse The request has succeeded.
     * @throws ApiError
     */
    public static tasksUpdateTaskReview({
        taskId,
        requestBody,
    }: {
        taskId: string,
        requestBody: Models_Task_UpdateTaskReviewRequest,
    }): CancelablePromise<Models_Task_TaskResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/tasks/{taskId}/review',
            path: {
                'taskId': taskId,
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
