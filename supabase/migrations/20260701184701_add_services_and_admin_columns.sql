/*
# Services Table + Admin Enhancements

## Summary
Adds a `services` table for dynamic management of all products/services displayed on
the site. Admins can create, edit, and delete services from the admin dashboard, and
all public pages (Offers, Home hub, ecosystem ladder) read from this table in real time.
Also adds workflow helper columns to existing tables.

## 1. New Tables

### `services`
Stores every product and service offered by Tae Studio.
- `id` — UUID primary key, auto-generated
- `slug` — unique URL-safe identifier (e.g. "strategy-desk", "alignment-guide")
- `name` — full display name shown in the UI
- `tagline` — short subtitle / hook line
- `description` — full paragraph description
- `price_display` — formatted price string shown in the UI (e.g. "$47", "Free", "From $888")
- `price_dollars` — integer dollar amount for math/sorting (0 = free)
- `badge_text` — short text on the product badge pill
- `accent_color` — UI color theme identifier: 'gold' or 'lavender'
- `cta_href` — primary action button link (buy / apply / access)
- `page_href` — internal detail page route (e.g. "/soft-strategy-desk")
- `image_url` — hero photo URL
- `icon` — emoji or short icon character for card display
- `features` — text array of bullet-point features/inclusions
- `sort_order` — integer controlling display order (ascending)
- `is_active` — controls public visibility
- `is_featured` — marks as highlighted / featured on the site
- `created_at`, `updated_at` — audit timestamps

## 2. Modified Tables

### `applications`
- Added `notes` (text, nullable) — admin internal notes for workflow tracking

### `contacts`
- Added `admin_status` (text, default 'unread') — tracks contact thread state:
  values are 'unread', 'read', 'replied'

## 3. Security
- `services` SELECT is open to anon + authenticated so public pages can read it
- `services` INSERT / UPDATE / DELETE restricted to authenticated users with
  jwt role = 'admin' (matches the existing pattern on all other admin-only tables)
- `applications` and `contacts` inherit their existing table RLS policies;
  new columns follow the same access rules automatically

## 4. Seed Data
Pre-populates the 5 existing services so the site works immediately after migration.
Uses ON CONFLICT DO NOTHING so re-running is safe.
*/

-- ─── services table ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS services (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        NOT NULL UNIQUE,
  name         TEXT        NOT NULL,
  tagline      TEXT        NOT NULL DEFAULT '',
  description  TEXT        NOT NULL DEFAULT '',
  price_display TEXT       NOT NULL DEFAULT 'Free',
  price_dollars INTEGER    NOT NULL DEFAULT 0,
  badge_text   TEXT        NOT NULL DEFAULT '',
  accent_color TEXT        NOT NULL DEFAULT 'gold',
  cta_href     TEXT        NOT NULL DEFAULT '',
  page_href    TEXT        NOT NULL DEFAULT '',
  image_url    TEXT        NOT NULL DEFAULT '',
  icon         TEXT        NOT NULL DEFAULT '',
  features     TEXT[]      NOT NULL DEFAULT '{}',
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  is_featured  BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_services_public" ON services;
CREATE POLICY "select_services_public" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_services_admin" ON services;
CREATE POLICY "insert_services_admin" ON services FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "update_services_admin" ON services;
CREATE POLICY "update_services_admin" ON services FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "delete_services_admin" ON services;
CREATE POLICY "delete_services_admin" ON services FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- ─── indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_services_slug   ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_sort   ON services(sort_order, is_active);

-- ─── applications: add notes column ──────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'notes'
  ) THEN
    ALTER TABLE applications ADD COLUMN notes TEXT;
  END IF;
END $$;

-- ─── contacts: add admin_status column ────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'admin_status'
  ) THEN
    ALTER TABLE contacts ADD COLUMN admin_status TEXT NOT NULL DEFAULT 'unread';
  END IF;
END $$;

-- ─── seed existing services ───────────────────────────────────────────────────

INSERT INTO services
  (slug, name, tagline, description, price_display, price_dollars,
   badge_text, accent_color, cta_href, page_href, image_url, icon,
   features, sort_order, is_active, is_featured)
VALUES
(
  'alignment-guide',
  'FREE Alignment Guide',
  'Stop creating from chaos',
  'Stop creating from chaos. This free guide helps you realign your brand, energy, and content strategy before you spend another minute posting, planning, or pitching from the wrong foundation.',
  'Free', 0, 'Free', 'gold',
  '/alignment-guide', '/alignment-guide',
  'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Free%20Alignment.jpg',
  '✦',
  ARRAY['Identify your current misalignment', 'Reconnect with your core offer and voice', 'A simple 3-day reset exercise', 'Entry point into the full Soft System™'],
  1, true, false
),
(
  'soft-boundaries',
  'Soft Boundaries Script Pack',
  'Exact words for every boundary moment',
  'Copy/paste scripts for real-life boundary moments — family, work, friends, and dating. No over-explaining. No freezing. Just the words.',
  '$9', 9, '$9', 'lavender',
  'https://stan.store/taeadams/p/soft-boundaries--starter-pack', '/soft-boundaries',
  'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Soft%20boundaries.jpg',
  '📋',
  ARRAY['Scripts for workplace boundaries', 'Scripts for personal relationships', 'Scripts for client situations', 'Copy/paste ready — no customization needed'],
  2, true, false
),
(
  'soft-power-reset',
  'The Soft Power Reset',
  'A guided workbook for ambitious women',
  'A gentle workbook to realign your energy, heal your hustle, and still get things done — softly. Reflect, reset, and restructure at your own pace.',
  '$11.99', 12, 'eBook', 'lavender',
  'https://stan.store/taeadams/p/the-soft-power-reset-ebook', '/soft-power-reset',
  'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Soft%20power%20reset.jpg',
  '📖',
  ARRAY['Guided reflection exercises', 'Realign your energy and clarity', 'Heal the hustle without losing momentum', 'Work at your own pace'],
  3, true, false
),
(
  'ai-twin',
  'Start Your AI Twin',
  'Your voice. Always on.',
  'Your voice, your expertise, your presence — distilled into an AI that represents you accurately, consistently, and on-brand. A custom AI built around your tone, offers, and business systems — working while you rest.',
  'From $888', 888, 'Service', 'lavender',
  '/contact', '/ai-twin',
  'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/AI%20Twin.jpg',
  '🤖',
  ARRAY['Discovery call to map your voice and use cases', 'Custom AI built on your content and tone', 'Integrated into your website or workflow', '30 days of refinement support'],
  4, true, true
),
(
  'strategy-desk',
  'Soft Strategy Desk™',
  'AI-powered clarity in minutes',
  'An AI-powered clarity tool that turns your real situation into exact scripts, aligned decisions, and executable plans — in minutes. Four engines. Unlimited sessions.',
  '$47', 47, '$47', 'gold',
  '/desk', '/soft-strategy-desk',
  'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Soft%20desk.jpg',
  '🧭',
  ARRAY['Four specialized AI engines', 'Corporate Survival — scripts and exit strategies', 'Content-to-Cash — hooks, captions, and offers', 'Decision Clarity — one honest recommendation', 'Soft Business Builder — 90-day plan', 'Unlimited sessions · Instant access'],
  5, true, true
)
ON CONFLICT (slug) DO NOTHING;
