"use client";

import { Button } from "@/shared/components/ui/button";
import type { TaskResponse } from "@/external/dto/task.dto";
import { BasicModal } from "@/shared/components/dialog/BasicModal";
import { RequiredBadge } from "@/shared/components/common/RequiredBadge";

interface TaskDetailPresenterProps {
  task: TaskResponse | null;
  isLoading: boolean;
  // 状態
  isReviewModalOpen: boolean;
  review: string;
  setReview: (review: string) => void;
  reviewError: string;
  isTaskItemModalOpen: boolean;
  selectedTaskItem: TaskResponse["taskItems"][0] | null;
  taskItemOutput: string;
  setTaskItemOutput: (output: string) => void;
  taskItemOutputError: string;
  // ハンドラー
  onOpenReviewModal: () => void;
  onCloseReviewModal: () => void;
  onSubmitReview: () => void;
  onOpenTaskItemModal: (item: TaskResponse["taskItems"][0]) => void;
  onCloseTaskItemModal: () => void;
  onSubmitTaskItemOutput: () => void;
  onEdit: () => void;
  // ユーティリティ
  formatDate: (dateString: string) => string;
  formatDuration: (minutes: number) => string;
  getPriorityColor: (priority: "High" | "Medium" | "Low") => string;
  getDensityColor: (density: "High" | "Medium" | "Low") => string;
}

export function TaskDetailPresenter({
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
  onOpenReviewModal,
  onCloseReviewModal,
  onSubmitReview,
  onOpenTaskItemModal,
  onCloseTaskItemModal,
  onSubmitTaskItemOutput,
  onEdit,
  formatDate,
  formatDuration,
  getPriorityColor,
  getDensityColor,
}: TaskDetailPresenterProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  if (!task) {
    return <div className="text-center py-8 text-gray-500">タスクが見つかりません</div>;
  }
  return (
    <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-white">
      {/* 日付とタイトル */}
      <div className="relative flex items-center justify-between">
        <div className="text-xl text-gray-600 font-semibold">
          {formatDate(task.date)}
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-semibold">
          {task.title}
        </div>
        <Button
          className="bg-gray-800 text-white hover:bg-gray-700"
          onClick={onEdit}
        >
          編集
        </Button>
      </div>

      {/* タスク一覧セクション */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">タスク一覧</h2>
          <div className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">・・・高</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-600">・・・中</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">・・・緑</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {task.taskItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 border border-gray-200 rounded"
            >
              <input
                type="checkbox"
                checked={item.status === "Completed"}
                readOnly
                className="w-4 h-4"
              />
              <div
                className={`w-3 h-3 rounded-full ${getPriorityColor(
                  item.priority,
                )}`}
              />
              <div
                className={`w-3 h-3 rounded-full ${getDensityColor(
                  item.density,
                )}`}
              />
              <div className="text-sm text-gray-700">{item.durationTime}分</div>
              {item.isRequired && <RequiredBadge />}
              <div className="flex-1 text-sm text-gray-900">
                {item.content}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => onOpenTaskItemModal(item)}
              >
                詳細
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* タスク状況セクション */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex gap-6">
          {/* 完了率の列 */}
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              タスク状況
            </h2>
            <div className="mt-6 text-xl font-bold text-gray-700">
              完了率 {task.completionRate}%
            </div>
          </div>

          {/* 総合の列 */}
          <div className="flex-1 border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-bold mb-3 text-gray-700">総合</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                予定タスク {task.plannedTaskCount}個{" "}
                {formatDuration(task.plannedTaskDurationMinutes)}
              </div>
              <div>
                完了タスク {task.completedTaskCount}個{" "}
                {formatDuration(task.completedTaskDurationMinutes)}
              </div>
            </div>
          </div>

          {/* 完了タスク負荷別の列 */}
          <div className="flex-1 border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-bold mb-3 text-gray-700">
              完了タスク負荷別
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>
                  {task.HighTaskCount}個 {formatDuration(task.HighTaskDuration)}{" "}
                  {task.HighTaskRate}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>
                  {task.MediumTaskCount}個{" "}
                  {formatDuration(task.MediumTaskDuration)} {task.MediumTaskRate}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>
                  {task.LowTaskCount}個 {formatDuration(task.LowTaskDuration)}{" "}
                  {task.LowTaskRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1日の振り返りセクション */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">1日の振り返り</h2>
          {task.review && (
            <Button
              className="bg-gray-800 text-white hover:bg-gray-700"
              onClick={onOpenReviewModal}
            >
              編集
            </Button>
          )}
        </div>
        {task.review ? (
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {task.review}
          </div>
        ) : (
          <div className="relative">
            <p className="text-sm text-gray-700 mb-4">
              1日が終わったら、振り返りをしましょう
            </p>
            <div className="flex justify-center">
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={onOpenReviewModal}
              >
                記入
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 振り返り記入モーダル */}
      <BasicModal
        isOpen={isReviewModalOpen}
        onClose={onCloseReviewModal}
        onSubmit={onSubmitReview}
        title="1日の振り返り"
      >
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="1日が終わったら、振り返りをしましょう"
          className={`w-full min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 resize-none ${
            reviewError
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-gray-400"
          }`}
        />
        {reviewError && (
          <p className="mt-1 text-sm text-red-500">{reviewError}</p>
        )}
      </BasicModal>

      {/* タスクアイテムアウトプットモーダル */}
      {selectedTaskItem && (
        <BasicModal
          isOpen={isTaskItemModalOpen}
          onClose={onCloseTaskItemModal}
          onSubmit={onSubmitTaskItemOutput}
          title="タスクのアウトプット"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium text-gray-700 whitespace-nowrap">
                タスク名
              </label>
              <input
                type="text"
                value={selectedTaskItem.content}
                readOnly
                className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium text-gray-700 whitespace-nowrap">
                優先度
              </label>
              <select
                value={selectedTaskItem.priority}
                disabled
                className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-100"
              >
                <option value="High">高</option>
                <option value="Medium">中</option>
                <option value="Low">低</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium text-gray-700 whitespace-nowrap">
                密度
              </label>
              <select
                value={selectedTaskItem.density}
                disabled
                className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-100"
              >
                <option value="High">高</option>
                <option value="Medium">中</option>
                <option value="Low">低</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium text-gray-700 whitespace-nowrap">
                継続時間
              </label>
              <select
                value={selectedTaskItem.durationTime}
                disabled
                className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-100"
              >
                <option value={60}>60分</option>
                <option value={45}>45分</option>
                <option value={30}>30分</option>
                <option value={15}>15分</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                アウトプット
              </label>
              <textarea
                value={taskItemOutput}
                onChange={(e) => setTaskItemOutput(e.target.value)}
                placeholder="アウトプットを入力してください"
                className={`w-full min-h-[200px] p-4 border rounded-md focus:outline-none focus:ring-2 resize-none ${
                  taskItemOutputError
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-gray-400"
                }`}
              />
              {taskItemOutputError && (
                <p className="mt-1 text-sm text-red-500">{taskItemOutputError}</p>
              )}
            </div>
          </div>
        </BasicModal>
      )}
    </div>
  );
}

