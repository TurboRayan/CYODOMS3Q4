-- ============================================================
-- La Casa Dividida v2 — Run this in Supabase SQL Editor
-- Safe to run even if you already ran schema.sql
-- ============================================================

-- 1. Add status column to game_state (ignored if already exists)
ALTER TABLE game_state ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'waiting';

-- Make sure the seed row has the column value
UPDATE game_state SET status = 'waiting' WHERE id = 1;

-- 2. Players table
CREATE TABLE IF NOT EXISTS players (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  faction    TEXT NOT NULL CHECK (faction IN ('revolucionarios', 'exiliados')),
  session_id TEXT NOT NULL,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies so re-running is safe
DROP POLICY IF EXISTS "players_select" ON players;
DROP POLICY IF EXISTS "players_insert" ON players;
DROP POLICY IF EXISTS "players_delete" ON players;

CREATE POLICY "players_select" ON players FOR SELECT USING (true);
CREATE POLICY "players_insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_delete" ON players FOR DELETE USING (true);

-- 3. start_game RPC
CREATE OR REPLACE FUNCTION start_game()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE game_state SET status = 'playing', updated_at = NOW() WHERE id = 1;
END;
$$;

-- 4. reset_game RPC — resets rope, status, and clears all players
CREATE OR REPLACE FUNCTION reset_game()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE game_state
    SET rope_position = 50.0, status = 'waiting', updated_at = NOW()
  WHERE id = 1;
  DELETE FROM players;
END;
$$;

-- 5. Add both tables to the realtime publication
-- (game_state was already added in schema.sql; this adds players)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE players;
  END IF;
END$$;
