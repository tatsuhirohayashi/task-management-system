import { useQuery } from "@tanstack/react-query";
import { categoryKeys } from "../queries/keys";
import { listCategoriesQueryAction } from "@/external/handler/category.query.action";

export function useCategoryListQuery() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => listCategoriesQueryAction(),
  });
}

