import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { verifyRecaptcha, recaptchaErrorResponse } from './recaptcha.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, checkout_session_id, recaptcha_token } = await req.json();

    // Only verify captcha for email-based restore (the attack surface); the
    // post-checkout session-id mode can't be spammed meaningfully.
    if (!checkout_session_id) {
      const recaptcha = await verifyRecaptcha(recaptcha_token, 'verify-desk-access');
      if (!recaptcha.ok) return recaptchaErrorResponse();
    }

    // Mode 1: verify by checkout session ID (used after Stripe checkout redirect)
    if (checkout_session_id && typeof checkout_session_id === 'string') {
      const { data: service } = await supabase
        .from('services')
        .select('stripe_price_id')
        .eq('slug', 'strategy-desk')
        .maybeSingle();

      if (!service?.stripe_price_id) {
        return new Response(JSON.stringify({ hasAccess: false }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Single query: match by product_slug OR price_id in one shot
      const { data: orders, error: queryError } = await supabase
        .from('stripe_orders')
        .select('id, checkout_session_id')
        .eq('checkout_session_id', checkout_session_id)
        .eq('status', 'completed')
        .is('deleted_at', null)
        .or(`product_slug.eq.strategy-desk,price_id.eq.${service.stripe_price_id}`)
        .limit(1);

      if (queryError) {
        console.error('verify-desk-access query error (session mode):', queryError);
        return new Response(JSON.stringify({ hasAccess: false }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const hasAccess = (orders?.length ?? 0) > 0;
      return new Response(JSON.stringify({ hasAccess, checkoutSessionId: checkout_session_id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mode 2: verify by email (used for restore access)
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email or checkout_session_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: service } = await supabase
      .from('services')
      .select('stripe_price_id')
      .eq('slug', 'strategy-desk')
      .maybeSingle();

    if (!service?.stripe_price_id) {
      return new Response(JSON.stringify({ hasAccess: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Single query: match by product_slug OR price_id in one shot
    const { data: orders, error: queryError } = await supabase
      .from('stripe_orders')
      .select('id, checkout_session_id')
      .eq('customer_email', normalizedEmail)
      .eq('status', 'completed')
      .is('deleted_at', null)
      .or(`product_slug.eq.strategy-desk,price_id.eq.${service.stripe_price_id}`)
      .limit(1);

    if (queryError) {
      console.error('verify-desk-access query error (email mode):', queryError);
      return new Response(JSON.stringify({ hasAccess: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hasAccess = (orders?.length ?? 0) > 0;
    const checkoutSessionId = orders?.[0]?.checkout_session_id ?? null;

    return new Response(JSON.stringify({ hasAccess, checkoutSessionId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('verify-desk-access error:', err);
    return new Response(JSON.stringify({ hasAccess: false }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
