-- name: ListTasks :many
SELECT 
    t.id,
    t.owner_id,
    t.title,
    t.date,
    t.review,
    t.created_at,
    t.updated_at
FROM tasks t
WHERE 
    (@owner_id::uuid IS NULL OR t.owner_id = @owner_id::uuid)
    AND (@year_month::text IS NULL OR (
        t.date >= DATE_TRUNC('month', (@year_month::text || '-01')::date)::date
        AND t.date < (DATE_TRUNC('month', (@year_month::text || '-01')::date) + INTERVAL '1 month')::date
    ))
    AND (@keyword::text IS NULL OR t.title ILIKE '%' || @keyword::text || '%' OR EXISTS (
        SELECT 1 FROM task_items ti
        WHERE ti.task_id = t.id
        AND ti.content ILIKE '%' || @keyword::text || '%'
    ))
ORDER BY 
    CASE 
        WHEN @sort::text = 'newest' THEN t.created_at
    END DESC NULLS LAST,
    CASE 
        WHEN @sort::text = 'oldest' THEN t.created_at
    END ASC NULLS LAST,
    CASE 
        WHEN @sort::text = 'date-asc' THEN t.date
    END ASC NULLS LAST,
    CASE 
        WHEN @sort::text = 'date-desc' THEN t.date
    END DESC NULLS LAST,
    t.created_at DESC;

-- name: GetTaskItemsByTaskIDs :many
SELECT 
    id,
    task_id,
    priority,
    density,
    duration_time,
    content,
    output,
    is_required,
    "order",
    status,
    created_at,
    updated_at
FROM task_items
WHERE task_id = ANY($1::uuid[])
ORDER BY task_id, "order" ASC;

-- name: GetTaskByID :one
SELECT 
    t.id,
    t.owner_id,
    t.title,
    t.date,
    t.review,
    t.created_at,
    t.updated_at
FROM tasks t
WHERE t.id = @task_id::uuid;

-- name: GetAccountsByIDs :many
SELECT 
    id,
    email,
    first_name,
    last_name,
    thumbnail
FROM accounts
WHERE id = ANY($1::uuid[]);

-- name: GetAccountByID :one
SELECT 
    id,
    email,
    first_name,
    last_name,
    thumbnail,
    last_login_at,
    created_at,
    updated_at
FROM accounts
WHERE id = @account_id::uuid;

-- name: GetAccountByEmail :one
SELECT 
    id,
    email,
    first_name,
    last_name,
    thumbnail,
    last_login_at,
    created_at,
    updated_at
FROM accounts
WHERE email = @email::text;

-- name: CreateAccount :one
INSERT INTO accounts (
    id,
    email,
    first_name,
    last_name,
    is_active,
    provider,
    provider_account_id,
    thumbnail,
    last_login_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    @email::text,
    @first_name::text,
    @last_name::text,
    true,
    @provider::text,
    @provider_account_id::text,
    @thumbnail::text,
    NOW(),
    NOW(),
    NOW()
)
RETURNING id, email, first_name, last_name, thumbnail, last_login_at, created_at, updated_at;

-- name: CreateTask :one
INSERT INTO tasks (
    id,
    owner_id,
    title,
    date,
    review,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    @owner_id::uuid,
    @title::text,
    @date::date,
    NULL,
    NOW(),
    NOW()
)
RETURNING id, owner_id, title, date, review, created_at, updated_at;

-- name: CreateTaskItem :one
INSERT INTO task_items (
    id,
    task_id,
    priority,
    density,
    duration_time,
    content,
    output,
    is_required,
    "order",
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    @task_id::uuid,
    @priority::text,
    @density::text,
    @duration_time::int4,
    @content::text,
    NULL,
    @is_required::boolean,
    @order_value::int4,
    @status::text,
    NOW(),
    NOW()
)
RETURNING id, task_id, priority, density, duration_time, content, output, is_required, "order", status, created_at, updated_at;

-- name: UpdateTask :one
UPDATE tasks
SET
    title = @title::text,
    date = @date::date,
    updated_at = NOW()
WHERE id = @task_id::uuid
RETURNING id, owner_id, title, date, review, created_at, updated_at;

-- name: UpdateTaskItem :one
UPDATE task_items
SET
    priority = @priority::text,
    density = @density::text,
    duration_time = @duration_time::int4,
    content = @content::text,
    is_required = @is_required::boolean,
    "order" = @order_value::int4,
    status = @status::text,
    updated_at = NOW()
WHERE id = @task_item_id::uuid
RETURNING id, task_id, priority, density, duration_time, content, output, is_required, "order", status, created_at, updated_at;

-- name: DeleteTaskItemsByTaskID :exec
DELETE FROM task_items
WHERE task_id = @task_id::uuid;

-- name: DeleteTask :exec
DELETE FROM tasks
WHERE id = @task_id::uuid;

-- name: GetTaskByTaskItemID :one
SELECT 
    t.id,
    t.owner_id,
    t.title,
    t.date,
    t.review,
    t.created_at,
    t.updated_at
FROM tasks t
INNER JOIN task_items ti ON ti.task_id = t.id
WHERE ti.id = @task_item_id::uuid;

-- name: UpdateTaskItemOutput :one
UPDATE task_items
SET
    output = @output::text,
    status = 'Completed',
    updated_at = NOW()
WHERE id = @task_item_id::uuid
RETURNING id, task_id, priority, density, duration_time, content, output, is_required, "order", status, created_at, updated_at;

-- name: UpdateTaskReview :one
UPDATE tasks
SET
    review = NULLIF(@review::text, ''),
    updated_at = NOW()
WHERE id = @task_id::uuid
RETURNING id, owner_id, title, date, review, created_at, updated_at;

