import { getAuthenticatedSessionServer } from "@/features/auth/servers/redirect.server";
import { getQueryClient } from "@/shared/lib/query-client";
import { MyTaskList } from "../../client/MyTaskList";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { listTaskQuery } from "@/external/handler/task.query.server";
import { taskKeys } from "@/features/task/queries/keys";
import type { TaskFilters } from "@/external/dto/task.dto";

type MyTaskPageTemplateProps = {
  filters: TaskFilters;
};

export async function MyTaskPageTemplate({
  filters,
}: MyTaskPageTemplateProps) {
  const session = await getAuthenticatedSessionServer();
  const queryClient = getQueryClient();

  // 自分のタスクのみを取得する場合、ownerIdを追加
  const filtersWithOwner: TaskFilters = {
    ...filters,
    ownerId: session.account.id,
  };

  // データをプリフェッチ
  await queryClient.prefetchQuery({
    queryKey: taskKeys.list(filtersWithOwner),
    queryFn: () => listTaskQuery(filtersWithOwner),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyTaskList filters={filtersWithOwner} />
    </HydrationBoundary>
  );
}