import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_NOTIFY_EMAIL = Deno.env.get('ADMIN_NOTIFY_EMAIL') ?? 'hello@sitesonpolaris.com';
const FROM_EMAIL = 'Tae Studio <noreply@taestudio.ai>';
const SITE_URL = 'https://taestudio.ai';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400, headers: corsHeaders });
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400, headers: corsHeaders });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (event.type !== 'checkout.session.completed') {
    return;
  }

  const { mode, payment_status, customer } = stripeData as Stripe.Checkout.Session;

  if (mode !== 'payment' || payment_status !== 'paid') {
    return;
  }

  const customerId = customer as string | null;
  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
    return;
  }

  try {
    const {
      id: checkout_session_id,
      payment_intent,
      amount_subtotal,
      amount_total,
      currency,
      customer_details,
      metadata,
    } = stripeData as Stripe.Checkout.Session;

    const customerEmail = customer_details?.email ?? null;
    const productSlug = (metadata as Record<string, string> | null)?.product_slug ?? null;

    let priceId: string | null = null;
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(checkout_session_id, { limit: 1 });
      priceId = lineItems.data[0]?.price?.id ?? null;
    } catch (lineItemErr) {
      console.warn('Could not fetch line items for session:', checkout_session_id, lineItemErr);
    }

    // If metadata didn't include product_slug, infer it from the services table by price ID
    let resolvedSlug = productSlug;
    if (!resolvedSlug && priceId) {
      const { data: serviceByPrice } = await supabase
        .from('services')
        .select('slug')
        .eq('stripe_price_id', priceId)
        .maybeSingle();
      if (serviceByPrice?.slug) {
        resolvedSlug = serviceByPrice.slug;
      }
    }

    const { error: orderError } = await supabase.from('stripe_orders').insert({
      checkout_session_id,
      payment_intent_id: payment_intent,
      customer_id: customerId,
      amount_subtotal,
      amount_total,
      currency,
      payment_status,
      status: 'completed',
      customer_email: customerEmail,
      price_id: priceId,
      product_slug: resolvedSlug,
    });

    if (orderError) {
      console.error('Error inserting order:', orderError);
      return;
    }
    console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);

    // Always send admin notification, regardless of product type
    if (customerEmail) {
      await sendAdminNotification(customerEmail, priceId, resolvedSlug, amount_total ?? 0, currency ?? 'usd');
    }

    // Send buyer confirmation / delivery email
    if (customerEmail) {
      await sendBuyerEmail(customerEmail, priceId, resolvedSlug, amount_total ?? 0, currency ?? 'usd');
    }
  } catch (error) {
    console.error('Error processing one-time payment:', error);
  }
}

async function lookupService(priceId: string | null, productSlug: string | null) {
  // Prefer slug lookup (stable across price ID changes), fall back to price_id
  let query = supabase.from('services').select('slug, name, download_url');
  if (productSlug) {
    query = query.eq('slug', productSlug);
  } else if (priceId) {
    query = query.eq('stripe_price_id', priceId);
  } else {
    return null;
  }
  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error('Error looking up service:', error);
    return null;
  }
  return data;
}

async function sendAdminNotification(
  customerEmail: string,
  priceId: string | null,
  productSlug: string | null,
  amountTotal: number,
  currency: string,
) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured — skipping admin notification');
    return;
  }

  const service = await lookupService(priceId, productSlug);
  const productName = service?.name ?? (productSlug ?? 'Unknown product');
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC';
  const amountDisplay = `${(amountTotal / 100).toFixed(2)}`;

  await sendEmail(
    ADMIN_NOTIFY_EMAIL,
    `New purchase: ${productName}`,
    adminEmailHTML(customerEmail, productName, amountDisplay, timestamp),
  );
}

async function sendBuyerEmail(
  customerEmail: string,
  priceId: string | null,
  productSlug: string | null,
  amountTotal: number,
  currency: string,
) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured — skipping buyer email');
    return;
  }

  const service = await lookupService(priceId, productSlug);
  if (!service) {
    console.info(`No service found for slug=${productSlug} priceId=${priceId} — skipping buyer email`);
    return;
  }

  const productName = service.name as string;

  if (service.download_url) {
    // Digital product with a download file — send download link
    const privatePath = service.download_url as string;
    const [bucketName, ...pathParts] = privatePath.split('/');
    const objectPath = pathParts.join('/');
    const { data: signedUrlData } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(objectPath, 3600);

    const downloadUrl = signedUrlData?.signedUrl ?? '';
    if (!downloadUrl) {
      console.error('Failed to generate signed URL for:', privatePath);
      return;
    }

    await sendEmail(
      customerEmail,
      `Your ${productName} — Tae Studio`,
      buyerEmailHTML(productName, downloadUrl),
    );
  } else {
    // Service / access product (e.g. Strategy Desk) — send confirmation with access link
    await sendEmail(
      customerEmail,
      `You're in — ${productName} — Tae Studio`,
      buyerAccessEmailHTML(productName, service.slug as string),
    );
  }
}

function buyerEmailHTML(productName: string, downloadUrl: string): string {
  return [
    '<!DOCTYPE html>',
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>',
    '<body style="margin:0;padding:0;background-color:#14061F;font-family:Inter,Manrope,system-ui,sans-serif;">',
    '  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#14061F;min-height:100vh;">',
    '    <tr><td align="center" style="padding:48px 24px;">',
    '      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1B0A2A;border-radius:24px;overflow:hidden;border:1px solid rgba(212,169,74,0.15);">',
    '        <tr><td align="center" style="padding:48px 48px 36px;">',
    '          <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#E3BC5E,#C89A3D);display:flex;align-items:center;justify-content:center;margin:0 auto 28px;">',
    '            <span style="font-family:Georgia,serif;font-weight:700;font-size:28px;color:#14061F;">T</span>',
    '          </div>',
    '          <h1 style="font-family:Georgia,serif;font-weight:300;font-size:32px;color:#F5F2F7;margin:0 0 12px;letter-spacing:-0.5px;">You\'re in.</h1>',
    '          <p style="font-size:15px;line-height:1.6;color:#8D7D9F;margin:0 0 8px;max-width:400px;">',
    '            Thank you for purchasing <span style="color:#E3BC5E;">' + escapeHtml(productName) + '</span>.',
    '          </p>',
    '          <p style="font-size:15px;line-height:1.6;color:#8D7D9F;margin:0 0 36px;max-width:400px;">',
    '            Your download is ready. Click below to save your PDF.',
    '          </p>',
    '          <a href="' + escapeHtml(downloadUrl) + '" download style="display:inline-block;background:linear-gradient(135deg,#E3BC5E,#D4A94A,#C89A3D);color:#14061F;font-family:Georgia,serif;font-weight:600;font-size:17px;text-decoration:none;padding:16px 44px;border-radius:14px;letter-spacing:0.3px;">',
    '            Download ' + escapeHtml(productName),
    '          </a>',
    '          <p style="font-size:12px;color:#726581;margin:28px 0 0;line-height:1.5;">',
    '            The link will download the PDF directly to your device.<br/>If you have trouble, copy this link into your browser:',
    '          </p>',
    '          <p style="font-size:11px;color:#726581;margin:8px 0 0;word-break:break-all;max-width:400px;">' + escapeHtml(downloadUrl) + '</p>',
    '        </td></tr>',
    '        <tr><td style="padding:0 48px 40px;">',
    '          <div style="height:1px;background:rgba(212,169,74,0.2);margin-bottom:32px;"></div>',
    '          <p style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:#8D7D9F;margin:0 0 24px;line-height:1.6;">',
    '            "I didn\'t realize how burnt out I was until this slowed me down in the best way. I felt clearer after the first section."',
    '          </p>',
    '          <p style="font-size:12px;color:#726581;margin:0 0 28px;">— Amanda K.</p>',
    '          <a href="https://taestudio.ai/desk" style="display:inline-block;border:1px solid rgba(167,123,255,0.3);color:#A77BFF;font-family:Inter,sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;">',
    '            Open the Soft Strategy Desk',
    '          </a>',
    '        </td></tr>',
    '        <tr><td style="padding:24px 48px 36px;border-top:1px solid rgba(255,255,255,0.04);">',
    '          <p style="font-size:11px;color:#726581;margin:0;line-height:1.5;">',
    '            Tae Studio · You received this email because you purchased ' + escapeHtml(productName) + '.',
    '          </p>',
    '        </td></tr>',
    '      </table>',
    '    </td></tr>',
    '  </table>',
    '</body></html>',
  ].join('\n');
}

function buyerAccessEmailHTML(productName: string, slug: string): string {
  const accessUrl = slug === 'strategy-desk'
    ? `${SITE_URL}/desk`
    : `${SITE_URL}/offers`;

  const ctaText = slug === 'strategy-desk'
    ? 'Open the Soft Strategy Desk'
    : 'Explore your tools';

  return [
    '<!DOCTYPE html>',
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>',
    '<body style="margin:0;padding:0;background-color:#14061F;font-family:Inter,Manrope,system-ui,sans-serif;">',
    '  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#14061F;min-height:100vh;">',
    '    <tr><td align="center" style="padding:48px 24px;">',
    '      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1B0A2A;border-radius:24px;overflow:hidden;border:1px solid rgba(212,169,74,0.15);">',
    '        <tr><td align="center" style="padding:48px 48px 36px;">',
    '          <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#E3BC5E,#C89A3D);display:flex;align-items:center;justify-content:center;margin:0 auto 28px;">',
    '            <span style="font-family:Georgia,serif;font-weight:700;font-size:28px;color:#14061F;">T</span>',
    '          </div>',
    '          <h1 style="font-family:Georgia,serif;font-weight:300;font-size:32px;color:#F5F2F7;margin:0 0 12px;letter-spacing:-0.5px;">You\'re in.</h1>',
    '          <p style="font-size:15px;line-height:1.6;color:#8D7D9F;margin:0 0 8px;max-width:400px;">',
    '            Thank you for purchasing <span style="color:#E3BC5E;">' + escapeHtml(productName) + '</span>.',
    '          </p>',
    '          <p style="font-size:15px;line-height:1.6;color:#8D7D9F;margin:0 0 36px;max-width:400px;">',
    '            Your access is active. Click below to get started.',
    '          </p>',
    '          <a href="' + escapeHtml(accessUrl) + '" style="display:inline-block;background:linear-gradient(135deg,#E3BC5E,#D4A94A,#C89A3D);color:#14061F;font-family:Georgia,serif;font-weight:600;font-size:17px;text-decoration:none;padding:16px 44px;border-radius:14px;letter-spacing:0.3px;">',
    '            ' + escapeHtml(ctaText),
    '          </a>',
    '          <p style="font-size:12px;color:#726581;margin:28px 0 0;line-height:1.5;">',
    '            Use the email you checked out with to restore access on any device.',
    '          </p>',
    '        </td></tr>',
    '        <tr><td style="padding:0 48px 40px;">',
    '          <div style="height:1px;background:rgba(212,169,74,0.2);margin-bottom:32px;"></div>',
    '          <p style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:#8D7D9F;margin:0 0 24px;line-height:1.6;">',
    '            "I didn\'t need more motivation. I needed someone to tell me what to do."',
    '          </p>',
    '        </td></tr>',
    '        <tr><td style="padding:24px 48px 36px;border-top:1px solid rgba(255,255,255,0.04);">',
    '          <p style="font-size:11px;color:#726581;margin:0;line-height:1.5;">',
    '            Tae Studio · You received this email because you purchased ' + escapeHtml(productName) + '.',
    '          </p>',
    '        </td></tr>',
    '      </table>',
    '    </td></tr>',
    '  </table>',
    '</body></html>',
  ].join('\n');
}

function adminEmailHTML(email: string, productName: string, amount: string, timestamp: string): string {
  return [
    '<!DOCTYPE html>',
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>',
    '<body style="margin:0;padding:0;background-color:#14061F;font-family:Inter,Manrope,system-ui,sans-serif;">',
    '  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#14061F;min-height:100vh;">',
    '    <tr><td align="center" style="padding:48px 24px;">',
    '      <table width="520" cellpadding="0" cellspacing="0" style="background-color:#1B0A2A;border-radius:20px;overflow:hidden;border:1px solid rgba(212,169,74,0.15);">',
    '        <tr><td style="padding:36px 40px;">',
    '          <h1 style="font-family:Georgia,serif;font-weight:300;font-size:24px;color:#E3BC5E;margin:0 0 24px;">New Purchase: ' + escapeHtml(productName) + '</h1>',
    '          <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;color:#F5F2F7;">',
    '            <tr><td style="padding:8px 0;color:#726581;width:100px;vertical-align:top;">Email</td><td style="padding:8px 0;color:#F5F2F7;font-weight:600;">' + escapeHtml(email) + '</td></tr>',
    '            <tr><td style="padding:8px 0;color:#726581;vertical-align:top;">Product</td><td style="padding:8px 0;color:#F5F2F7;">' + escapeHtml(productName) + '</td></tr>',
    '            <tr><td style="padding:8px 0;color:#726581;vertical-align:top;">Amount</td><td style="padding:8px 0;color:#F5F2F7;">' + amount + '</td></tr>',
    '            <tr><td style="padding:8px 0;color:#726581;vertical-align:top;">Time</td><td style="padding:8px 0;color:#F5F2F7;">' + timestamp + '</td></tr>',
    '          </table>',
    '        </td></tr>',
    '      </table>',
    '    </td></tr>',
    '  </table>',
    '</body></html>',
  ].join('\n');
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Resend API error (${res.status}) sending to ${to}: ${text}`);
  } else {
    console.info(`Email sent to ${to}: ${subject}`);
  }
}
