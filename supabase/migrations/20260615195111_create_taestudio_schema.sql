-- Leads table: email captures from free guide, email gate, newsletter
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'unknown',
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_leads_admin" ON leads FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "update_leads_admin" ON leads FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "delete_leads_admin" ON leads FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_purchases" ON purchases FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_purchases_admin" ON purchases FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "update_purchases_admin" ON purchases FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "delete_purchases_admin" ON purchases FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Applications table: Start Your AI Twin inquiries
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_stage TEXT NOT NULL DEFAULT '',
  goals TEXT NOT NULL DEFAULT '',
  challenges TEXT NOT NULL DEFAULT '',
  budget_range TEXT NOT NULL DEFAULT '',
  referral_source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_applications" ON applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_applications_admin" ON applications FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "update_applications_admin" ON applications FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "delete_applications_admin" ON applications FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Strategy sessions: usage tracking per session
CREATE TABLE strategy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  engine_id TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE strategy_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_strategy_sessions" ON strategy_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_strategy_sessions_admin" ON strategy_sessions FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "update_strategy_sessions_admin" ON strategy_sessions FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "delete_strategy_sessions_admin" ON strategy_sessions FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Saved outputs: persisted strategy outputs keyed by session
CREATE TABLE saved_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  engine_id TEXT NOT NULL,
  content TEXT NOT NULL,
  preview TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE saved_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_saved_outputs" ON saved_outputs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_saved_outputs" ON saved_outputs FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "delete_saved_outputs" ON saved_outputs FOR DELETE
  TO anon, authenticated USING (true);

CREATE POLICY "update_saved_outputs_admin" ON saved_outputs FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Contacts: general contact form submissions
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_contacts" ON contacts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_contacts_admin" ON contacts FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "update_contacts_admin" ON contacts FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "delete_contacts_admin" ON contacts FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Index for fast session lookups
CREATE INDEX idx_saved_outputs_session ON saved_outputs(session_id);
CREATE INDEX idx_strategy_sessions_session ON strategy_sessions(session_id);
CREATE INDEX idx_leads_email ON leads(email);
