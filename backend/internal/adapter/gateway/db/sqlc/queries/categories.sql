-- name: ListCategoriesByOwnerID :many
SELECT id, owner_id, name, created_at, updated_at
FROM categories
WHERE owner_id = @owner_id::uuid
ORDER BY name ASC;

-- name: GetCategoryByID :one
SELECT id, owner_id, name, created_at, updated_at
FROM categories
WHERE id = @id::uuid;

-- name: CreateCategory :one
INSERT INTO categories (owner_id, name)
VALUES (@owner_id::uuid, @name::text)
RETURNING id, owner_id, name, created_at, updated_at;

-- name: UpdateCategory :one
UPDATE categories
SET name = @name::text, updated_at = now()
WHERE id = @id::uuid
RETURNING id, owner_id, name, created_at, updated_at;

-- name: DeleteCategory :exec
DELETE FROM categories
WHERE id = @id::uuid;
