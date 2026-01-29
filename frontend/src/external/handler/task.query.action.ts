"use server";

import { withAuth } from "@/features/auth/servers/auth.guard";
import { GetTaskByIdRequest, TaskFilters } from "../dto/task.dto";
import { getTaskByIdQuery, listTaskQuery } from "./task.query.server";

export async function listTaskQueryAction(filters: TaskFilters) {
  return withAuth(({ accountId }) => listTaskQuery(filters, accountId));
}

export async function getTaskByIdQueryAction(request: GetTaskByIdRequest) {
  return withAuth(({ accountId }) => getTaskByIdQuery(request, accountId));
}