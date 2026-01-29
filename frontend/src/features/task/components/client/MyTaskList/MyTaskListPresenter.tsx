"use client";

import { Button } from "@/shared/components/ui/button";
import type { TaskResponse } from "@/external/dto/task.dto";

interface MyTaskListPresenterProps {
  tasks: TaskResponse[];
  isLoading?: boolean;
  currentYearMonth: string;
  searchKeyword: string;
  sort: string;
  onSearchKeywordChange: (keyword: string) => void;
  onSortChange: (sort: string) => void;
  onTaskDetailClick: (taskId: string) => void;
  onNewTaskClick: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSearch: () => void;
}

const sortOptions = [
  { value: "newest", label: "新しい順" },
  { value: "oldest", label: "古い順" },
  { value: "highest-completion", label: "完了率が高い順" },
  { value: "lowest-completion", label: "完了率が低い順" },
  { value: "most-quantity", label: "量が多い順" },
  { value: "least-quantity", label: "量が少ない順" },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 (${weekday})`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}時間${mins}分`;
  } else if (hours > 0) {
    return `${hours}時間`;
  } else {
    return `${mins}分`;
  }
}

export function MyTaskListPresenter({
  tasks,
  isLoading = false,
  currentYearMonth,
  searchKeyword,
  sort,
  onSearchKeywordChange,
  onSortChange,
  onTaskDetailClick,
  onNewTaskClick,
  onPreviousMonth,
  onNextMonth,
  onSearch,
}: MyTaskListPresenterProps) {
  return (
    <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-white">
      {/* 日付ナビゲーション */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onPreviousMonth}
          className="text-gray-600 hover:text-gray-900 text-2xl font-semibold px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          {"<"}
        </button>
        <div className="text-3xl font-semibold">{currentYearMonth}</div>
        <button
          type="button"
          onClick={onNextMonth}
          className="text-gray-600 hover:text-gray-900 text-2xl font-semibold px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          {">"}
        </button>
      </div>

      {/* 検索と新規作成 */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="検索..."
          value={searchKeyword}
          onChange={(e) => onSearchKeywordChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <select
          value={sort || "newest"}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button
          onClick={onSearch}
          className="bg-gray-800 text-white hover:bg-gray-700"
        >
          検索
        </Button>
        <Button
          className="bg-gray-800 text-white hover:bg-gray-700"
          onClick={onNewTaskClick}
        >
          新規作成
        </Button>
      </div>

      {/* タスクリスト */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">タスクがありません</div>
        ) : (
          tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 flex gap-6">
                {/* 日付と完了率などの情報セクション */}
                <div className="flex-shrink-0 w-64">
                  <div className="text-xl text-gray-600 font-semibold mb-2">
                    {formatDate(task.date)}
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>
                      予定タスク {task.plannedTaskCount}個{" "}
                      {formatDuration(task.plannedTaskDurationMinutes)}
                    </div>
                    <div>
                      完了タスク数 {task.completedTaskCount}個{" "}
                      {formatDuration(task.completedTaskDurationMinutes)}
                    </div>
                    <div>完了率 {task.completionRate}%</div>
                  </div>
                </div>

                {/* タイトルと振り返りセクション */}
                <div className="flex-1">
                  <div className="text-lg font-semibold mb-2">{task.title}</div>
                  {task.review && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        振り返り
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {task.review}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="bg-black text-white hover:bg-gray-800 ml-4"
                onClick={() => onTaskDetailClick(task.id)}
              >
                詳細
              </Button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}