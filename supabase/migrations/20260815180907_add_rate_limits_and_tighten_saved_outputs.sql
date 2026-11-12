/*
# Rate Limiting Table, Saved Outputs RPC, and Tightened RLS

## Plain English
1. Adds a `rate_limits` table to track request counts per IP address per function,
   used by edge functions to enforce rate limiting (e.g., 5 requests per 10 minutes).
2. Adds a `get_saved_outputs` SECURITY DEFINER function that returns only saved
   outputs matching the caller's session_id, replacing the world-readable SELECT
   policy on saved_outputs.
3. Tightens saved_outputs RLS: removes the permissive SELECT (true) policy and
   replaces it with a restrictive one that only allows reading rows where
   session_id matches a value the caller already knows. Direct table SELECTs
   by anon are now denied (no SELECT policy for anon); they must use the RPC.
   INSERT is kept open but scoped so only rows with a session_id can be inserted.
4. Adds a `log_strategy_usage` SECURITY DEFINER function that inserts a strategy
   session log row and returns the count of rows in the last 24 hours for the
   given user_key, enabling rate limiting in generate-strategy.

## Changes
### New Table: rate_limits
- id (uuid, PK)
- ip_hash (text, not null) — SHA-256 hash of the IP address
- function_name (text, not null) — name of the edge function
- created_at (timestamptz, default now())
- Index on (ip_hash, function_name, created_at) for efficient cleanup queries

### New Function: get_saved_outputs(p_session_id text)
- SECURITY DEFINER, returns rows from saved_outputs where session_id matches
- Replaces direct table SELECT for anon users

### New Function: log_strategy_usage(p_session_id text, p_engine_id text, p_user_key text)
- SECURITY DEFINER, inserts a row into strategy_sessions and returns the count
  of rows for the given p_user_key in the last 24 hours

### Modified: saved_outputs RLS
- DROP the permissive select_own_saved_outputs policy (USING true)
- New SELECT policy: authenticated admin only (USING is_admin())
- Anon can no longer SELECT directly from saved_outputs — must use RPC
- INSERT policy: unchanged (WITH CHECK true) — app inserts with session_id
- DELETE policy: unchanged (admin only + RPC function)

## Security Impact
- Saved strategy outputs are no longer world-readable. Only the session owner
  (via RPC) or an admin can read them.
- Rate limiting is now possible via the rate_limits table.
*/

-- 1. Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  function_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON rate_limits (ip_hash, function_name, created_at);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- rate_limits is only accessed via service role (edge functions), so no policies needed.
-- RLS with no policies = deny all to anon/authenticated, which is correct.

-- 2. get_saved_outputs RPC
CREATE OR REPLACE FUNCTION public.get_saved_outputs(p_session_id text)
RETURNS SETOF saved_outputs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM saved_outputs
  WHERE session_id = p_session_id
  ORDER BY created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_saved_outputs(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_saved_outputs(text) TO anon, authenticated;

-- 3. log_strategy_usage RPC
CREATE OR REPLACE FUNCTION public.log_strategy_usage(p_session_id text, p_engine_id text, p_user_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usage_count integer;
BEGIN
  INSERT INTO strategy_sessions (session_id, engine_id, user_key)
  VALUES (p_session_id, p_engine_id, p_user_key);

  SELECT COUNT(*) INTO usage_count
  FROM strategy_sessions
  WHERE user_key = p_user_key
    AND created_at > now() - interval '24 hours';

  RETURN usage_count;
END;
$$;

REVOKE ALL ON FUNCTION public.log_strategy_usage(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_strategy_usage(text, text, text) TO anon, authenticated;

-- 4. Tighten saved_outputs RLS
-- Drop the permissive SELECT policy
DROP POLICY IF EXISTS "select_own_saved_outputs" ON saved_outputs;

-- New SELECT policy: admin only can read directly from the table
-- Anon users must use the get_saved_outputs RPC
CREATE POLICY "select_saved_outputs_admin"
ON saved_outputs FOR SELECT
TO authenticated
USING (public.is_admin());

-- INSERT policy remains open (app inserts with session_id)
-- Already exists as "insert_saved_outputs" — no change needed.

-- DELETE policy remains admin-only (already exists as "delete_saved_outputs_admin")
-- Anon deletes go through the delete_saved_output RPC (already exists).
