"use client";

import type React from "react";
import { Button } from "@/shared/components/ui/button";
import { RequiredBadge } from "@/shared/components/common/RequiredBadge";
import type { UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { TaskNewFormData } from "./schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskNewPresenterProps {
  register: UseFormRegister<TaskNewFormData>;
  control: Control<TaskNewFormData>;
  fields: Array<{
    id: string;
    priority: "High" | "Medium" | "Low";
    density: "High" | "Medium" | "Low";
    durationTime: 60 | 45 | 30 | 15;
    content: string;
    isRequired: boolean;
  }>;
  errors: FieldErrors<TaskNewFormData>;
  isSubmitting: boolean;
  onBack: () => void;
  onAddTaskItem: () => void;
  onRemoveTaskItem: (index: number) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onDragEnd: (event: { active: { id: string }; over: { id: string } | null }) => void;
}

function SortableTaskItem({
  field,
  index,
  register,
  control,
  errors,
  onRemoveTaskItem,
}: {
  field: { id: string };
  index: number;
  register: UseFormRegister<TaskNewFormData>;
  control: Control<TaskNewFormData>;
  errors: FieldErrors<TaskNewFormData>;
  onRemoveTaskItem: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[40px_40px_100px_100px_80px_1fr_70px] gap-2 items-center border border-gray-300 rounded-md p-2"
    >
      <div className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </div>
      <Controller
        name={`taskItems.${index}.isRequired`}
        control={control}
        render={({ field: { onChange, value } }) => (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-gray-400"
          />
        )}
      />
      <Controller
        name={`taskItems.${index}.priority`}
        control={control}
        render={({ field: { onChange, value } }) => (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 ${
              errors.taskItems?.[index]?.priority ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="High">高</option>
            <option value="Medium">中</option>
            <option value="Low">低</option>
          </select>
        )}
      />
      <Controller
        name={`taskItems.${index}.density`}
        control={control}
        render={({ field: { onChange, value } }) => (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 ${
              errors.taskItems?.[index]?.density ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="High">高</option>
            <option value="Medium">中</option>
            <option value="Low">低</option>
          </select>
        )}
      />
      <Controller
        name={`taskItems.${index}.durationTime`}
        control={control}
        render={({ field: { onChange, value } }) => (
          <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 ${
              errors.taskItems?.[index]?.durationTime ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value={60}>60分</option>
            <option value={45}>45分</option>
            <option value={30}>30分</option>
            <option value={15}>15分</option>
          </select>
        )}
      />
      <div>
        <input
          type="text"
          {...register(`taskItems.${index}.content`)}
          placeholder="内容を入力してください"
          className={`w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 ${
            errors.taskItems?.[index]?.content ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.taskItems?.[index]?.content && (
          <p className="text-red-500 text-xs mt-1">
            {errors.taskItems[index]?.content?.message}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => onRemoveTaskItem(index)}
        className="bg-red-500 text-white hover:bg-red-600 text-xs px-2 py-1 whitespace-nowrap"
      >
        削除
      </Button>
    </div>
  );
}

export function TaskNewPresenter({
  register,
  control,
  fields,
  errors,
  isSubmitting,
  onBack,
  onAddTaskItem,
  onRemoveTaskItem,
  onSubmit,
  onDragEnd,
}: TaskNewPresenterProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    onDragEnd({ active: { id: String(active.id) }, over: { id: String(over.id) } });
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      {/* ヘッダー: 戻るボタンとタイトル */}
      <div className="relative flex items-center mb-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="bg-black text-white hover:bg-gray-800 rounded-full px-6"
        >
          戻る
        </Button>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-semibold">
          1日のタスク作成
        </h1>
      </div>

      {/* 日付入力 */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-16">
          日付
        </label>
        <RequiredBadge />
        <div>
          <input
            type="date"
            {...register("date")}
            className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 ${
              errors.date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>
      </div>

      {/* タイトル入力 */}
      <div className="mb-6 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-16">
          タイトル
        </label>
        <RequiredBadge />
        <div className="flex-1">
          <input
            type="text"
            {...register("title")}
            placeholder="タイトルを入力してください"
            className={`flex-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
      </div>

      {/* タスクセクション */}
      <div className="mb-6 border border-gray-300 rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex-1 text-center">タスク</h2>
          <Button
            type="button"
            className="bg-black text-white hover:bg-gray-800 rounded-full px-6"
            onClick={onAddTaskItem}
          >
            追加
          </Button>
        </div>

        {/* タスクリスト */}
        {fields.length > 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-[40px_40px_100px_100px_80px_1fr_70px] gap-2 text-sm font-medium text-gray-700 mb-2">
              <div></div>
              <div>必須</div>
              <div>優先度</div>
              <div>密度</div>
              <div>継続時間</div>
              <div>内容</div>
              <div></div>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <SortableTaskItem
                      key={field.id}
                      field={field}
                      index={index}
                      register={register}
                      control={control}
                      errors={errors}
                      onRemoveTaskItem={onRemoveTaskItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            タスクを追加してください
          </div>
        )}
        {errors.taskItems && typeof errors.taskItems === "object" && "message" in errors.taskItems && (
          <p className="text-red-500 text-sm mt-2">{errors.taskItems.message}</p>
        )}
      </div>

      {/* 作成ボタン */}
      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white hover:bg-gray-800 rounded-full px-6 disabled:opacity-50"
        >
          {isSubmitting ? "作成中..." : "作成"}
        </Button>
      </div>
    </form>
  );
}

