/**
 * カテゴリー設定画面用モック操作（追加・編集・削除）
 * 本番API接続時に削除または置き換え
 */

import type { MockCategory } from "./data";

function generateId(): string {
  return `mock-cat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function mockAddCategory(
  categories: MockCategory[],
  name: string
): MockCategory[] {
  const trimmed = name.trim();
  if (!trimmed) return categories;
  const exists = categories.some(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return categories;
  const newCategory: MockCategory = {
    id: generateId(),
    name: trimmed,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return [...categories, newCategory];
}

export function mockUpdateCategory(
  categories: MockCategory[],
  id: string,
  name: string
): MockCategory[] {
  const trimmed = name.trim();
  if (!trimmed) return categories;
  return categories.map((c) =>
    c.id === id
      ? { ...c, name: trimmed, updatedAt: nowIso() }
      : c
  );
}

export function mockDeleteCategory(
  categories: MockCategory[],
  id: string
): MockCategory[] {
  return categories.filter((c) => c.id !== id);
}
