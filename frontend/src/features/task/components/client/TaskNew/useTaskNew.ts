"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskCommandAction } from "@/external/handler/task.command.action";
import type { CreateTaskRequest } from "@/external/dto/task.dto";
import { TaskNewFormSchema, type TaskNewFormData } from "./schema";

export function useTaskNew() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TaskNewFormData>({
    resolver: zodResolver(TaskNewFormSchema),
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

  const handleBack = useCallback(() => {
    router.push("/tasks");
  }, [router]);

  const handleAddTaskItem = useCallback(() => {
    append({
      id: `task-item-${Date.now()}`,
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
    async (data: TaskNewFormData) => {
      // CreateTaskRequestの形式に変換
      const request: CreateTaskRequest = {
        title: data.title,
        date: data.date,
        taskItems: data.taskItems.map((item, index) => ({
          priority: item.priority,
          density: item.density,
          durationTime: item.durationTime,
          content: item.content,
          isRequired: item.isRequired,
          order: index + 1,
          status: "NotStarted" as const,
        })),
      };

      try {
        // API経由でタスクを作成
        const createdTask = await createTaskCommandAction(request);

        // 作成後、タスク詳細ページに遷移
        router.push(`/tasks/${createdTask.id}`);
      } catch (error) {
        console.error("Failed to create task:", error);
        // TODO: エラーハンドリング（トースト通知など）
      }
    },
    [router],
  );

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
    setValue,
    getValues,
    handleBack,
    handleAddTaskItem,
    handleRemoveTaskItem,
    handleUpdateTaskItem,
    handleSubmit: handleSubmit(onSubmit),
    handleDragEnd,
  };
}

