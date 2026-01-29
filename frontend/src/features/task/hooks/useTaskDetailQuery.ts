import { useQuery } from "@tanstack/react-query";
import { taskKeys } from "../queries/keys";
import { getTaskByIdQueryAction } from "@/external/handler/task.query.action";

export function useTaskDetailQuery(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => getTaskByIdQueryAction({ id: taskId }),
  });
}