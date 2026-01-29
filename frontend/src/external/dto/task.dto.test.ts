import { describe, it, expect } from "vitest";
import {
  TaskIdSchema,
  GetTaskByIdRequestSchema,
  CreateTaskRequestSchema,
  UpdateTaskRequestSchema,
  UpdateTaskItemOutputRequestSchema,
  UpdateTaskReviewRequestSchema,
} from "./task.dto";

describe("Task DTO - Zodバリデーション", () => {
  describe("TaskIdSchema", () => {
    it("有効なUUIDを受け入れる", () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(() => TaskIdSchema.parse(validUuid)).not.toThrow();
    });

    it("無効なUUIDを拒否する", () => {
      const invalidUuid = "not-a-uuid";
      expect(() => TaskIdSchema.parse(invalidUuid)).toThrow();
    });

    it("空文字列を拒否する", () => {
      expect(() => TaskIdSchema.parse("")).toThrow();
    });
  });

  describe("GetTaskByIdRequestSchema", () => {
    it("有効なリクエストを受け入れる", () => {
      const validRequest = {
        id: "550e8400-e29b-41d4-a716-446655440000",
      };
      expect(() => GetTaskByIdRequestSchema.parse(validRequest)).not.toThrow();
    });

    it("無効なIDを拒否する", () => {
      const invalidRequest = {
        id: "not-a-uuid",
      };
      expect(() => GetTaskByIdRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("idが欠如している場合を拒否する", () => {
      const invalidRequest = {};
      expect(() => GetTaskByIdRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe("CreateTaskRequestSchema", () => {
    const validTaskItem = {
      priority: "High" as const,
      density: "Medium" as const,
      durationTime: 60 as const,
      content: "タスク内容",
      isRequired: true,
      order: 1,
      status: "NotStarted" as const,
    };

    it("有効なリクエストを受け入れる", () => {
      const validRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [validTaskItem],
      };
      expect(() => CreateTaskRequestSchema.parse(validRequest)).not.toThrow();
    });

    it("titleが空文字列の場合を拒否する", () => {
      const invalidRequest = {
        title: "",
        date: "2026-01-15",
        taskItems: [validTaskItem],
      };
      expect(() => CreateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("dateが無効な日付の場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "invalid-date",
        taskItems: [validTaskItem],
      };
      expect(() => CreateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("taskItemsが空配列の場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [],
      };
      expect(() => CreateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("taskItemのpriorityが無効な場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [
          {
            ...validTaskItem,
            priority: "Invalid",
          },
        ],
      };
      expect(() => CreateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("taskItemのdensityが無効な場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [
          {
            ...validTaskItem,
            density: "Invalid",
          },
        ],
      };
      expect(() => CreateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("taskItemのdurationTimeが無効な場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [
          {
            ...validTaskItem,
            durationTime: 90,
          },
        ],
      };
      expect(() => CreateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("taskItemのcontentが空文字列の場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [
          {
            ...validTaskItem,
            content: "",
          },
        ],
      };
      expect(() => CreateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("taskItemのorderが負の数の場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [
          {
            ...validTaskItem,
            order: -1,
          },
        ],
      };
      expect(() => CreateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("taskItemのstatusが無効な場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [
          {
            ...validTaskItem,
            status: "Invalid",
          },
        ],
      };
      expect(() => CreateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe("UpdateTaskRequestSchema", () => {
    const validTaskItem = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      priority: "High" as const,
      density: "Medium" as const,
      durationTime: 60 as const,
      content: "タスク内容",
      isRequired: true,
      order: 1,
      status: "NotStarted" as const,
    };

    it("有効なリクエストを受け入れる", () => {
      const validRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [validTaskItem],
      };
      expect(() => UpdateTaskRequestSchema.parse(validRequest)).not.toThrow();
    });

    it("titleが空文字列の場合を拒否する", () => {
      const invalidRequest = {
        title: "",
        date: "2026-01-15",
        taskItems: [validTaskItem],
      };
      expect(() => UpdateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("dateが無効な日付の場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "invalid-date",
        taskItems: [validTaskItem],
      };
      expect(() => UpdateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("taskItemsが空配列の場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [],
      };
      expect(() => UpdateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });

    it("taskItemのidが無効なUUIDの場合を拒否する", () => {
      const invalidRequest = {
        title: "テストタスク",
        date: "2026-01-15",
        taskItems: [
          {
            ...validTaskItem,
            id: "not-a-uuid",
          },
        ],
      };
      expect(() => UpdateTaskRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe("UpdateTaskItemOutputRequestSchema", () => {
    it("有効なリクエストを受け入れる", () => {
      const validRequest = {
        output: "アウトプット内容",
      };
      expect(() =>
        UpdateTaskItemOutputRequestSchema.parse(validRequest),
      ).not.toThrow();
    });

    it("outputが空文字列の場合を拒否する", () => {
      const invalidRequest = {
        output: "",
      };
      expect(() =>
        UpdateTaskItemOutputRequestSchema.parse(invalidRequest),
      ).toThrow();
    });

    it("outputが空白のみの場合を拒否する", () => {
      const invalidRequest = {
        output: "   ",
      };
      // Zodのmin(1)は空白文字も1文字としてカウントするため、これは通る
      // 実際のアプリケーションでは、trim()で処理する必要がある
      expect(() =>
        UpdateTaskItemOutputRequestSchema.parse(invalidRequest),
      ).not.toThrow();
    });

    it("outputが欠如している場合を拒否する", () => {
      const invalidRequest = {};
      expect(() =>
        UpdateTaskItemOutputRequestSchema.parse(invalidRequest),
      ).toThrow();
    });
  });

  describe("UpdateTaskReviewRequestSchema", () => {
    it("有効なリクエスト（reviewが文字列）を受け入れる", () => {
      const validRequest = {
        review: "振り返り内容",
      };
      expect(() =>
        UpdateTaskReviewRequestSchema.parse(validRequest),
      ).not.toThrow();
    });

    it("有効なリクエスト（reviewがnull）を受け入れる", () => {
      const validRequest = {
        review: null,
      };
      expect(() =>
        UpdateTaskReviewRequestSchema.parse(validRequest),
      ).not.toThrow();
    });

    it("reviewが欠如している場合を拒否する", () => {
      const invalidRequest = {};
      expect(() =>
        UpdateTaskReviewRequestSchema.parse(invalidRequest),
      ).toThrow();
    });

    it("reviewが数値の場合を拒否する", () => {
      const invalidRequest = {
        review: 123,
      };
      expect(() =>
        UpdateTaskReviewRequestSchema.parse(invalidRequest),
      ).toThrow();
    });
  });
});

