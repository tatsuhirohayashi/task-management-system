-- Create accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    thumbnail TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index on provider and provider_account_id
CREATE UNIQUE INDEX accounts_provider_idx ON accounts (provider, provider_account_id);

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES accounts(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    review TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes on tasks
CREATE INDEX tasks_owner_id_idx ON tasks (owner_id);
CREATE INDEX tasks_title_idx ON tasks (title);

-- Create task_items table
CREATE TABLE task_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    density TEXT NOT NULL CHECK (density IN ('High', 'Medium', 'Low')),
    duration_time INTEGER NOT NULL CHECK (duration_time IN (15, 30, 45, 60)),
    content TEXT NOT NULL,
    output TEXT,
    is_required BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL CHECK ("order" >= 0),
    status TEXT NOT NULL CHECK (status IN ('NotStarted', 'InProgress', 'Completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index on task_id and order
CREATE UNIQUE INDEX task_items_task_order_idx ON task_items (task_id, "order");

-- Create index on task_id
CREATE INDEX task_items_task_id_idx ON task_items (task_id);

