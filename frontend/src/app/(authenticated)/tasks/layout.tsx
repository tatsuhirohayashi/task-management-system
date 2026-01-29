import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "タスク一覧",
  description: "タスク一覧を表示する画面",
};

export default function TasksLayout({ children }: LayoutProps<"/tasks">) {
  return <>{children}</>;
}