import { Suspense } from "react";
import { requireAuthServer } from "@/features/auth/servers/redirect.server";
import { Header } from "@/shared/components/layout/client/Headar";
import { Sidebar } from "@/shared/components/layout/client/Sidebar";

type AuthenticatedLayoutWrapperProps = {
  children: React.ReactNode;
};

export async function AuthenticatedLayoutWrapper({
  children,
}: AuthenticatedLayoutWrapperProps) {
  await requireAuthServer();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Suspense fallback={<div className="h-14 border-b" />}>
        <Header />
      </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <div className="ml-4 mt-4">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}