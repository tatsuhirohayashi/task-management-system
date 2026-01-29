import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskService } from "./task.service";
import type { ITaskRepository } from "../repository/task.repository.interface";
import type { Task } from "../domain/task/task.entity";
import type { TaskItem } from "../domain/task/task-item.entity";
import { Priority } from "../domain/shared/value-objects";
import { Density } from "../domain/shared/value-objects";
import { DurationTime } from "../domain/shared/value-objects";
import { Status } from "../domain/shared/value-objects";

// モックの設定
vi.mock("../repository/transaction.repository", () => ({
  withTransaction: vi.fn((callback) => callback({})),
}));

// データベース関連のモック
vi.mock("../client/database", () => ({
  db: {
    transaction: vi.fn((callback) => callback({})),
  },
}));

vi.mock("../client/database/client", () => ({
  db: {
    transaction: vi.fn((callback) => callback({})),
  },
}));

describe("TaskService", () => {
  let taskService: TaskService;
  let mockRepository: ITaskRepository;

  beforeEach(() => {
    mockRepository = {
      findMany: vi.fn(),
      findById: vi.fn(),
      findByTaskItemId: vi.fn(),
      createInTransaction: vi.fn(),
      updateInTransaction: vi.fn(),
      deleteInTransaction: vi.fn(),
      updateTaskItemOutputInTransaction: vi.fn(),
      updateReviewInTransaction: vi.fn(),
    };
    taskService = new TaskService(mockRepository);
    vi.clearAllMocks();
  });

  describe("getTaskList - データ変換", () => {
    it("TaskFiltersをリポジトリ用の検索条件に正しく変換する", async () => {
      const filters = {
        "year-month": "2026-01",
        ownerId: "account-123",
        q: "テスト",
        sort: "newest",
      };

      vi.mocked(mockRepository.findMany).mockResolvedValue([]);

      await taskService.getTaskList(filters);

      expect(mockRepository.findMany).toHaveBeenCalledWith({
        yearMonth: "2026-01",
        ownerId: "account-123",
        keyword: "テスト",
        sort: "newest",
      });
    });

    it("フィルター条件が空の場合も正しく変換する", async () => {
      const filters = {};

      vi.mocked(mockRepository.findMany).mockResolvedValue([]);

      await taskService.getTaskList(filters);

      expect(mockRepository.findMany).toHaveBeenCalledWith({
        yearMonth: undefined,
        ownerId: undefined,
        keyword: undefined,
        sort: undefined,
      });
    });
  });

  describe("createTask - エラーハンドリング", () => {
    const validTaskItems = [
      {
        priority: "High" as const,
        density: "Medium" as const,
        durationTime: 60 as const,
        content: "タスク内容",
        isRequired: true,
        order: 1,
        status: "NotStarted" as const,
      },
    ];

    it("タスク作成後に再取得できない場合、エラーがスローされる", async () => {
      const taskId = "task-123";
      vi.mocked(mockRepository.createInTransaction).mockResolvedValue(taskId);
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.createTask(
          "owner-123",
          "テストタスク",
          new Date("2026-01-15"),
          validTaskItems,
        ),
      ).rejects.toThrow("Failed to create task");
    });

    it("リポジトリでエラーが発生した場合、エラーがスローされる", async () => {
      const repositoryError = new Error("Repository error");
      vi.mocked(mockRepository.createInTransaction).mockRejectedValue(
        repositoryError,
      );

      await expect(
        taskService.createTask(
          "owner-123",
          "テストタスク",
          new Date("2026-01-15"),
          validTaskItems,
        ),
      ).rejects.toThrow("Repository error");
    });
  });

  describe("updateTask - エラーハンドリング", () => {
    const validTaskItems = [
      {
        id: "item-1",
        priority: "High" as const,
        density: "Medium" as const,
        durationTime: 60 as const,
        content: "タスク内容",
        isRequired: true,
        order: 1,
        status: "NotStarted" as const,
      },
    ];

    it("タスクが見つからない場合、エラーがスローされる", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.updateTask(
          "task-123",
          "owner-123",
          "テストタスク",
          new Date("2026-01-15"),
          validTaskItems,
        ),
      ).rejects.toThrow("Task not found");
    });

    it("権限がない場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-456");
      vi.mocked(mockTask.canUpdate).mockReturnValue(false);
      vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);

      await expect(
        taskService.updateTask(
          "task-123",
          "owner-123",
          "テストタスク",
          new Date("2026-01-15"),
          validTaskItems,
        ),
      ).rejects.toThrow("You do not have permission to update this task");
    });

    it("更新後に再取得できない場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-123");
      vi.mocked(mockTask.canUpdate).mockReturnValue(true);
      vi.mocked(mockRepository.findById)
        .mockResolvedValueOnce(mockTask) // 最初の呼び出し（既存タスク取得）
        .mockResolvedValueOnce(null); // 2回目の呼び出し（更新後の取得）

      await expect(
        taskService.updateTask(
          "task-123",
          "owner-123",
          "テストタスク",
          new Date("2026-01-15"),
          validTaskItems,
        ),
      ).rejects.toThrow("Failed to update task");
    });

    it("リポジトリでエラーが発生した場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-123");
      vi.mocked(mockTask.canUpdate).mockReturnValue(true);
      vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
      const repositoryError = new Error("Repository error");
      vi.mocked(mockRepository.updateInTransaction).mockRejectedValue(
        repositoryError,
      );

      await expect(
        taskService.updateTask(
          "task-123",
          "owner-123",
          "テストタスク",
          new Date("2026-01-15"),
          validTaskItems,
        ),
      ).rejects.toThrow("Repository error");
    });
  });

  describe("deleteTask - エラーハンドリング", () => {
    it("タスクが見つからない場合、エラーがスローされる", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.deleteTask("task-123", "owner-123"),
      ).rejects.toThrow("Task not found");
    });

    it("権限がない場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-456");
      vi.mocked(mockTask.canDelete).mockReturnValue(false);
      vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);

      await expect(
        taskService.deleteTask("task-123", "owner-123"),
      ).rejects.toThrow("You do not have permission to delete this task");
    });

    it("リポジトリでエラーが発生した場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-123");
      vi.mocked(mockTask.canDelete).mockReturnValue(true);
      vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
      const repositoryError = new Error("Repository error");
      vi.mocked(mockRepository.deleteInTransaction).mockRejectedValue(
        repositoryError,
      );

      await expect(
        taskService.deleteTask("task-123", "owner-123"),
      ).rejects.toThrow("Repository error");
    });
  });

  describe("updateTaskItemOutput - エラーハンドリング", () => {
    it("タスクが見つからない場合、エラーがスローされる", async () => {
      vi.mocked(mockRepository.findByTaskItemId).mockResolvedValue(null);

      await expect(
        taskService.updateTaskItemOutput("item-123", "owner-123", "アウトプット"),
      ).rejects.toThrow("Task not found");
    });

    it("権限がない場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-456");
      vi.mocked(mockTask.canUpdate).mockReturnValue(false);
      vi.mocked(mockRepository.findByTaskItemId).mockResolvedValue(mockTask);

      await expect(
        taskService.updateTaskItemOutput("item-123", "owner-123", "アウトプット"),
      ).rejects.toThrow("You do not have permission to update this task item");
    });

    it("子タスクが見つからない場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-123", []); // 子タスクが空
      vi.mocked(mockTask.canUpdate).mockReturnValue(true);
      vi.mocked(mockRepository.findByTaskItemId).mockResolvedValue(mockTask);

      await expect(
        taskService.updateTaskItemOutput("item-123", "owner-123", "アウトプット"),
      ).rejects.toThrow("Task item not found");
    });

    it("更新後に再取得できない場合、エラーがスローされる", async () => {
      const mockTaskItem = createMockTaskItem("item-123", "task-123");
      const mockTask = createMockTask("task-123", "owner-123", [mockTaskItem]);
      vi.mocked(mockTask.canUpdate).mockReturnValue(true);
      vi.mocked(mockRepository.findByTaskItemId).mockResolvedValue(mockTask);
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.updateTaskItemOutput("item-123", "owner-123", "アウトプット"),
      ).rejects.toThrow("Failed to update task item");
    });

    it("リポジトリでエラーが発生した場合、エラーがスローされる", async () => {
      const mockTaskItem = createMockTaskItem("item-123", "task-123");
      const mockTask = createMockTask("task-123", "owner-123", [mockTaskItem]);
      vi.mocked(mockTask.canUpdate).mockReturnValue(true);
      vi.mocked(mockRepository.findByTaskItemId).mockResolvedValue(mockTask);
      const repositoryError = new Error("Repository error");
      vi.mocked(mockRepository.updateTaskItemOutputInTransaction).mockRejectedValue(
        repositoryError,
      );

      await expect(
        taskService.updateTaskItemOutput("item-123", "owner-123", "アウトプット"),
      ).rejects.toThrow("Repository error");
    });
  });

  describe("updateReview - エラーハンドリング", () => {
    it("タスクが見つからない場合、エラーがスローされる", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.updateReview("task-123", "owner-123", "振り返り"),
      ).rejects.toThrow("Task not found");
    });

    it("権限がない場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-456");
      vi.mocked(mockTask.canUpdate).mockReturnValue(false);
      vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);

      await expect(
        taskService.updateReview("task-123", "owner-123", "振り返り"),
      ).rejects.toThrow("You do not have permission to update this task review");
    });

    it("更新後に再取得できない場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-123");
      vi.mocked(mockTask.canUpdate).mockReturnValue(true);
      vi.mocked(mockRepository.findById)
        .mockResolvedValueOnce(mockTask) // 最初の呼び出し（既存タスク取得）
        .mockResolvedValueOnce(null); // 2回目の呼び出し（更新後の取得）

      await expect(
        taskService.updateReview("task-123", "owner-123", "振り返り"),
      ).rejects.toThrow("Failed to update task review");
    });

    it("リポジトリでエラーが発生した場合、エラーがスローされる", async () => {
      const mockTask = createMockTask("task-123", "owner-123");
      vi.mocked(mockTask.canUpdate).mockReturnValue(true);
      vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
      const repositoryError = new Error("Repository error");
      vi.mocked(mockRepository.updateReviewInTransaction).mockRejectedValue(
        repositoryError,
      );

      await expect(
        taskService.updateReview("task-123", "owner-123", "振り返り"),
      ).rejects.toThrow("Repository error");
    });
  });

  describe("データ変換", () => {
    it("updateTaskでtaskItemsが正しく変換される", async () => {
      const mockTask = createMockTask("task-123", "owner-123");
      vi.mocked(mockTask.canUpdate).mockReturnValue(true);
      vi.mocked(mockRepository.findById)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(mockTask);

      const taskItems = [
        {
          id: "item-1",
          priority: "High" as const,
          density: "Medium" as const,
          durationTime: 60 as const,
          content: "タスク内容",
          isRequired: true,
          order: 1,
          status: "NotStarted" as const,
        },
      ];

      await taskService.updateTask(
        "task-123",
        "owner-123",
        "テストタスク",
        new Date("2026-01-15"),
        taskItems,
      );

      expect(mockRepository.updateInTransaction).toHaveBeenCalledWith(
        {},
        "task-123",
        {
          title: "テストタスク",
          date: new Date("2026-01-15"),
          taskItems: [
            {
              id: "item-1",
              priority: "High",
              density: "Medium",
              durationTime: 60,
              content: "タスク内容",
              isRequired: true,
              order: 1,
              status: "NotStarted",
            },
          ],
        },
      );
    });
  });
});

// ヘルパー関数: モックTaskエンティティを作成
function createMockTask(id: string, ownerId: string, taskItems: TaskItem[] = []): Task {
  const task = {
    id,
    ownerId,
    title: "テストタスク",
    date: new Date("2026-01-15"),
    review: null,
    taskItems,
    createdAt: new Date(),
    updatedAt: new Date(),
    canUpdate: vi.fn(),
    canDelete: vi.fn(),
  } as unknown as Task;

  return task;
}

// ヘルパー関数: モックTaskItemエンティティを作成
function createMockTaskItem(id: string, taskId: string): TaskItem {
  const taskItem = {
    id,
    taskId,
    priority: Priority.create("High"),
    density: Density.create("Medium"),
    durationTime: DurationTime.create(60),
    content: "タスク内容",
    output: null,
    isRequired: true,
    order: 1,
    status: Status.create("NotStarted"),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TaskItem;

  return taskItem;
}

