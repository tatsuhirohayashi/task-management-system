import { getQueryClient } from "@/shared/lib/query-client";
import { TaskDetail } from "../../client/TaskDetail";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTaskByIdQuery } from "@/external/handler/task.query.server";
import { taskKeys } from "@/features/task/queries/keys";

type TaskDetailPageTemplateProps = {
  taskId: string;
};

export async function TaskDetailPageTemplate({
  taskId,
}: TaskDetailPageTemplateProps) {
  const queryClient = getQueryClient();

  // データをプリフェッチ
  await queryClient.prefetchQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => getTaskByIdQuery({ id: taskId }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskDetail taskId={taskId} />
    </HydrationBoundary>
  );
}

