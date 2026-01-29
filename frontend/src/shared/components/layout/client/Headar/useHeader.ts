"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/features/auth/lib/better-auth-client";

export function useHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = useCallback(async () => {
    await signOut();
    // キャッシュをすべてクリア
    queryClient.clear();
    router.push("/login");
  }, [router, queryClient]);

  const handleNavigateHome = useCallback(() => {
    router.push("/tasks");
  }, [router]);

  return {
    handleLogout,
    handleNavigateHome,
  };
}

