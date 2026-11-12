-- Fix all admin RLS policies to read role from app_metadata (correct JWT path)
-- auth.jwt() ->> 'role' always returns 'authenticated' (the postgres role)
-- The custom admin role lives at auth.jwt() -> 'app_metadata' ->> 'role'

-- leads
DROP POLICY IF EXISTS "select_leads_admin"   ON leads;
DROP POLICY IF EXISTS "update_leads_admin"   ON leads;
DROP POLICY IF EXISTS "delete_leads_admin"   ON leads;

CREATE POLICY "select_leads_admin" ON leads FOR SELECT
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "update_leads_admin" ON leads FOR UPDATE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "delete_leads_admin" ON leads FOR DELETE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- purchases
DROP POLICY IF EXISTS "select_purchases_admin" ON purchases;
DROP POLICY IF EXISTS "update_purchases_admin" ON purchases;
DROP POLICY IF EXISTS "delete_purchases_admin" ON purchases;

CREATE POLICY "select_purchases_admin" ON purchases FOR SELECT
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "update_purchases_admin" ON purchases FOR UPDATE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "delete_purchases_admin" ON purchases FOR DELETE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- applications
DROP POLICY IF EXISTS "select_applications_admin" ON applications;
DROP POLICY IF EXISTS "update_applications_admin" ON applications;
DROP POLICY IF EXISTS "delete_applications_admin" ON applications;

CREATE POLICY "select_applications_admin" ON applications FOR SELECT
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "update_applications_admin" ON applications FOR UPDATE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "delete_applications_admin" ON applications FOR DELETE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- strategy_sessions
DROP POLICY IF EXISTS "select_strategy_sessions_admin" ON strategy_sessions;
DROP POLICY IF EXISTS "update_strategy_sessions_admin" ON strategy_sessions;
DROP POLICY IF EXISTS "delete_strategy_sessions_admin" ON strategy_sessions;

CREATE POLICY "select_strategy_sessions_admin" ON strategy_sessions FOR SELECT
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "update_strategy_sessions_admin" ON strategy_sessions FOR UPDATE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "delete_strategy_sessions_admin" ON strategy_sessions FOR DELETE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- saved_outputs
DROP POLICY IF EXISTS "update_saved_outputs_admin" ON saved_outputs;

CREATE POLICY "update_saved_outputs_admin" ON saved_outputs FOR UPDATE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- contacts
DROP POLICY IF EXISTS "select_contacts_admin" ON contacts;
DROP POLICY IF EXISTS "update_contacts_admin" ON contacts;
DROP POLICY IF EXISTS "delete_contacts_admin" ON contacts;

CREATE POLICY "select_contacts_admin" ON contacts FOR SELECT
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "update_contacts_admin" ON contacts FOR UPDATE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "delete_contacts_admin" ON contacts FOR DELETE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- services
DROP POLICY IF EXISTS "insert_services_admin" ON services;
DROP POLICY IF EXISTS "update_services_admin" ON services;
DROP POLICY IF EXISTS "delete_services_admin" ON services;

CREATE POLICY "insert_services_admin" ON services FOR INSERT
  TO authenticated WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "update_services_admin" ON services FOR UPDATE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "delete_services_admin" ON services FOR DELETE
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
