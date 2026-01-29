"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTaskListQuery } from "@/features/task/hooks/useTaskListQuery";
import type { TaskFilters } from "@/external/dto/task.dto";
import { useSession } from "@/features/auth/lib/better-auth-client";

export function useMyTaskList(initialFilters: TaskFilters) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  // URLのクエリパラメータから検索キーワードを取得
  const urlSearchKeyword = useMemo(() => {
    return searchParams.get("q") || "";
  }, [searchParams]);

  // 検索キーワードの状態管理（入力フィールド用）
  const [searchKeyword, setSearchKeyword] = useState(urlSearchKeyword);
  
  // URLパラメータが変更されたときに状態を更新
  const currentSearchKeyword = urlSearchKeyword !== searchKeyword && searchKeyword === "" 
    ? urlSearchKeyword 
    : searchKeyword;

  // URLのクエリパラメータからフィルター条件を取得
  const filters: TaskFilters = useMemo(() => {
    const yearMonth = searchParams.get("year-month") || initialFilters["year-month"];
    const q = searchParams.get("q") || initialFilters.q;
    const sort = searchParams.get("sort") || initialFilters.sort;

    // 自分のタスクのみを取得する場合、ownerIdを追加
    const ownerId = session?.account?.id || initialFilters.ownerId;

    return {
      "year-month": yearMonth || undefined,
      ownerId: ownerId || undefined,
      q: q || undefined,
      sort: sort || undefined,
    };
  }, [searchParams, initialFilters, session?.account?.id]);

  const handleTaskDetailClick = useCallback(
    (taskId: string) => {
      router.push(`/tasks/${taskId}`);
    },
    [router],
  );

  const handleNewTaskClick = useCallback(() => {
    router.push("/tasks/new");
  }, [router]);

  // 検索ボタンクリック時のハンドラー
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSearchKeyword.trim()) {
      params.set("q", currentSearchKeyword.trim());
    } else {
      params.delete("q");
    }
    router.push(`/tasks?${params.toString()}`);
  }, [currentSearchKeyword, searchParams, router]);

  // 並び替え変更時のハンドラー
  const handleSortChange = useCallback(
    (sort: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (sort && sort !== "newest") {
        params.set("sort", sort);
      } else {
        params.delete("sort");
      }
      router.push(`/tasks?${params.toString()}`);
    },
    [searchParams, router],
  );

  // 年月の表示用フォーマット（例: "2026年1月"）
  const yearMonth = filters["year-month"];
  const currentYearMonth = useMemo(() => {
    if (!yearMonth) return "";
    const [year, month] = yearMonth.split("-");
    return `${year}年${parseInt(month, 10)}月`;
  }, [yearMonth]);

  // 前月に遷移
  const handlePreviousMonth = useCallback(() => {
    if (!yearMonth) return;
    
    const [year, month] = yearMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);
    
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    const newYearMonth = `${newYear}-${newMonth}`;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("year-month", newYearMonth);
    router.push(`/tasks?${params.toString()}`);
  }, [yearMonth, searchParams, router]);

  // 次月に遷移
  const handleNextMonth = useCallback(() => {
    if (!yearMonth) return;
    
    const [year, month] = yearMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + 1);
    
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    const newYearMonth = `${newYear}-${newMonth}`;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("year-month", newYearMonth);
    router.push(`/tasks?${params.toString()}`);
  }, [yearMonth, searchParams, router]);

  const { data: tasks, isLoading } = useTaskListQuery(filters);

  return {
    handleTaskDetailClick,
    handleNewTaskClick,
    handlePreviousMonth,
    handleNextMonth,
    handleSearch,
    handleSortChange,
    searchKeyword: currentSearchKeyword,
    setSearchKeyword,
    currentYearMonth,
    sort: filters.sort || "newest",
    tasks: tasks || [],
    isLoading,
  };
}