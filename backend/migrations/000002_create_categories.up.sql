-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES accounts(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX categories_owner_id_name_idx ON categories (owner_id, name);
CREATE INDEX categories_owner_id_idx ON categories (owner_id);
CREATE INDEX categories_name_idx ON categories (name);
