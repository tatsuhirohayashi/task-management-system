import { TaskDetailPageTemplate } from "@/features/task/components/server/TaskDetailPageTemplate";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <TaskDetailPageTemplate taskId={id} />;
}

