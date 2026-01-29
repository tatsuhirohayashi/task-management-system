"use client";

import { TaskNewPresenter } from "./TaskNewPresenter";
import { useTaskNew } from "./useTaskNew";

export function TaskNewContainer() {
  const {
    register,
    control,
    fields,
    errors,
    isSubmitting,
    handleBack,
    handleAddTaskItem,
    handleRemoveTaskItem,
    handleSubmit,
    handleDragEnd,
  } = useTaskNew();

  return (
    <TaskNewPresenter
      register={register}
      control={control}
      fields={fields}
      errors={errors}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onAddTaskItem={handleAddTaskItem}
      onRemoveTaskItem={handleRemoveTaskItem}
      onSubmit={handleSubmit}
      onDragEnd={handleDragEnd}
    />
  );
}

