/**
 * Database Schema
 * データベース設計書に基づくDrizzle ORMスキーマ定義
 */

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Accounts table
 * ①accounts（ユーザー）
 */
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    thumbnail: text("thumbnail"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("accounts_email_idx").on(table.email),
      providerIdx: uniqueIndex("accounts_provider_idx").on(
        table.provider,
        table.providerAccountId,
      ),
    };
  },
);

/**
 * Tasks table
 * ②Tasks（タスク）
 * 集約ルート
 */
export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => accounts.id),
    title: text("title").notNull(),
    date: date("date").notNull(),
    review: text("review"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      ownerIdx: index("tasks_owner_idx").on(table.ownerId),
      titleIdx: index("tasks_title_idx").on(table.title),
    };
  },
);

/**
 * TaskItems table
 * ③TaskItems（子タスク）
 * 集約メンバー（tasks集約の一部）
 */
export const taskItems = pgTable(
  "task_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    priority: text("priority").notNull(), // High, Medium, Low
    density: text("density").notNull(), // High, Medium, Low
    durationTime: integer("duration_time").notNull(), // 60, 45, 30, 15
    content: text("content").notNull(),
    output: text("output"),
    isRequired: boolean("is_required").notNull().default(false),
    order: integer("order").notNull(),
    status: text("status").notNull(), // NotStarted, InProgress, Completed
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      taskOrderIdx: uniqueIndex("task_items_task_order_idx").on(
        table.taskId,
        table.order,
      ),
      taskIdx: index("task_items_task_idx").on(table.taskId),
      orderCheck: check("order_check", sql`${table.order} >= 0`),
    };
  },
);

/**
 * Relations
 */
export const accountsRelations = relations(accounts, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  owner: one(accounts, {
    fields: [tasks.ownerId],
    references: [accounts.id],
  }),
  taskItems: many(taskItems),
}));

export const taskItemsRelations = relations(taskItems, ({ one }) => ({
  task: one(tasks, {
    fields: [taskItems.taskId],
    references: [tasks.id],
  }),
}));

/**
 * Type exports
 */
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type TaskItem = typeof taskItems.$inferSelect;
export type NewTaskItem = typeof taskItems.$inferInsert;

