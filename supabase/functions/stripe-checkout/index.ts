import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const ALLOWED_ORIGINS = [
  'https://taestudio.ai',
  'https://www.taestudio.ai',
];

// In development, also allow localhost origins
const DEV_ORIGINS = [
  'http://localhost',
  'http://127.0.0.1',
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const origin = parsed.origin;
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    if (DEV_ORIGINS.some(prefix => origin.startsWith(prefix))) return true;
    return false;
  } catch {
    return false;
  }
}

function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { price_id, success_url, cancel_url, product_slug } = await req.json();

    if (!price_id || typeof price_id !== 'string') {
      return corsResponse({ error: 'Missing or invalid price_id' }, 400);
    }
    if (!success_url || typeof success_url !== 'string') {
      return corsResponse({ error: 'Missing or invalid success_url' }, 400);
    }
    if (!cancel_url || typeof cancel_url !== 'string') {
      return corsResponse({ error: 'Missing or invalid cancel_url' }, 400);
    }

    if (!isAllowedUrl(success_url)) {
      return corsResponse({ error: 'Invalid success_url — redirect must match the site domain' }, 400);
    }
    if (!isAllowedUrl(cancel_url)) {
      return corsResponse({ error: 'Invalid cancel_url — redirect must match the site domain' }, 400);
    }

    const metadata: Record<string, string> = {};
    if (product_slug && typeof product_slug === 'string') {
      metadata.product_slug = product_slug;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'payment',
      success_url,
      cancel_url,
      customer_creation: 'always',
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
});
