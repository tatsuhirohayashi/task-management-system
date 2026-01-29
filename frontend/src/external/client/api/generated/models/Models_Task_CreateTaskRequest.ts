/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
 

import type { Models_Task_CreateTaskItemRequest } from './Models_Task_CreateTaskItemRequest';

/**
 * タスク作成リクエスト
 */
export type Models_Task_CreateTaskRequest = {
    ownerId: string;
    title: string;
    date: string;
    taskItems: Array<Models_Task_CreateTaskItemRequest>;
};

