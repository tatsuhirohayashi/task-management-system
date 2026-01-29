import { MyTaskPageTemplate } from "@/features/task/components/server/MyTaskPageTemplate";
import type { TaskFilters } from "@/external/dto/task.dto";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    "year-month"?: string;
    ownerId?: string;
    q?: string;
    sort?: string;
  }>;
};

/**
 * 現在の年月を取得（例: "2026-01"）
 */
function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default async function TasksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // year-monthパラメータがない場合、現在の年月でリダイレクト
  if (!params["year-month"]) {
    const currentYearMonth = getCurrentYearMonth();
    const searchParams = new URLSearchParams();
    searchParams.set("year-month", currentYearMonth);
    if (params.q) searchParams.set("q", params.q);
    if (params.sort) searchParams.set("sort", params.sort);
    
    redirect(`/tasks?${searchParams.toString()}`);
  }

  const filters: TaskFilters = {
    "year-month": params["year-month"],
    ownerId: params.ownerId,
    q: params.q,
    sort: params.sort,
  };

  return <MyTaskPageTemplate filters={filters} />;
}