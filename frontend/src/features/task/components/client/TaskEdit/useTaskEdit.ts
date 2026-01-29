"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTaskDetailQuery } from "@/features/task/hooks/useTaskDetailQuery";
import { updateTaskCommandAction, deleteTaskCommandAction } from "@/external/handler/task.command.action";
import { useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/features/task/queries/keys";
import { TaskEditFormSchema, type TaskEditFormData, type TaskItem } from "./schema";

export function useTaskEdit(taskId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: task, isLoading } = useTaskDetailQuery(taskId);

  const formatDateForInput = useCallback((dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }, []);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskEditFormData>({
    resolver: zodResolver(TaskEditFormSchema),
    defaultValues: {
      title: "",
      date: "",
      taskItems: [],
    },
  });

  const { fields, append, remove, update, move } = useFieldArray({
    control,
    name: "taskItems",
  });

  useEffect(() => {
    if (task) {
      // タスクデータを初期値として設定
      reset({
        title: task.title,
        date: formatDateForInput(task.date),
        taskItems: task.taskItems.map((item) => ({
          id: item.id,
          priority: item.priority,
          density: item.density,
          durationTime: item.durationTime,
          content: item.content,
          isRequired: item.isRequired,
        })),
      });
    }
  }, [task, formatDateForInput, reset]);

  const formatDateForDisplay = useCallback((dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }, []);

  const handleBack = useCallback(() => {
    router.push(`/tasks/${taskId}`);
  }, [router, taskId]);

  const handleAddTaskItem = useCallback(() => {
    // UUIDを生成（ブラウザのcrypto.randomUUID()を使用）
    const newId = crypto.randomUUID();
    append({
      id: newId,
      priority: "Medium",
      density: "Medium",
      durationTime: 30,
      content: "",
      isRequired: false,
    });
  }, [append]);

  const handleRemoveTaskItem = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const handleUpdateTaskItem = useCallback(
    (index: number, field: string, value: string | number | boolean) => {
      const currentItem = fields[index];
      if (currentItem) {
        update(index, {
          ...currentItem,
          [field]: value,
        });
      }
    },
    [fields, update],
  );

  const onSubmit = useCallback(
    async (data: TaskEditFormData) => {
      if (!task) {
        console.error("Task not found:", taskId);
        return;
      }

      // タスクアイテムを変換（既存のタスクアイテムからstatus, output, isRequiredを取得）
      const updatedTaskItems = data.taskItems.map((item: TaskItem, index: number) => {
        const existingItem = task.taskItems.find((ti) => ti.id === item.id);
        // 既存のアイテムがない場合は新規追加されたアイテム
        // UUIDが正しい形式か確認（UUID形式でない場合は新規生成）
        let itemId = item.id;
        if (!itemId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)) {
          itemId = crypto.randomUUID();
        }
        return {
          id: itemId,
          priority: item.priority,
          density: item.density,
          durationTime: item.durationTime,
          content: item.content.trim(),
          isRequired: item.isRequired,
          order: index + 1,
          status: existingItem?.status || ("NotStarted" as const),
        };
      });

      try {
        // APIを呼び出してタスクを更新
        await updateTaskCommandAction(taskId, {
          title: data.title,
          date: data.date,
          taskItems: updatedTaskItems,
        });

        // キャッシュを無効化
        await queryClient.invalidateQueries({
          queryKey: taskKeys.detail(taskId),
        });
        await queryClient.invalidateQueries({
          queryKey: taskKeys.lists(),
        });

        // 更新後、タスク詳細ページに遷移
        router.push(`/tasks/${taskId}`);
      } catch (error) {
        console.error("Failed to update task:", error);
        // TODO: エラーハンドリング（トースト通知など）
      }
    },
    [router, taskId, task, queryClient],
  );

  const handleDelete = useCallback(async () => {
    try {
      // APIを呼び出してタスクを削除
      await deleteTaskCommandAction(taskId);

      // キャッシュを無効化
      await queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });

      // 削除後、タスク一覧ページに遷移
      router.push("/tasks");
    } catch (error) {
      console.error("Failed to delete task:", error);
      // TODO: エラーハンドリング（トースト通知など）
    }
  }, [router, taskId, queryClient]);

  const handleDragEnd = useCallback(
    (event: { active: { id: string }; over: { id: string } | null }) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    },
    [fields, move],
  );

  return {
    register,
    control,
    fields,
    errors,
    isSubmitting,
    isLoading,
    handleBack,
    handleAddTaskItem,
    handleRemoveTaskItem,
    handleUpdateTaskItem,
    handleSubmit: handleSubmit(onSubmit),
    handleDelete,
    formatDateForDisplay,
    handleDragEnd,
  };
}

