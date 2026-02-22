"use client";

import { Button } from "@/shared/components/ui/button";
import type { MockCategory } from "@/features/category/mock";

const inputClassName =
  "px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 w-full max-w-xs";

interface CategorySettingsPresenterProps {
  categories: MockCategory[];
  inputValue: string;
  editingId: string | null;
  editingName: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onEditStart: (category: MockCategory) => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
}

export function CategorySettingsPresenter({
  categories,
  inputValue,
  editingId,
  editingName,
  onInputChange,
  onAdd,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
}: CategorySettingsPresenterProps) {
  return (
    <div className="space-y-6 border border-gray-300 rounded-lg bg-white p-6">
      {/* カテゴリー作成 */}
      <section>
        <h2 className="text-center text-lg font-semibold mb-4">
          カテゴリー作成
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <label htmlFor="category-name" className="text-sm font-medium text-gray-700">
            カテゴリー
          </label>
          <input
            id="category-name"
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="インプット系"
            className={inputClassName}
          />
          <Button
            type="button"
            onClick={onAdd}
            className="bg-black text-white hover:bg-gray-800 hover:text-white"
          >
            追加
          </Button>
        </div>
      </section>

      {/* カテゴリー一覧 */}
      <section>
        <h2 className="text-center text-lg font-semibold mb-4">
          カテゴリー一覧
        </h2>
        <ul className="space-y-2">
          {categories.length === 0 ? (
            <li className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded bg-gray-50">
              カテゴリーがありません。上で追加してください。
            </li>
          ) : (
            categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 py-2 px-3 border border-gray-300 rounded bg-white"
              >
                {editingId === category.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => onEditChange(e.target.value)}
                      className={`${inputClassName} flex-1 max-w-xs`}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={onEditSave}
                        className="bg-black hover:bg-gray-800"
                      >
                        保存
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onEditCancel}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gray-900">{category.name}</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onEditStart(category)}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        編集
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(category.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
