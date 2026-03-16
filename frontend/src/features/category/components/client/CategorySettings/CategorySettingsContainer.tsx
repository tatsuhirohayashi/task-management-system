"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategorySettingsPresenter } from "./CategorySettingsPresenter";
import type { CategoryResponse } from "@/external/dto/category.dto";
import { useCategoryListQuery } from "@/features/category/hooks/useCategoryListQuery";
import { categoryKeys } from "@/features/category/queries/keys";
import {
  createCategoryCommandAction,
  updateCategoryCommandAction,
  deleteCategoryCommandAction,
} from "@/external/handler/category.command.action";

export function CategorySettingsContainer() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategoryListQuery();

  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      await createCategoryCommandAction({ name: trimmed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (payload: { id: string; name: string }) => {
      const trimmed = payload.name.trim();
      if (!trimmed) return;
      await updateCategoryCommandAction(payload.id, { name: trimmed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteCategoryCommandAction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });

  const handleAdd = useCallback(() => {
    createCategoryMutation.mutate(inputValue);
    setInputValue("");
  }, [createCategoryMutation, inputValue]);

  const handleEditStart = useCallback((category: CategoryResponse) => {
    setEditingId(category.id);
    setEditingName(category.name);
  }, []);

  const handleEditSave = useCallback(() => {
    if (editingId == null) return;
    updateCategoryMutation.mutate({ id: editingId, name: editingName });
    setEditingId(null);
    setEditingName("");
  }, [editingId, editingName, updateCategoryMutation]);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditingName("");
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (
        typeof window !== "undefined" &&
        !window.confirm("このカテゴリーを削除しますか？")
      ) {
        return;
      }
      deleteCategoryMutation.mutate(id);
      if (editingId === id) {
        setEditingId(null);
        setEditingName("");
      }
    },
    [deleteCategoryMutation, editingId],
  );

  return (
    <CategorySettingsPresenter
      categories={categories}
      inputValue={inputValue}
      editingId={editingId}
      editingName={editingName}
      onInputChange={setInputValue}
      onAdd={handleAdd}
      onEditStart={handleEditStart as (category: CategoryResponse) => void}
      onEditChange={setEditingName}
      onEditSave={handleEditSave}
      onEditCancel={handleEditCancel}
      onDelete={handleDelete}
    />
  );
}

