-- Drop indexes
DROP INDEX IF EXISTS task_items_task_id_idx;
DROP INDEX IF EXISTS task_items_task_order_idx;
DROP INDEX IF EXISTS tasks_title_idx;
DROP INDEX IF EXISTS tasks_owner_id_idx;
DROP INDEX IF EXISTS accounts_provider_idx;

-- Drop tables in reverse order of creation
DROP TABLE IF EXISTS task_items;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS accounts;

