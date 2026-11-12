ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS price_id text;

CREATE INDEX IF NOT EXISTS stripe_orders_customer_email_idx ON stripe_orders (customer_email);
CREATE INDEX IF NOT EXISTS stripe_orders_price_id_idx ON stripe_orders (price_id);
