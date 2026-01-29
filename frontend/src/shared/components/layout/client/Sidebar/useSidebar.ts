"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useSidebar() {
  const router = useRouter();

  const handleNavigate = useCallback(
    (path: string) => {
      // TODO: ナビゲーション処理を実装
      router.push(path);
    },
    [router],
  );

  return {
    handleNavigate,
  };
}

