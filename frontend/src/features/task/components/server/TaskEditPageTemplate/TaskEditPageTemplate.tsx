import { getQueryClient } from "@/shared/lib/query-client";
import { TaskEdit } from "@/features/task/components/client/TaskEdit";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTaskByIdQuery } from "@/external/handler/task.query.server";
import { taskKeys } from "@/features/task/queries/keys";

interface TaskEditPageTemplateProps {
  taskId: string;
}

export async function TaskEditPageTemplate({
  taskId,
}: TaskEditPageTemplateProps) {
  const queryClient = getQueryClient();

  // データをプリフェッチ
  await queryClient.prefetchQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => getTaskByIdQuery({ id: taskId }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskEdit taskId={taskId} />
    </HydrationBoundary>
  );
}

