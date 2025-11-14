CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  roles TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN NOT NULL DEFAULT TRUE,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ
);

INSERT INTO users (name, email, roles, active, password_hash)
VALUES (
  'Administrator',
  'admin@example.com',
  ARRAY['admin'],
  TRUE,
  'd8286b61d971ac773777c2d7053d028f:84af4c609de56e06c17af0b59927780f247e305d4ee5cc9e64b7d15679bf59f2ca14a58038facbd4b9b8d3414af2e9cd99a2ebc853f26e7697e5485053a3f5ff'
)
ON CONFLICT (email) DO NOTHING;
