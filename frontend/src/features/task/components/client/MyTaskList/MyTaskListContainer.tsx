"use client";

import { MyTaskListPresenter } from "./MyTaskListPresenter";
import { useMyTaskList } from "./useMyTaskList";
import type { TaskFilters } from "@/external/dto/task.dto";

interface MyTaskListContainerProps {
  filters: TaskFilters;
}

export function MyTaskListContainer({ filters }: MyTaskListContainerProps) {
  const {
    handleTaskDetailClick,
    handleNewTaskClick,
    handlePreviousMonth,
    handleNextMonth,
    handleSearch,
    handleSortChange,
    searchKeyword,
    setSearchKeyword,
    currentYearMonth,
    sort,
    tasks,
    isLoading,
  } = useMyTaskList(filters);

  return (
    <MyTaskListPresenter
      tasks={tasks}
      isLoading={isLoading}
      currentYearMonth={currentYearMonth}
      searchKeyword={searchKeyword}
      sort={sort}
      onSearchKeywordChange={setSearchKeyword}
      onSortChange={handleSortChange}
      onTaskDetailClick={handleTaskDetailClick}
      onNewTaskClick={handleNewTaskClick}
      onPreviousMonth={handlePreviousMonth}
      onNextMonth={handleNextMonth}
      onSearch={handleSearch}
    />
  );
}