import type { TaskResponse } from "@/external/dto/task.dto";

// モックデータの初期値
const initialMockTasks: TaskResponse[] = [
  {
    id: "1",
    ownerId: "owner-1",
    owner: {
      id: "owner-1",
      firstName: "太郎",
      lastName: "山田",
      thumbnail: null,
    },
    title: "メイン機能の開発",
    date: "2026-01-15",
    review:
      "本日はメイン機能開発を大幅に終わらせることができた。少し責務が崩れてしまっている部分があるのでなるべく明日には修正して....",
    taskItems: [
      {
        id: "item-1",
        taskId: "1",
        priority: "High",
        density: "Medium",
        durationTime: 30,
        content: "メイン機能の一覧画面",
        output: null,
        isRequired: true,
        order: 1,
        status: "Completed",
      },
      {
        id: "item-2",
        taskId: "1",
        priority: "High",
        density: "Low",
        durationTime: 15,
        content: "メイン機能の一覧のAPI",
        output: null,
        isRequired: false,
        order: 2,
        status: "Completed",
      },
    ],
    plannedTaskCount: 5,
    plannedTaskDurationMinutes: 180,
    completedTaskCount: 4,
    completedTaskDurationMinutes: 150,
    completionRate: 80,
    HighTaskCount: 2,
    HighTaskDuration: 90,
    HighTaskRate: 50,
    MediumTaskCount: 2,
    MediumTaskDuration: 60,
    MediumTaskRate: 33,
    LowTaskCount: 1,
    LowTaskDuration: 30,
    LowTaskRate: 17,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "2",
    ownerId: "owner-1",
    owner: {
      id: "owner-1",
      firstName: "太郎",
      lastName: "山田",
      thumbnail: null,
    },
    title: "技術選定",
    date: "2026-01-14",
    review:
      "本日は技術選定を行った。いくつかの候補を比較検討し、最適な技術スタックを決定することができた。",
    taskItems: [],
    plannedTaskCount: 3,
    plannedTaskDurationMinutes: 120,
    completedTaskCount: 3,
    completedTaskDurationMinutes: 120,
    completionRate: 100,
    HighTaskCount: 1,
    HighTaskDuration: 60,
    HighTaskRate: 50,
    MediumTaskCount: 1,
    MediumTaskDuration: 30,
    MediumTaskRate: 25,
    LowTaskCount: 1,
    LowTaskDuration: 30,
    LowTaskRate: 25,
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
  },
  {
    id: "3",
    ownerId: "owner-1",
    owner: {
      id: "owner-1",
      firstName: "太郎",
      lastName: "山田",
      thumbnail: null,
    },
    title: "UI実装",
    date: "2026-01-13",
    review: null,
    taskItems: [
      {
        id: "item-3",
        taskId: "3",
        priority: "Medium",
        density: "High",
        durationTime: 45,
        content: "ログイン画面の実装",
        output: null,
        isRequired: true,
        order: 1,
        status: "NotStarted",
      },
    ],
    plannedTaskCount: 2,
    plannedTaskDurationMinutes: 90,
    completedTaskCount: 0,
    completedTaskDurationMinutes: 0,
    completionRate: 0,
    HighTaskCount: 0,
    HighTaskDuration: 0,
    HighTaskRate: 0,
    MediumTaskCount: 1,
    MediumTaskDuration: 45,
    MediumTaskRate: 50,
    LowTaskCount: 1,
    LowTaskDuration: 45,
    LowTaskRate: 50,
    createdAt: "2026-01-13T00:00:00Z",
    updatedAt: "2026-01-13T00:00:00Z",
  },
];

// モックデータを保持する変数（クライアント側でのみ使用）
let mockTasks: TaskResponse[] = [...initialMockTasks];

/**
 * モックタスク一覧を取得
 */
export function getMockTasks(): TaskResponse[] {
  return [...mockTasks];
}

/**
 * モックタスクを追加
 */
export function addMockTask(task: TaskResponse): void {
  mockTasks.push(task);
}

/**
 * モックタスクをIDで取得
 */
export function getMockTaskById(id: string): TaskResponse | undefined {
  return mockTasks.find((t) => t.id === id);
}

/**
 * モックタスクを更新
 */
export function updateMockTask(
  id: string,
  updatedTask: Partial<TaskResponse>,
): void {
  const index = mockTasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    mockTasks[index] = { ...mockTasks[index], ...updatedTask };
  }
}

/**
 * モックタスクを削除
 */
export function deleteMockTask(id: string): void {
  mockTasks = mockTasks.filter((t) => t.id !== id);
}

/**
 * モックデータをリセット（テスト用）
 */
export function resetMockTasks(): void {
  mockTasks = [...initialMockTasks];
}

