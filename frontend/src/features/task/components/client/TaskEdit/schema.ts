/**
 * TaskEdit Form Schema
 * タスク編集フォームのバリデーションスキーマ
 */

import { z } from "zod";

/**
 * フォーム用のTaskItemスキーマ（idを含む）
 */
const TaskItemFormSchema = z.object({
  id: z.string(),
  priority: z.enum(["High", "Medium", "Low"], {
    message: "優先度を選択してください",
  }),
  density: z.enum(["High", "Medium", "Low"], {
    message: "密度を選択してください",
  }),
  durationTime: z.union([z.literal(60), z.literal(45), z.literal(30), z.literal(15)], {
    message: "継続時間を選択してください",
  }),
  content: z.string().min(1, { message: "内容を入力してください" }),
  isRequired: z.boolean(),
});

/**
 * タスク編集フォームのスキーマ
 */
export const TaskEditFormSchema = z.object({
  title: z.string().min(1, { message: "タイトルを入力してください" }),
  date: z.string().min(1, { message: "日付を選択してください" }).refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: "有効な日付を選択してください" },
  ),
  taskItems: z
    .array(TaskItemFormSchema)
    .min(1, { message: "タスクを1つ以上追加してください" }),
});

/**
 * タスク編集フォームの型
 */
export type TaskEditFormData = z.infer<typeof TaskEditFormSchema>;

/**
 * タスクアイテムの型
 */
export type TaskItem = TaskEditFormData["taskItems"][0];

