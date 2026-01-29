import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listTaskQuery,
  getTaskByIdQuery,
} from "./task.query.server";
import { requireAuthServer } from "@/features/auth/servers/redirect.server";
import { TasksService } from "../client/api/generated";
import { ValidationError } from "./task.command.server";
import type {
  GetTaskByIdRequest,
  ListTaskResponse,
  TaskFilters,
  TaskResponse,
} from "../dto/task.dto";

// モックの設定
vi.mock("@/features/auth/servers/redirect.server", () => ({
  requireAuthServer: vi.fn(),
}));

vi.mock("../client/api/generated", () => ({
  TasksService: {
    tasksListTasks: vi.fn(),
    tasksGetTaskById: vi.fn(),
  },
  OpenAPI: {
    BASE: "http://localhost:8080",
  },
}));

describe("task.query.server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTaskQuery", () => {
    describe("認証チェック", () => {
      it("requireAuthServerが呼ばれる", async () => {
        const mockTasks: ListTaskResponse = [];
        vi.mocked(TasksService.tasksListTasks).mockResolvedValue(
          mockTasks as never,
        );
        vi.mocked(requireAuthServer).mockResolvedValue(undefined);

        await listTaskQuery({});

        expect(requireAuthServer).toHaveBeenCalledTimes(1);
      });

      it("認証に失敗した場合、エラーがスローされる", async () => {
        const authError = new Error("認証に失敗しました");
        vi.mocked(requireAuthServer).mockRejectedValue(authError);

        await expect(listTaskQuery({})).rejects.toThrow("認証に失敗しました");
      });
    });

    describe("レスポンスの型安全性", () => {
      it("有効なレスポンスが返される", async () => {
        const mockTasks: ListTaskResponse = [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            ownerId: "account-123",
            owner: {
              id: "account-123",
              firstName: "Test",
              lastName: "User",
              thumbnail: null,
            },
            title: "テストタスク",
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
          },
        ];

        vi.mocked(requireAuthServer).mockResolvedValue(undefined);
        vi.mocked(TasksService.tasksListTasks).mockResolvedValue(
          mockTasks as never,
        );

        const result = await listTaskQuery({});

        expect(result).toEqual(mockTasks);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("title");
        expect(result[0]).toHaveProperty("owner");
      });

      it("空の配列が返される", async () => {
        const mockTasks: ListTaskResponse = [];

        vi.mocked(requireAuthServer).mockResolvedValue(undefined);
        vi.mocked(TasksService.tasksListTasks).mockResolvedValue(
          mockTasks as never,
        );

        const result = await listTaskQuery({});

        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
      });

      it("フィルター条件が正しく渡される", async () => {
        const filters: TaskFilters = {
          "year-month": "2026-01",
          ownerId: "account-123",
          q: "テスト",
          sort: "newest",
        };

        const mockTasks: ListTaskResponse = [];

        vi.mocked(requireAuthServer).mockResolvedValue(undefined);
        vi.mocked(TasksService.tasksListTasks).mockResolvedValue(
          mockTasks as never,
        );

        await listTaskQuery(filters);

        expect(TasksService.tasksListTasks).toHaveBeenCalledWith({
          yearMonth: "2026-01",
          ownerId: "account-123",
          q: "テスト",
          sort: "newest",
        });
      });

      it("accountIdが指定された場合、ownerIdが設定される", async () => {
        const filters: TaskFilters = {};
        const accountId = "account-456";

        const mockTasks: ListTaskResponse = [];

        vi.mocked(requireAuthServer).mockResolvedValue(undefined);
        vi.mocked(TasksService.tasksListTasks).mockResolvedValue(
          mockTasks as never,
        );

        await listTaskQuery(filters, accountId);

        expect(TasksService.tasksListTasks).toHaveBeenCalledWith({
          yearMonth: undefined,
          ownerId: accountId,
          q: undefined,
          sort: undefined,
        });
      });
    });
  });

  describe("getTaskByIdQuery", () => {
    describe("入力バリデーション", () => {
      it("有効なUUIDを受け入れる", async () => {
        const validRequest: GetTaskByIdRequest = {
          id: "550e8400-e29b-41d4-a716-446655440000",
        };

        const mockTask: TaskResponse = {
          id: validRequest.id,
          ownerId: "account-123",
          owner: {
            id: "account-123",
            firstName: "Test",
            lastName: "User",
            thumbnail: null,
          },
          title: "テストタスク",
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

        vi.mocked(TasksService.tasksGetTaskById).mockResolvedValue(
          mockTask as never,
        );

        const result = await getTaskByIdQuery(validRequest);

        expect(result).toEqual(mockTask);
        expect(TasksService.tasksGetTaskById).toHaveBeenCalledWith({
          taskId: validRequest.id,
        });
      });

      it("無効なUUIDを拒否する", async () => {
        const invalidRequest = {
          id: "not-a-uuid",
        };

        await expect(getTaskByIdQuery(invalidRequest)).rejects.toThrow(
          ValidationError,
        );
        expect(TasksService.tasksGetTaskById).not.toHaveBeenCalled();
      });

      it("空文字列のIDを拒否する", async () => {
        const invalidRequest = {
          id: "",
        };

        await expect(getTaskByIdQuery(invalidRequest)).rejects.toThrow(
          ValidationError,
        );
        expect(TasksService.tasksGetTaskById).not.toHaveBeenCalled();
      });

      it("idが欠如している場合を拒否する", async () => {
        const invalidRequest = {} as GetTaskByIdRequest;

        await expect(getTaskByIdQuery(invalidRequest)).rejects.toThrow(
          ValidationError,
        );
        expect(TasksService.tasksGetTaskById).not.toHaveBeenCalled();
      });
    });

    describe("レスポンスの型安全性", () => {
      it("有効なタスクが返される", async () => {
        const validRequest: GetTaskByIdRequest = {
          id: "550e8400-e29b-41d4-a716-446655440000",
        };

        const mockTask: TaskResponse = {
          id: validRequest.id,
          ownerId: "account-123",
          owner: {
            id: "account-123",
            firstName: "Test",
            lastName: "User",
            thumbnail: null,
          },
          title: "テストタスク",
          date: "2026-01-15",
          review: "振り返り",
          taskItems: [
            {
              id: "item-1",
              taskId: validRequest.id,
              priority: "High",
              density: "Medium",
              durationTime: 60,
              content: "タスク内容",
              output: null,
              isRequired: true,
              order: 1,
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
          HighTaskRate: 100,
          MediumTaskCount: 0,
          MediumTaskDuration: 0,
          MediumTaskRate: 0,
          LowTaskCount: 0,
          LowTaskDuration: 0,
          LowTaskRate: 0,
          createdAt: "2026-01-15T00:00:00Z",
          updatedAt: "2026-01-15T00:00:00Z",
        };

        vi.mocked(TasksService.tasksGetTaskById).mockResolvedValue(
          mockTask as never,
        );

        const result = await getTaskByIdQuery(validRequest);

        expect(result).toEqual(mockTask);
        expect(result).not.toBeNull();
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("title");
        expect(result).toHaveProperty("owner");
        expect(result).toHaveProperty("taskItems");
        expect(Array.isArray(result?.taskItems)).toBe(true);
      });

      it("タスクが存在しない場合、nullが返される", async () => {
        const validRequest: GetTaskByIdRequest = {
          id: "550e8400-e29b-41d4-a716-446655440000",
        };

        const notFoundError = {
          status: 404,
        };

        vi.mocked(TasksService.tasksGetTaskById).mockRejectedValue(
          notFoundError,
        );

        const result = await getTaskByIdQuery(validRequest);

        expect(result).toBeNull();
      });

      it("404以外のエラーが発生した場合、エラーがスローされる", async () => {
        const validRequest: GetTaskByIdRequest = {
          id: "550e8400-e29b-41d4-a716-446655440000",
        };

        const serverError = {
          status: 500,
          message: "Internal server error",
        };

        vi.mocked(TasksService.tasksGetTaskById).mockRejectedValue(
          serverError,
        );

        await expect(getTaskByIdQuery(validRequest)).rejects.toEqual(
          serverError,
        );
      });

      it("レスポンスがTaskResponse型であることを確認", async () => {
        const validRequest: GetTaskByIdRequest = {
          id: "550e8400-e29b-41d4-a716-446655440000",
        };

        const mockTask: TaskResponse = {
          id: validRequest.id,
          ownerId: "account-123",
          owner: {
            id: "account-123",
            firstName: "Test",
            lastName: "User",
            thumbnail: null,
          },
          title: "テストタスク",
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

        vi.mocked(TasksService.tasksGetTaskById).mockResolvedValue(
          mockTask as never,
        );

        const result = await getTaskByIdQuery(validRequest);

        // 型安全性の確認: すべての必須プロパティが存在することを確認
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("ownerId");
        expect(result).toHaveProperty("owner");
        expect(result).toHaveProperty("title");
        expect(result).toHaveProperty("date");
        expect(result).toHaveProperty("taskItems");
        expect(result).toHaveProperty("plannedTaskCount");
        expect(result).toHaveProperty("completedTaskCount");
        expect(result).toHaveProperty("completionRate");
        expect(result).toHaveProperty("createdAt");
        expect(result).toHaveProperty("updatedAt");

        // ownerオブジェクトの型安全性
        if (result) {
          expect(result.owner).toHaveProperty("id");
          expect(result.owner).toHaveProperty("firstName");
          expect(result.owner).toHaveProperty("lastName");
          expect(result.owner).toHaveProperty("thumbnail");
        }
      });
    });
  });
});

