/**
 * カテゴリー設定画面用モックデータ
 * 本番API接続時に削除または置き換え
 */

export interface MockCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const initialMockCategories: MockCategory[] = [
  {
    id: "mock-cat-1",
    name: "インプット系",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-cat-2",
    name: "文章系",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-cat-3",
    name: "思考系",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];
