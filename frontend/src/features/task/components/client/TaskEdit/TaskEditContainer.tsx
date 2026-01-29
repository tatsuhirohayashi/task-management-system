"use client";

import { TaskEditPresenter } from "./TaskEditPresenter";
import { useTaskEdit } from "./useTaskEdit";

interface TaskEditContainerProps {
  taskId: string;
}

export function TaskEditContainer({ taskId }: TaskEditContainerProps) {
  const {
    register,
    control,
    fields,
    errors,
    isSubmitting,
    isLoading,
    handleBack,
    handleAddTaskItem,
    handleRemoveTaskItem,
    handleSubmit,
    handleDelete,
    formatDateForDisplay,
    handleDragEnd,
  } = useTaskEdit(taskId);

  return (
    <TaskEditPresenter
      register={register}
      control={control}
      fields={fields}
      errors={errors}
      isSubmitting={isSubmitting}
      isLoading={isLoading}
      onBack={handleBack}
      onAddTaskItem={handleAddTaskItem}
      onRemoveTaskItem={handleRemoveTaskItem}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      formatDateForDisplay={formatDateForDisplay}
      onDragEnd={handleDragEnd}
    />
  );
}

