/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
 

import type { Models_Task_TaskItem } from './Models_Task_TaskItem';

/**
 * タスク
 */
export type Models_Task_Task = {
    id: string;
    ownerId: string;
    title: string;
    date: string;
    review?: string;
    taskItems: Array<Models_Task_TaskItem>;
    createdAt: string;
    updatedAt: string;
};

