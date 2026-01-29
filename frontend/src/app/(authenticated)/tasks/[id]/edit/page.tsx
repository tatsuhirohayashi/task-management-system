import { TaskEditPageTemplate } from "@/features/task/components/server/TaskEditPageTemplate";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskEditPage({ params }: PageProps) {
  const { id } = await params;

  return <TaskEditPageTemplate taskId={id} />;
}