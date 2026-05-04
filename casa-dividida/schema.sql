-- ============================================================
-- La Casa Dividida: Cabo de Guerra — Supabase Schema
-- Paste this entire file into your Supabase SQL Editor and run it.
-- ============================================================

-- 1. Create the global game state table
CREATE TABLE IF NOT EXISTS game_state (
  id          INTEGER PRIMARY KEY DEFAULT 1,
  rope_position DECIMAL(6, 2) NOT NULL DEFAULT 50.0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Seed the single row (only one row ever exists)
INSERT INTO game_state (id, rope_position)
VALUES (1, 50.0)
ON CONFLICT (id) DO NOTHING;

-- 3. Atomic update function — prevents race conditions when 30 students click at once
CREATE OR REPLACE FUNCTION update_rope_position(delta DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_pos DECIMAL;
BEGIN
  UPDATE game_state
  SET
    rope_position = GREATEST(0, LEAST(100, rope_position + delta)),
    updated_at    = NOW()
  WHERE id = 1
  RETURNING rope_position INTO new_pos;

  RETURN new_pos;
END;
$$;

-- 4. Row Level Security — allow all anonymous users to read and call the RPC
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_select" ON game_state
  FOR SELECT USING (true);

-- The UPDATE policy is only needed if you skip the RPC approach;
-- the RPC runs as SECURITY DEFINER so it bypasses RLS.
-- Add it anyway as a fallback:
CREATE POLICY "allow_public_update" ON game_state
  FOR UPDATE USING (true);

-- 5. Reset helper — run this in the SQL editor to restart the game mid-class
-- UPDATE game_state SET rope_position = 50.0 WHERE id = 1;
