-- ============================================================
-- La Casa Dividida v3 — Run this in Supabase SQL Editor
-- Safe to re-run; all operations use IF NOT EXISTS / OR REPLACE
-- ============================================================

-- 1. Add stat columns to players
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS coins           INTEGER        NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correct_count   INTEGER        NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_contributed DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_streak  INTEGER        NOT NULL DEFAULT 0;

-- 2. Add team-boost columns to game_state
ALTER TABLE game_state
  ADD COLUMN IF NOT EXISTS rev_boost_until  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exil_boost_until TIMESTAMPTZ;

-- 3. update_player_stats — called after every answer
CREATE OR REPLACE FUNCTION update_player_stats(
  p_player_id      UUID,
  p_coins_delta    INTEGER,
  p_correct_delta  INTEGER,
  p_points_delta   DECIMAL,
  p_new_streak     INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE players SET
    coins             = GREATEST(0, coins + p_coins_delta),
    correct_count     = correct_count + p_correct_delta,
    points_contributed = GREATEST(0, points_contributed + p_points_delta),
    current_streak    = p_new_streak
  WHERE id = p_player_id;
END;
$$;

-- 4. spend_coins — individual shop purchases; returns TRUE if successful
CREATE OR REPLACE FUNCTION spend_coins(
  p_player_id UUID,
  p_amount    INTEGER
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coins INTEGER;
BEGIN
  SELECT coins INTO v_coins FROM players WHERE id = p_player_id FOR UPDATE;
  IF v_coins IS NULL OR v_coins < p_amount THEN
    RETURN false;
  END IF;
  UPDATE players SET coins = coins - p_amount WHERE id = p_player_id;
  RETURN true;
END;
$$;

-- 5. activate_team_boost — sets a timed multiplier for an entire faction
CREATE OR REPLACE FUNCTION activate_team_boost(
  p_player_id       UUID,
  p_faction         TEXT,
  p_duration_seconds INTEGER,
  p_cost            INTEGER
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coins INTEGER;
BEGIN
  SELECT coins INTO v_coins FROM players WHERE id = p_player_id FOR UPDATE;
  IF v_coins IS NULL OR v_coins < p_cost THEN
    RETURN false;
  END IF;
  UPDATE players SET coins = coins - p_cost WHERE id = p_player_id;
  IF p_faction = 'revolucionarios' THEN
    UPDATE game_state
      SET rev_boost_until = NOW() + (p_duration_seconds || ' seconds')::interval,
          updated_at = NOW()
    WHERE id = 1;
  ELSE
    UPDATE game_state
      SET exil_boost_until = NOW() + (p_duration_seconds || ' seconds')::interval,
          updated_at = NOW()
    WHERE id = 1;
  END IF;
  RETURN true;
END;
$$;

-- 6. activate_sabotaje — deduct coins and immediately move the rope
CREATE OR REPLACE FUNCTION activate_sabotaje(
  p_player_id  UUID,
  p_faction    TEXT,
  p_cost       INTEGER,
  p_rope_delta DECIMAL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coins INTEGER;
BEGIN
  SELECT coins INTO v_coins FROM players WHERE id = p_player_id FOR UPDATE;
  IF v_coins IS NULL OR v_coins < p_cost THEN
    RETURN false;
  END IF;
  UPDATE players SET coins = coins - p_cost WHERE id = p_player_id;
  UPDATE game_state
    SET rope_position = GREATEST(0, LEAST(100, rope_position + p_rope_delta)),
        updated_at    = NOW()
  WHERE id = 1;
  RETURN true;
END;
$$;

-- 7. Redefine reset_game to also clear boosts (players are deleted already)
CREATE OR REPLACE FUNCTION reset_game()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE game_state
    SET rope_position    = 50.0,
        status           = 'waiting',
        rev_boost_until  = NULL,
        exil_boost_until = NULL,
        updated_at       = NOW()
  WHERE id = 1;
  DELETE FROM players;
END;
$$;
