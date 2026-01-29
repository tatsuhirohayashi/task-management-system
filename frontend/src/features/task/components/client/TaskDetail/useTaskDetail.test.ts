import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaskDetail } from "./useTaskDetail";
import type { TaskResponse, TaskItemResponse } from "@/external/dto/task.dto";

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

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// useTaskDetailQueryのモック
const mockTask: TaskResponse = {
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
  taskItems: [
    {
      id: "task-item-1",
      taskId: "task-1",
      priority: "High",
      density: "Medium",
      durationTime: 60,
      content: "Test task item",
      output: null,
      isRequired: true,
      order: 0,
      status: "NotStarted",
    },
  ],
  plannedTaskCount: 1,
  plannedTaskDurationMinutes: 60,
  completedTaskCount: 0,
  completedTaskDurationMinutes: 0,
  completionRate: 0,
  HighTaskCount: 1,
  HighTaskDuration: 60,
  HighTaskRate: 0,
  MediumTaskCount: 0,
  MediumTaskDuration: 0,
  MediumTaskRate: 0,
  LowTaskCount: 0,
  LowTaskDuration: 0,
  LowTaskRate: 0,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockUseTaskDetailQuery = vi.fn();

vi.mock("@/features/task/hooks/useTaskDetailQuery", () => ({
  useTaskDetailQuery: (taskId: string) => mockUseTaskDetailQuery(taskId),
}));

// updateTaskItemOutputCommandActionのモック
const mockUpdateTaskItemOutputCommandAction = vi.fn();

vi.mock("@/external/handler/task.command.action", () => ({
  updateTaskReviewCommandAction: vi.fn(),
  updateTaskItemOutputCommandAction: (taskItemId: string, request: { output: string }) =>
    mockUpdateTaskItemOutputCommandAction(taskItemId, request),
}));

// useQueryClientのモック
const mockInvalidateQueries = vi.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
  getQueryData: vi.fn(),
  setQueryData: vi.fn(),
  removeQueries: vi.fn(),
  resetQueries: vi.fn(),
  refetchQueries: vi.fn(),
  cancelQueries: vi.fn(),
  isFetching: vi.fn(),
  isMutating: vi.fn(),
  getQueryState: vi.fn(),
  getQueriesData: vi.fn(),
  setQueriesData: vi.fn(),
  removeQueriesData: vi.fn(),
  getQueryCache: vi.fn(),
  getMutationCache: vi.fn(),
  clear: vi.fn(),
  ensureQueryData: vi.fn(),
  prefetchQuery: vi.fn(),
  fetchQuery: vi.fn(),
  executeMutation: vi.fn(),
};

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => mockQueryClient,
  };
});

describe("useTaskDetail - アウトプット更新", () => {
  const taskId = "task-1";
  const taskItem: TaskItemResponse = mockTask.taskItems[0];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTaskDetailQuery.mockReturnValue({
      data: mockTask,
      isLoading: false,
    });
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  describe("成功パターン", () => {
    it("アウトプットを正常に更新できる", async () => {
      mockUpdateTaskItemOutputCommandAction.mockResolvedValue(undefined);

      const { result } = renderHook(() => useTaskDetail(taskId));

      // モーダルを開く
      act(() => {
        result.current.handleOpenTaskItemModal(taskItem);
      });

      expect(result.current.isTaskItemModalOpen).toBe(true);
      expect(result.current.selectedTaskItem).toEqual(taskItem);
      expect(result.current.taskItemOutput).toBe("");

      // アウトプットを入力
      act(() => {
        result.current.setTaskItemOutput("新しいアウトプット");
      });

      expect(result.current.taskItemOutput).toBe("新しいアウトプット");

      // アウトプットを送信
      await act(async () => {
        await result.current.handleSubmitTaskItemOutput();
      });

      // APIが正しく呼ばれたことを確認
      expect(mockUpdateTaskItemOutputCommandAction).toHaveBeenCalledWith(
        taskItem.id,
        {
          output: "新しいアウトプット",
        },
      );

      // キャッシュが無効化されたことを確認
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: expect.arrayContaining(["notes", "detail", taskId]),
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: expect.arrayContaining(["notes", "list"]),
      });

      // モーダルが閉じられたことを確認
      expect(result.current.isTaskItemModalOpen).toBe(false);
      expect(result.current.selectedTaskItem).toBe(null);
      expect(result.current.taskItemOutput).toBe("");
      expect(result.current.taskItemOutputError).toBe("");
    });

    it("既存のアウトプットがある場合、モーダルを開いたときに初期値として設定される", () => {
      const taskItemWithOutput: TaskItemResponse = {
        ...taskItem,
        output: "既存のアウトプット",
      };

      const { result } = renderHook(() => useTaskDetail(taskId));

      // モーダルを開く
      act(() => {
        result.current.handleOpenTaskItemModal(taskItemWithOutput);
      });

      expect(result.current.taskItemOutput).toBe("既存のアウトプット");
      expect(result.current.taskItemOutputError).toBe("");
    });

    it("アウトプットの前後の空白がトリムされる", async () => {
      mockUpdateTaskItemOutputCommandAction.mockResolvedValue(undefined);

      const { result } = renderHook(() => useTaskDetail(taskId));

      act(() => {
        result.current.handleOpenTaskItemModal(taskItem);
      });

      act(() => {
        result.current.setTaskItemOutput("  トリムされるアウトプット  ");
      });

      await act(async () => {
        await result.current.handleSubmitTaskItemOutput();
      });

      // トリムされた値が送信されることを確認
      expect(mockUpdateTaskItemOutputCommandAction).toHaveBeenCalledWith(
        taskItem.id,
        {
          output: "トリムされるアウトプット",
        },
      );
    });
  });

  describe("失敗パターン", () => {
    it("空のアウトプットを送信するとエラーメッセージが表示される", async () => {
      const { result } = renderHook(() => useTaskDetail(taskId));

      act(() => {
        result.current.handleOpenTaskItemModal(taskItem);
      });

      act(() => {
        result.current.setTaskItemOutput("");
      });

      await act(async () => {
        await result.current.handleSubmitTaskItemOutput();
      });

      // エラーメッセージが設定されることを確認
      expect(result.current.taskItemOutputError).toBe("アウトプットを入力してください");

      // APIが呼ばれていないことを確認
      expect(mockUpdateTaskItemOutputCommandAction).not.toHaveBeenCalled();

      // モーダルが開いたままであることを確認
      expect(result.current.isTaskItemModalOpen).toBe(true);
    });

    it("空白のみのアウトプットを送信するとエラーメッセージが表示される", async () => {
      const { result } = renderHook(() => useTaskDetail(taskId));

      act(() => {
        result.current.handleOpenTaskItemModal(taskItem);
      });

      act(() => {
        result.current.setTaskItemOutput("   ");
      });

      await act(async () => {
        await result.current.handleSubmitTaskItemOutput();
      });

      // エラーメッセージが設定されることを確認
      expect(result.current.taskItemOutputError).toBe("アウトプットを入力してください");

      // APIが呼ばれていないことを確認
      expect(mockUpdateTaskItemOutputCommandAction).not.toHaveBeenCalled();
    });

    it("API呼び出しが失敗した場合、エラーがコンソールに出力される", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
      const error = new Error("API呼び出しに失敗しました");
      mockUpdateTaskItemOutputCommandAction.mockRejectedValue(error);

      const { result } = renderHook(() => useTaskDetail(taskId));

      act(() => {
        result.current.handleOpenTaskItemModal(taskItem);
      });

      act(() => {
        result.current.setTaskItemOutput("新しいアウトプット");
      });

      await act(async () => {
        await result.current.handleSubmitTaskItemOutput();
      });

      // エラーがコンソールに出力されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to update task item output:",
        error,
      );

      // モーダルが開いたままであることを確認（エラー時は閉じない）
      expect(result.current.isTaskItemModalOpen).toBe(true);
      expect(result.current.selectedTaskItem).toEqual(taskItem);
      expect(result.current.taskItemOutput).toBe("新しいアウトプット");

      consoleErrorSpy.mockRestore();
    });

    it("selectedTaskItemがnullの場合、何も実行されない", async () => {
      const { result } = renderHook(() => useTaskDetail(taskId));

      // モーダルを開かずに直接送信を試みる
      await act(async () => {
        await result.current.handleSubmitTaskItemOutput();
      });

      // APIが呼ばれていないことを確認
      expect(mockUpdateTaskItemOutputCommandAction).not.toHaveBeenCalled();
    });
  });
});

