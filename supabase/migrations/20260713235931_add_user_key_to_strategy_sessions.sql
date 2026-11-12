/*
# Add user_key to strategy_sessions

## Summary
Adds a nullable `user_key` column to `strategy_sessions` to store the user's
checkout/access key (their Stripe session ID from localStorage). This links
each AI generation row to the user's saved outputs, which are keyed by the
same value in the `saved_outputs` table.

## Changes
1. Modified Tables
   - `strategy_sessions`: adds `user_key TEXT` (nullable) — the user's desk
     access key, identical to the `session_id` stored in `saved_outputs`.

## Notes
- Nullable because existing rows predate this column and have no value.
- No RLS changes needed — existing policies already cover the table.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'strategy_sessions' AND column_name = 'user_key'
  ) THEN
    ALTER TABLE strategy_sessions ADD COLUMN user_key TEXT;
    CREATE INDEX idx_strategy_sessions_user_key ON strategy_sessions(user_key);
  END IF;
END $$;
