"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { TaskResponse } from "@/external/dto/task.dto";
import { useTaskDetailQuery } from "@/features/task/hooks/useTaskDetailQuery";
import { updateTaskReviewCommandAction, updateTaskItemOutputCommandAction } from "@/external/handler/task.command.action";
import { useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/features/task/queries/keys";

export function useTaskDetail(taskId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: task, isLoading } = useTaskDetailQuery(taskId);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [review, setReview] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isTaskItemModalOpen, setIsTaskItemModalOpen] = useState(false);
  const [selectedTaskItem, setSelectedTaskItem] = useState<
    TaskResponse["taskItems"][0] | null
  >(null);
  const [taskItemOutput, setTaskItemOutput] = useState("");
  const [taskItemOutputError, setTaskItemOutputError] = useState("");

  // モーダルが開いたときにreviewを初期化するための値
  const reviewForModal = useMemo(() => {
    return task?.review || "";
  }, [task?.review]);

  const handleOpenReviewModal = useCallback(() => {
    setIsReviewModalOpen(true);
    // モーダルを開くときにreviewをリセット
    setReview(reviewForModal);
    setReviewError("");
  }, [reviewForModal]);

  const handleCloseReviewModal = useCallback(() => {
    setIsReviewModalOpen(false);
    setReviewError("");
  }, []);

  const handleSubmitReview = useCallback(async () => {
    if (!task) return;

    // バリデーション
    const trimmedReview = review.trim();
    if (!trimmedReview) {
      setReviewError("振り返りを入力してください");
      return;
    }

    setReviewError("");

    try {
      // APIを呼び出して振り返りを更新
      await updateTaskReviewCommandAction(taskId, {
        review: trimmedReview,
      });

      // キャッシュを無効化
      await queryClient.invalidateQueries({
        queryKey: taskKeys.detail(taskId),
      });
      await queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });

      setIsReviewModalOpen(false);
      setReviewError("");
    } catch (error) {
      console.error("Failed to update review:", error);
      // TODO: エラーハンドリング（トースト通知など）
    }
  }, [review, task, taskId, queryClient]);

  const handleOpenTaskItemModal = useCallback(
    (item: TaskResponse["taskItems"][0]) => {
      setSelectedTaskItem(item);
      setIsTaskItemModalOpen(true);
      // モーダルを開くときにtaskItemOutputをリセット
      setTaskItemOutput(item.output || "");
      setTaskItemOutputError("");
    },
    [],
  );

  const handleCloseTaskItemModal = useCallback(() => {
    setIsTaskItemModalOpen(false);
    setSelectedTaskItem(null);
    setTaskItemOutputError("");
  }, []);

  const handleSubmitTaskItemOutput = useCallback(async () => {
    if (!selectedTaskItem) return;

    // バリデーション
    const trimmedOutput = taskItemOutput.trim();
    if (!trimmedOutput) {
      setTaskItemOutputError("アウトプットを入力してください");
      return;
    }

    setTaskItemOutputError("");

    try {
      // APIを呼び出してアウトプットを更新
      await updateTaskItemOutputCommandAction(selectedTaskItem.id, {
        output: trimmedOutput,
      });

      // キャッシュを無効化
      await queryClient.invalidateQueries({
        queryKey: taskKeys.detail(taskId),
      });
      await queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });

      setIsTaskItemModalOpen(false);
      setSelectedTaskItem(null);
      setTaskItemOutput("");
      setTaskItemOutputError("");
    } catch (error) {
      console.error("Failed to update task item output:", error);
      // TODO: エラーハンドリング（トースト通知など）
    }
  }, [taskItemOutput, selectedTaskItem, taskId, queryClient]);

  const handleEdit = useCallback(() => {
    router.push(`/tasks/${taskId}/edit`);
  }, [router, taskId]);

  // ユーティリティ関数
  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 (${weekday})`;
  }, []);

  const formatDuration = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}時間${mins}分`;
    } else if (hours > 0) {
      return `${hours}時間`;
    } else {
      return `${mins}分`;
    }
  }, []);

  const getPriorityColor = useCallback(
    (priority: "High" | "Medium" | "Low"): string => {
      switch (priority) {
        case "High":
          return "bg-red-500";
        case "Medium":
          return "bg-yellow-500";
        case "Low":
          return "bg-green-500";
      }
    },
    [],
  );

  const getDensityColor = useCallback(
    (density: "High" | "Medium" | "Low"): string => {
      switch (density) {
        case "High":
          return "bg-red-500";
        case "Medium":
          return "bg-yellow-500";
        case "Low":
          return "bg-green-500";
      }
    },
    [],
  );

  return {
    // 状態
    task: task || null,
    isLoading,
    isReviewModalOpen,
    review,
    setReview,
    reviewError,
    isTaskItemModalOpen,
    selectedTaskItem,
    taskItemOutput,
    setTaskItemOutput,
    taskItemOutputError,
    // ハンドラー
    handleOpenReviewModal,
    handleCloseReviewModal,
    handleSubmitReview,
    handleOpenTaskItemModal,
    handleCloseTaskItemModal,
    handleSubmitTaskItemOutput,
    handleEdit,
    // ユーティリティ
    formatDate,
    formatDuration,
    getPriorityColor,
    getDensityColor,
  };
}

