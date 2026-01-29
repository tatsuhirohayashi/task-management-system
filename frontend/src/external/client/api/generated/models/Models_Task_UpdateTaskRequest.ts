/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
 

import type { Models_Task_UpdateTaskItemRequest } from './Models_Task_UpdateTaskItemRequest';

/**
 * タスク更新リクエスト
 */
export type Models_Task_UpdateTaskRequest = {
    ownerId: string;
    title: string;
    date: string;
    taskItems: Array<Models_Task_UpdateTaskItemRequest>;
};

