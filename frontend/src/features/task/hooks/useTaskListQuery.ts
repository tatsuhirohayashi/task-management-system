import { useQuery } from "@tanstack/react-query";
import { taskKeys } from "../queries/keys";
import type { TaskFilters } from "@/external/dto/task.dto";
import { listTaskQueryAction } from "@/external/handler/task.query.action";

export function useTaskListQuery(filters: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => listTaskQueryAction(filters),
  });
}