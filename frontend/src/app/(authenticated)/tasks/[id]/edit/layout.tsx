import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "タスク編集",
  description: "タスク編集を表示する画面",
};

export default function TasksEditLayout({ children }: LayoutProps<"/tasks/[id]/edit">) {
  return <>{children}</>;
}