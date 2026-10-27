-- People who can sign in.
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The gallery items. Each photo can be ordered as a print at price_cents.
CREATE TABLE IF NOT EXISTS photos (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  layout      TEXT NOT NULL DEFAULT 'normal' CHECK (layout IN ('normal', 'tall', 'wide')),
  src         TEXT NOT NULL,
  alt         TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 2500
);

-- For databases created in Assignment 3, before prints were for sale.
ALTER TABLE photos ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 2500;

-- Which signed-in user favorited which photo (one row per pair).
CREATE TABLE IF NOT EXISTS favorites (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_id   INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, photo_id)
);

-- One row per purchase. Only the Stripe webhook may set status = 'paid'.
CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'expired', 'failed')),
  total_cents       INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at           TIMESTAMPTZ
);

-- What was bought in each order, and the price at the time of purchase.
CREATE TABLE IF NOT EXISTS order_items (
  id               SERIAL PRIMARY KEY,
  order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  photo_id         INTEGER NOT NULL REFERENCES photos(id),
  quantity         INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL
);

-- The "session" table is created automatically by connect-pg-simple.