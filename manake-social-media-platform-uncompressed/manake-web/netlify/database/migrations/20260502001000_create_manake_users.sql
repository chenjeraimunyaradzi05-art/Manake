CREATE TABLE IF NOT EXISTS manake_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  avatar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manake_user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES manake_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS manake_users_email_idx
  ON manake_users (email);

CREATE INDEX IF NOT EXISTS manake_user_sessions_user_id_idx
  ON manake_user_sessions (user_id);

CREATE INDEX IF NOT EXISTS manake_user_sessions_expires_at_idx
  ON manake_user_sessions (expires_at);
