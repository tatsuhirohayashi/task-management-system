import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "タスク詳細",
  description: "タスク詳細を表示する画面",
};

export default function TasksDetailLayout({ children }: LayoutProps<"/tasks/[id]">) {
  return <>{children}</>;
}