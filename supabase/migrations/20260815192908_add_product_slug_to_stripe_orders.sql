/*
# Add product_slug to stripe_orders for price-ID-independent matching

## Why
When a Stripe price ID changes (e.g. a new price is created and the old one archived),
past buyers' orders still reference the old price_id. This breaks download recovery
and desk access verification, which look up orders by price_id matched against the
current services table.

Adding a `product_slug` column to stripe_orders lets us match orders to products by
a stable identifier (the slug) that doesn't change when prices are updated.

## Changes
1. New column: `stripe_orders.product_slug` (text, nullable for backward compatibility).
2. Backfill: set product_slug on existing orders by mapping their price_id to the
   service that currently owns that price_id. Orders whose price_id no longer matches
   any service will have product_slug = null (they'll still match by price_id as before).
3. Index on (product_slug, customer_email) for faster recovery lookups.

## Security
No RLS changes — the column is covered by existing stripe_orders policies.
*/

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS product_slug text;

-- Backfill existing orders by joining to services on price_id
UPDATE stripe_orders
  SET product_slug = sub.slug
  FROM (
    SELECT s.slug, s.stripe_price_id
    FROM services s
    WHERE s.stripe_price_id IS NOT NULL
  ) sub
  WHERE stripe_orders.price_id = sub.stripe_price_id
    AND stripe_orders.product_slug IS NULL;

CREATE INDEX IF NOT EXISTS idx_stripe_orders_product_slug_email
  ON stripe_orders (product_slug, customer_email);
