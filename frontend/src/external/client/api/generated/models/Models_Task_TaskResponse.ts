/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
 

import type { Models_Task_TaskItemResponse } from './Models_Task_TaskItemResponse';
import type { Models_Task_TaskOwnerResponse } from './Models_Task_TaskOwnerResponse';

/**
 * タスクレスポンス
 */
export type Models_Task_TaskResponse = {
    id: string;
    ownerId: string;
    owner: Models_Task_TaskOwnerResponse;
    title: string;
    date: string;
    review?: string;
    taskItems: Array<Models_Task_TaskItemResponse>;
    completionRate: number;
    plannedTaskCount: number;
    plannedTaskDurationMinutes: number;
    completedTaskCount: number;
    completedTaskDurationMinutes: number;
    HighTaskCount: number;
    HighTaskDuration: number;
    HighTaskRate: number;
    MediumTaskCount: number;
    MediumTaskDuration: number;
    MediumTaskRate: number;
    LowTaskCount: number;
    LowTaskDuration: number;
    LowTaskRate: number;
    createdAt: string;
    updatedAt: string;
};

