"use client";

import { useState, useCallback } from "react";
import { CategorySettingsPresenter } from "./CategorySettingsPresenter";
import {
  initialMockCategories,
  mockAddCategory,
  mockUpdateCategory,
  mockDeleteCategory,
  type MockCategory,
} from "@/features/category/mock";

export function CategorySettingsContainer() {
  const [categories, setCategories] = useState<MockCategory[]>(initialMockCategories);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = useCallback(() => {
    setCategories((prev) => mockAddCategory(prev, inputValue));
    setInputValue("");
  }, [inputValue]);

  const handleEditStart = useCallback((category: MockCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  }, []);

  const handleEditSave = useCallback(() => {
    if (editingId == null) return;
    setCategories((prev) => mockUpdateCategory(prev, editingId, editingName));
    setEditingId(null);
    setEditingName("");
  }, [editingId, editingName]);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditingName("");
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (typeof window !== "undefined" && !window.confirm("このカテゴリーを削除しますか？")) return;
    setCategories((prev) => mockDeleteCategory(prev, id));
    if (editingId === id) {
      setEditingId(null);
      setEditingName("");
    }
  }, [editingId]);

  return (
    <CategorySettingsPresenter
      categories={categories}
      inputValue={inputValue}
      editingId={editingId}
      editingName={editingName}
      onInputChange={setInputValue}
      onAdd={handleAdd}
      onEditStart={handleEditStart}
      onEditChange={setEditingName}
      onEditSave={handleEditSave}
      onEditCancel={handleEditCancel}
      onDelete={handleDelete}
    />
  );
}
