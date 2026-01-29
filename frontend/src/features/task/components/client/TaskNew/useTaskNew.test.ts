import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTaskNew } from "./useTaskNew";
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

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// createTaskCommandActionのモック
const mockCreateTaskCommandAction = vi.fn();

vi.mock("@/external/handler/task.command.action", () => ({
  createTaskCommandAction: (request: unknown) =>
    mockCreateTaskCommandAction(request),
}));

describe("useTaskNew", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("子タスクの追加", () => {
    it("子タスクが適切に追加される", () => {
      const { result } = renderHook(() => useTaskNew());

      expect(result.current.fields).toHaveLength(0);

      act(() => {
        result.current.handleAddTaskItem();
      });

      expect(result.current.fields).toHaveLength(1);
      const addedItem = result.current.fields[0];
      expect(addedItem.priority).toBe("Medium");
      expect(addedItem.density).toBe("Medium");
      expect(addedItem.durationTime).toBe(30);
      expect(addedItem.content).toBe("");
      expect(addedItem.isRequired).toBe(false);
      // IDは一意の文字列（Date.now()ベースまたはUUID）
      expect(typeof addedItem.id).toBe("string");
      expect(addedItem.id.length).toBeGreaterThan(0);
    });

    it("複数の子タスクを追加できる", () => {
      const { result } = renderHook(() => useTaskNew());

      act(() => {
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
      });

      expect(result.current.fields).toHaveLength(3);
    });

    it("追加された子タスクは一意のIDを持つ", () => {
      const { result } = renderHook(() => useTaskNew());

      act(() => {
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
      });

      const ids = result.current.fields.map((field) => field.id);
      expect(new Set(ids).size).toBe(2); // すべて異なるID
    });
  });

  describe("子タスクの削除", () => {
    it("子タスクが適切に削除される", () => {
      const { result } = renderHook(() => useTaskNew());

      // 3つの子タスクを追加
      act(() => {
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
      });

      expect(result.current.fields).toHaveLength(3);

      // 2番目の子タスクを削除
      act(() => {
        result.current.handleRemoveTaskItem(1);
      });

      expect(result.current.fields).toHaveLength(2);
    });

    it("最初の子タスクを削除できる", () => {
      const { result } = renderHook(() => useTaskNew());

      act(() => {
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
      });

      const firstItemId = result.current.fields[0].id;

      act(() => {
        result.current.handleRemoveTaskItem(0);
      });

      expect(result.current.fields).toHaveLength(1);
      expect(result.current.fields[0].id).not.toBe(firstItemId);
    });

    it("最後の子タスクを削除できる", () => {
      const { result } = renderHook(() => useTaskNew());

      act(() => {
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
      });

      act(() => {
        result.current.handleRemoveTaskItem(1);
      });

      expect(result.current.fields).toHaveLength(1);
    });

    it("すべての子タスクを削除できる", () => {
      const { result } = renderHook(() => useTaskNew());

      act(() => {
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
      });

      act(() => {
        result.current.handleRemoveTaskItem(0);
        result.current.handleRemoveTaskItem(0);
      });

      expect(result.current.fields).toHaveLength(0);
    });
  });

  describe("タスクの作成", () => {
    it("適切なデータでタスクを作成できる", async () => {
      const createdTask: TaskResponse = {
        id: "task-123",
        ownerId: "user-1",
        owner: {
          id: "user-1",
          firstName: "Test",
          lastName: "User",
          thumbnail: null,
        },
        title: "新しいタスク",
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
        createdAt: "2026-01-15T00:00:00Z",
        updatedAt: "2026-01-15T00:00:00Z",
      };

      mockCreateTaskCommandAction.mockResolvedValue(createdTask);

      const { result } = renderHook(() => useTaskNew());

      // 子タスクを追加
      act(() => {
        result.current.handleAddTaskItem();
      });

      // フォームデータを設定
      act(() => {
        result.current.setValue("title", "新しいタスク");
        result.current.setValue("date", "2026-01-15");
      });

      // 子タスクの内容を設定（setValueを使って直接フォームの値を設定）
      act(() => {
        result.current.setValue("taskItems.0.content", "タスク内容");
        result.current.setValue("taskItems.0.priority", "High");
        result.current.setValue("taskItems.0.density", "Low");
        result.current.setValue("taskItems.0.durationTime", 60);
        result.current.setValue("taskItems.0.isRequired", true);
      });

      // フォームを送信
      await act(async () => {
        await result.current.handleSubmit();
      });

      // APIが正しく呼ばれたことを確認
      await waitFor(() => {
        expect(mockCreateTaskCommandAction).toHaveBeenCalled();
      });

      const callArgs = mockCreateTaskCommandAction.mock.calls[0][0];
      expect(callArgs.title).toBe("新しいタスク");
      expect(callArgs.date).toBe("2026-01-15");
      expect(callArgs.taskItems).toHaveLength(1);
      expect(callArgs.taskItems[0]).toMatchObject({
        priority: "High",
        density: "Low",
        durationTime: 60,
        content: "タスク内容",
        isRequired: true,
        order: 1,
        status: "NotStarted",
      });

      // タスク詳細ページに遷移することを確認
      expect(mockPush).toHaveBeenCalledWith("/tasks/task-123");
    });

    it("複数の子タスクを含むタスクを作成できる", async () => {
      const createdTask: TaskResponse = {
        id: "task-456",
        ownerId: "user-1",
        owner: {
          id: "user-1",
          firstName: "Test",
          lastName: "User",
          thumbnail: null,
        },
        title: "複数タスク",
        date: "2026-01-16",
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
        createdAt: "2026-01-16T00:00:00Z",
        updatedAt: "2026-01-16T00:00:00Z",
      };

      mockCreateTaskCommandAction.mockResolvedValue(createdTask);

      const { result } = renderHook(() => useTaskNew());

      // 3つの子タスクを追加
      act(() => {
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
      });

      // フォームデータを設定
      act(() => {
        result.current.setValue("title", "複数タスク");
        result.current.setValue("date", "2026-01-16");
        result.current.setValue("taskItems.0.content", "タスク1");
        result.current.setValue("taskItems.1.content", "タスク2");
        result.current.setValue("taskItems.2.content", "タスク3");
      });

      // フォームを送信
      await act(async () => {
        await result.current.handleSubmit();
      });

      // orderが正しく設定されることを確認
      await waitFor(() => {
        expect(mockCreateTaskCommandAction).toHaveBeenCalled();
      });

      const callArgs = mockCreateTaskCommandAction.mock.calls[0][0];
      expect(callArgs.title).toBe("複数タスク");
      expect(callArgs.date).toBe("2026-01-16");
      expect(callArgs.taskItems).toHaveLength(3);
      expect(callArgs.taskItems[0]).toMatchObject({
        content: "タスク1",
        order: 1,
      });
      expect(callArgs.taskItems[1]).toMatchObject({
        content: "タスク2",
        order: 2,
      });
      expect(callArgs.taskItems[2]).toMatchObject({
        content: "タスク3",
        order: 3,
      });
    });

  });

  describe("子タスクの更新", () => {
    it("子タスクの各フィールドを更新できる", async () => {
      const { result } = renderHook(() => useTaskNew());

      act(() => {
        result.current.handleAddTaskItem();
      });

      // 各フィールドを順番に更新（setValueを使用）
      act(() => {
        result.current.setValue("taskItems.0.content", "更新された内容");
        result.current.setValue("taskItems.0.priority", "High");
        result.current.setValue("taskItems.0.density", "Low");
        result.current.setValue("taskItems.0.durationTime", 45);
        result.current.setValue("taskItems.0.isRequired", true);
      });

      // フォームの値を確認
      const formValues = result.current.getValues();
      expect(formValues.taskItems[0].content).toBe("更新された内容");
      expect(formValues.taskItems[0].priority).toBe("High");
      expect(formValues.taskItems[0].density).toBe("Low");
      expect(formValues.taskItems[0].durationTime).toBe(45);
      expect(formValues.taskItems[0].isRequired).toBe(true);
    });

    it("複数の子タスクを個別に更新できる", () => {
      const { result } = renderHook(() => useTaskNew());

      act(() => {
        result.current.handleAddTaskItem();
        result.current.handleAddTaskItem();
      });

      act(() => {
        result.current.setValue("taskItems.0.content", "タスク1");
        result.current.setValue("taskItems.1.content", "タスク2");
      });

      const formValues = result.current.getValues();
      expect(formValues.taskItems[0].content).toBe("タスク1");
      expect(formValues.taskItems[1].content).toBe("タスク2");
    });
  });
});

