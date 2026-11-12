/*
# Add SECURITY DEFINER function for saved_outputs ownership checks

## Plain English
The saved_outputs table uses a session_id (pseudo-token) as the ownership key
since the Desk app is a no-auth (anon key) app. This migration adds a SECURITY
DEFINER function that deletes a saved_output row only if the provided session_id
matches the row's session_id. This prevents anyone from deleting rows that don't
belong to their session.

## Changes
- New function: `delete_saved_output(p_row_id uuid, p_session_id text)` — deletes
  a row from saved_outputs only if the row's session_id matches p_session_id.
  Returns true if deleted, false if not found or session_id mismatch.
- REVOKE all on this function from anon/authenticated, GRANT EXECUTE to anon/authenticated.
- Drop the permissive `delete_saved_outputs` policy and replace with a restrictive one.
*/

CREATE OR REPLACE FUNCTION public.delete_saved_output(p_row_id uuid, p_session_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM saved_outputs
  WHERE id = p_row_id
    AND session_id = p_session_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_saved_output(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_saved_output(uuid, text) TO anon, authenticated;

-- Replace the permissive delete policy with a restrictive one
DROP POLICY IF EXISTS "delete_saved_outputs" ON saved_outputs;
DROP POLICY IF EXISTS "delete_saved_outputs_admin" ON saved_outputs;

-- Admin can delete any row
CREATE POLICY "delete_saved_outputs_admin"
ON saved_outputs FOR DELETE
TO authenticated
USING (public.is_admin());

-- Anon cannot delete directly via DELETE; they must use the RPC function.
-- The RPC function (SECURITY DEFINER) handles the ownership check internally.
-- So we don't need a DELETE policy for anon at all — direct DELETEs from anon
-- will be denied by RLS (no matching policy), and the RPC bypasses RLS.
