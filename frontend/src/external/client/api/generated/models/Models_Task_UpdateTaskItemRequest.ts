/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Models_Task_Density } from './Models_Task_Density';
import type { Models_Task_Priority } from './Models_Task_Priority';
import type { Models_Task_Status } from './Models_Task_Status';

/**
 * タスクアイテム更新リクエスト
 */
export type Models_Task_UpdateTaskItemRequest = {
    id: string;
    priority: Models_Task_Priority;
    density: Models_Task_Density;
    durationTime: Models_Task_UpdateTaskItemRequest.durationTime;
    content: string;
    isRequired: boolean;
    order: number;
    status: Models_Task_Status;
};

export namespace Models_Task_UpdateTaskItemRequest {

    export enum durationTime {
        '_15' = 15,
        '_30' = 30,
        '_45' = 45,
        '_60' = 60,
    }


}

