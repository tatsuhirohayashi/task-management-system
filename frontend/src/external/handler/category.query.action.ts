"use server";

import { withAuth } from "@/features/auth/servers/auth.guard";
import { listCategoriesQuery } from "./category.query.server";

export async function listCategoriesQueryAction() {
  return withAuth(({ accountId }) => listCategoriesQuery(accountId));
}

