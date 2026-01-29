"use server";

import { withAuth } from "@/features/auth/servers/auth.guard";
import { createTaskCommand, deleteTaskCommand, updateTaskCommand, updateTaskReviewCommand, updateTaskItemCommand } from "./task.command.server";
import type { CreateTaskRequest, UpdateTaskRequest, UpdateTaskReviewRequest, UpdateTaskItemOutputRequest } from "../dto/task.dto";

export async function createTaskCommandAction(request: CreateTaskRequest) {
  return withAuth(({ accountId }) => createTaskCommand(accountId, request));
}

export async function updateTaskCommandAction(
  taskId: string,
  request: UpdateTaskRequest,
) {
  return withAuth(({ accountId }) => updateTaskCommand(taskId, accountId, request));
}

export async function deleteTaskCommandAction(taskId: string) {
  return withAuth(({ accountId }) => deleteTaskCommand(taskId, accountId));
}

export async function updateTaskReviewCommandAction(
  taskId: string,
  request: UpdateTaskReviewRequest,
) {
  return withAuth(({ accountId }) => updateTaskReviewCommand(taskId, accountId, request));
}

export async function updateTaskItemOutputCommandAction(
  taskItemId: string,
  request: UpdateTaskItemOutputRequest,
) {
  return withAuth(({ accountId }) => updateTaskItemCommand(taskItemId, accountId, request));
}