/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Models_Task_Density } from './Models_Task_Density';
import type { Models_Task_Priority } from './Models_Task_Priority';
import type { Models_Task_Status } from './Models_Task_Status';

/**
 * タスクアイテムレスポンス
 */
export type Models_Task_TaskItemResponse = {
    id: string;
    taskId: string;
    priority: Models_Task_Priority;
    density: Models_Task_Density;
    durationTime: Models_Task_TaskItemResponse.durationTime;
    content: string;
    output?: string;
    status: Models_Task_Status;
    isRequired: boolean;
    order: number;
};

export namespace Models_Task_TaskItemResponse {

    export enum durationTime {
        '_15' = 15,
        '_30' = 30,
        '_45' = 45,
        '_60' = 60,
    }


}

