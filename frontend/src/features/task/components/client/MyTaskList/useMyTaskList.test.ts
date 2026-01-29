import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMyTaskList } from "./useMyTaskList";
import type { TaskFilters } from "@/external/dto/task.dto";
import type { TaskResponse } from "@/external/dto/task.dto";

// next/navigationのモック
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

// useTaskListQueryのモック
const mockTasks: TaskResponse[] = [
  {
    id: "task-1",
    ownerId: "user-1",
    owner: {
      id: "user-1",
      firstName: "Test",
      lastName: "User",
      thumbnail: null,
    },
    title: "Test Task",
    date: "2026-01-15",
    review: null,
    taskItems: [],
    plannedTaskCount: 0,
    plannedTaskDurationMinutes: 0,
    completedTaskCount: 0,
    completedTaskDurationMinutes: 0,
    completionRate: 0,
    HighTaskCount: 0,
    HighTaskDuration: 0,
    HighTaskRate: 0,
    MediumTaskCount: 0,
    MediumTaskDuration: 0,
    MediumTaskRate: 0,
    LowTaskCount: 0,
    LowTaskDuration: 0,
    LowTaskRate: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const mockUseTaskListQuery = vi.fn();

vi.mock("@/features/task/hooks/useTaskListQuery", () => ({
  useTaskListQuery: (filters: TaskFilters) => mockUseTaskListQuery(filters),
}));

// useSessionのモック
const mockSession = {
  account: {
    id: "user-1",
  },
};

const mockUseSession = vi.fn();

vi.mock("@/features/auth/lib/better-auth-client", () => ({
  useSession: () => mockUseSession(),
}));

describe("useMyTaskList", () => {
  const initialFilters: TaskFilters = {};

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.forEach((_, key) => {
      mockSearchParams.delete(key);
    });
    mockUseTaskListQuery.mockReturnValue({
      data: mockTasks,
      isLoading: false,
    });
    mockUseSession.mockReturnValue({
      data: mockSession,
    });
  });

  describe("フィルターなしの状態", () => {
    it("初期状態でフィルターが適切に設定される", () => {
      const { result } = renderHook(() => useMyTaskList(initialFilters));

      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.searchKeyword).toBe("");
      expect(result.current.sort).toBe("newest");
      expect(result.current.currentYearMonth).toBe("");
      expect(mockUseTaskListQuery).toHaveBeenCalledWith({
        ownerId: "user-1",
        "year-month": undefined,
        q: undefined,
        sort: undefined,
      });
    });
  });

  describe("月毎のフィルター", () => {
    it("year-monthパラメータが設定されている場合、適切にフィルターされる", () => {
      mockSearchParams.set("year-month", "2026-01");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      expect(result.current.currentYearMonth).toBe("2026年1月");
      expect(mockUseTaskListQuery).toHaveBeenCalledWith({
        ownerId: "user-1",
        "year-month": "2026-01",
        q: undefined,
        sort: undefined,
      });
    });

    it("前月に遷移できる", () => {
      mockSearchParams.set("year-month", "2026-02");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.handlePreviousMonth();
      });

      expect(mockPush).toHaveBeenCalledWith("/tasks?year-month=2026-01");
    });

    it("次月に遷移できる", () => {
      mockSearchParams.set("year-month", "2026-01");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.handleNextMonth();
      });

      expect(mockPush).toHaveBeenCalledWith("/tasks?year-month=2026-02");
    });

    it("年をまたいで前月に遷移できる", () => {
      mockSearchParams.set("year-month", "2026-01");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.handlePreviousMonth();
      });

      expect(mockPush).toHaveBeenCalledWith("/tasks?year-month=2025-12");
    });

    it("年をまたいで次月に遷移できる", () => {
      mockSearchParams.set("year-month", "2025-12");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.handleNextMonth();
      });

      expect(mockPush).toHaveBeenCalledWith("/tasks?year-month=2026-01");
    });

    it("year-monthが設定されていない場合、前月/次月の遷移は何もしない", () => {
      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.handlePreviousMonth();
      });

      act(() => {
        result.current.handleNextMonth();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("キーワード検索", () => {
    it("qパラメータが設定されている場合、適切にフィルターされる", () => {
      mockSearchParams.set("q", "test keyword");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      expect(result.current.searchKeyword).toBe("test keyword");
      expect(mockUseTaskListQuery).toHaveBeenCalledWith({
        ownerId: "user-1",
        "year-month": undefined,
        q: "test keyword",
        sort: undefined,
      });
    });

    it("検索キーワードを入力して検索できる", () => {
      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.setSearchKeyword("new search");
      });

      expect(result.current.searchKeyword).toBe("new search");

      act(() => {
        result.current.handleSearch();
      });

      expect(mockPush).toHaveBeenCalledWith("/tasks?q=new+search");
    });

    it("空の検索キーワードで検索すると、qパラメータが削除される", () => {
      // 最初はqパラメータがない状態から開始
      mockSearchParams.set("year-month", "2026-01");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      // 空文字列に設定
      act(() => {
        result.current.setSearchKeyword("");
      });

      act(() => {
        result.current.handleSearch();
      });

      // URLSearchParamsの順序は保証されないため、パラメータの存在を確認
      const callArgs = mockPush.mock.calls[0][0];
      expect(callArgs).toContain("year-month=2026-01");
      expect(callArgs).not.toContain("q=");
    });

    it("検索キーワードの前後の空白がトリムされる", () => {
      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.setSearchKeyword("  trimmed  ");
      });

      act(() => {
        result.current.handleSearch();
      });

      // URLSearchParamsの順序は保証されないため、パラメータの存在を確認
      const callArgs = mockPush.mock.calls[0][0];
      expect(callArgs).toContain("q=trimmed");
    });
  });

  describe("並び替え（sort）", () => {
    it("sortパラメータが設定されている場合、適切にフィルターされる", () => {
      mockSearchParams.set("sort", "oldest");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      expect(result.current.sort).toBe("oldest");
      expect(mockUseTaskListQuery).toHaveBeenCalledWith({
        ownerId: "user-1",
        "year-month": undefined,
        q: undefined,
        sort: "oldest",
      });
    });

    it("並び替えを変更できる", () => {
      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.handleSortChange("oldest");
      });

      expect(mockPush).toHaveBeenCalledWith("/tasks?sort=oldest");
    });

    it("newestに変更すると、sortパラメータが削除される", () => {
      mockSearchParams.set("sort", "oldest");
      mockSearchParams.set("year-month", "2026-01");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.handleSortChange("newest");
      });

      expect(mockPush).toHaveBeenCalledWith("/tasks?year-month=2026-01");
    });
  });

  describe("複合フィルター", () => {
    it("複数のフィルターが同時に設定できる", () => {
      mockSearchParams.set("year-month", "2026-01");
      mockSearchParams.set("q", "test");
      mockSearchParams.set("sort", "oldest");

      renderHook(() => useMyTaskList(initialFilters));

      expect(mockUseTaskListQuery).toHaveBeenCalledWith({
        ownerId: "user-1",
        "year-month": "2026-01",
        q: "test",
        sort: "oldest",
      });
    });

    it("検索時に他のパラメータが保持される", () => {
      mockSearchParams.set("year-month", "2026-01");
      mockSearchParams.set("sort", "oldest");

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.setSearchKeyword("new search");
      });

      act(() => {
        result.current.handleSearch();
      });

      // URLSearchParamsの順序は保証されないため、パラメータの存在を確認
      const callArgs = mockPush.mock.calls[0][0];
      expect(callArgs).toContain("year-month=2026-01");
      expect(callArgs).toContain("sort=oldest");
      expect(callArgs).toContain("q=new+search");
    });
  });

  describe("ナビゲーション", () => {
    it("タスク詳細ページに遷移できる", () => {
      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.handleTaskDetailClick("task-123");
      });

      expect(mockPush).toHaveBeenCalledWith("/tasks/task-123");
    });

    it("新規タスク作成ページに遷移できる", () => {
      const { result } = renderHook(() => useMyTaskList(initialFilters));

      act(() => {
        result.current.handleNewTaskClick();
      });

      expect(mockPush).toHaveBeenCalledWith("/tasks/new");
    });
  });

  describe("セッション", () => {
    it("セッションがない場合、ownerIdがundefinedになる", () => {
      mockUseSession.mockReturnValue({
        data: null,
      });

      renderHook(() => useMyTaskList(initialFilters));

      expect(mockUseTaskListQuery).toHaveBeenCalledWith({
        ownerId: undefined,
        "year-month": undefined,
        q: undefined,
        sort: undefined,
      });
    });

    it("initialFiltersのownerIdが優先される", () => {
      mockUseSession.mockReturnValue({
        data: null,
      });

      renderHook(() => useMyTaskList({ ownerId: "initial-owner" }));

      expect(mockUseTaskListQuery).toHaveBeenCalledWith({
        ownerId: "initial-owner",
        "year-month": undefined,
        q: undefined,
        sort: undefined,
      });
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中はisLoadingがtrueになる", () => {
      mockUseTaskListQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { result } = renderHook(() => useMyTaskList(initialFilters));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.tasks).toEqual([]);
    });
  });
});

