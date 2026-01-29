import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "タスク新規画面",
  description: "タスクを新規作成する画面",
};

export default function TasksLayout({ children }: LayoutProps<"/tasks/new">) {
  return <>{children}</>;
}