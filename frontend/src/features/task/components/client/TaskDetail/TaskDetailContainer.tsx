"use client";

import { TaskDetailPresenter } from "./TaskDetailPresenter";
import { useTaskDetail } from "./useTaskDetail";

export type TaskDetailContainerProps = {
  taskId: string;
};

export function TaskDetailContainer({ taskId }: TaskDetailContainerProps) {
  const {
    task,
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
    handleOpenReviewModal,
    handleCloseReviewModal,
    handleSubmitReview,
    handleOpenTaskItemModal,
    handleCloseTaskItemModal,
    handleSubmitTaskItemOutput,
    handleEdit,
    formatDate,
    formatDuration,
    getPriorityColor,
    getDensityColor,
  } = useTaskDetail(taskId);

  return (
    <TaskDetailPresenter
      task={task}
      isLoading={isLoading}
      isReviewModalOpen={isReviewModalOpen}
      review={review}
      setReview={setReview}
      reviewError={reviewError}
      isTaskItemModalOpen={isTaskItemModalOpen}
      selectedTaskItem={selectedTaskItem}
      taskItemOutput={taskItemOutput}
      setTaskItemOutput={setTaskItemOutput}
      taskItemOutputError={taskItemOutputError}
      onOpenReviewModal={handleOpenReviewModal}
      onCloseReviewModal={handleCloseReviewModal}
      onSubmitReview={handleSubmitReview}
      onOpenTaskItemModal={handleOpenTaskItemModal}
      onCloseTaskItemModal={handleCloseTaskItemModal}
      onSubmitTaskItemOutput={handleSubmitTaskItemOutput}
      onEdit={handleEdit}
      formatDate={formatDate}
      formatDuration={formatDuration}
      getPriorityColor={getPriorityColor}
      getDensityColor={getDensityColor}
    />
  );
}

