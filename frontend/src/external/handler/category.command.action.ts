"use server";

import { withAuth } from "@/features/auth/servers/auth.guard";
import {
  createCategoryCommand,
  updateCategoryCommand,
  deleteCategoryCommand,
} from "./category.command.server";
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../dto/category.dto";

export async function createCategoryCommandAction(
  request: CreateCategoryRequest,
) {
  return withAuth(({ accountId }) =>
    createCategoryCommand(accountId, request),
  );
}

export async function updateCategoryCommandAction(
  categoryId: string,
  request: UpdateCategoryRequest,
) {
  return withAuth(({ accountId }) =>
    updateCategoryCommand(categoryId, accountId, request),
  );
}

export async function deleteCategoryCommandAction(categoryId: string) {
  return withAuth(({ accountId }) =>
    deleteCategoryCommand(categoryId, accountId),
  );
}

