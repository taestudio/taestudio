/*
# Remove Unused Subscription Infrastructure

This app only sells one-time products — no subscriptions are used or planned.
The subscription tables and views from the original Stripe integration template
are dead weight: they're never queried by the frontend or edge functions, and
they add unnecessary attack surface (RLS policies, a security_invoker view).

## What's removed
1. `stripe_user_subscriptions` — view joining stripe_customers + stripe_subscriptions (never queried)
2. `stripe_user_orders` — view joining stripe_customers + stripe_orders (never queried; admin reads stripe_orders directly)
3. `stripe_subscriptions` — table for subscription tracking (only written to by dead code in edge functions)
4. `stripe_customers` — table mapping Supabase users to Stripe customer IDs (only used by the now-removed subscription flow)
5. `stripe_subscription_status` — enum type used only by stripe_subscriptions
6. RLS policy "Users can view their own order data" on stripe_orders — its predicate references stripe_customers, which no longer exists. The admin SELECT policy remains.

## What's kept
- `stripe_orders` table — still used by the webhook to record one-time payments and by the admin dashboard
- `stripe_order_status` enum — still used by stripe_orders
- Admin SELECT policy on stripe_orders — still used by the admin dashboard

## Safety
- No user data is lost: these tables had zero rows (subscription flow was never exercised)
- stripe_orders data is fully preserved
*/

-- Drop the orphaned user-scoped SELECT policy on stripe_orders (references stripe_customers)
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

-- Drop views first (depend on stripe_customers / stripe_subscriptions)
DROP VIEW IF EXISTS stripe_user_subscriptions;
DROP VIEW IF EXISTS stripe_user_orders;

-- Drop subscription table
DROP TABLE IF EXISTS stripe_subscriptions;

-- Drop customers table
DROP TABLE IF EXISTS stripe_customers;

-- Drop the subscription status enum type (only used by stripe_subscriptions)
DROP TYPE IF EXISTS stripe_subscription_status;
