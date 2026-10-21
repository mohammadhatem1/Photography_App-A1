-- People who can sign in.
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The gallery items (the data that used to be hardcoded in photos.js).
CREATE TABLE IF NOT EXISTS photos (
  id       SERIAL PRIMARY KEY,
  title    TEXT NOT NULL,
  category TEXT NOT NULL,
  layout   TEXT NOT NULL DEFAULT 'normal' CHECK (layout IN ('normal', 'tall', 'wide')),
  src      TEXT NOT NULL,
  alt      TEXT NOT NULL
);

-- The "session" table is created automatically by connect-pg-simple.