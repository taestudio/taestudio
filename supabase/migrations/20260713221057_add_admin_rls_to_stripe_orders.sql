CREATE POLICY "select_stripe_orders_admin" ON stripe_orders FOR SELECT
  TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
