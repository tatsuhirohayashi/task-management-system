import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
  description: "タスク管理アプリのログイン画面",
};

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return <>{children}</>;
}