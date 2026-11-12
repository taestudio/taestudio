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
    const { email, slug, recaptcha_token } = await req.json();

    const recaptcha = await verifyRecaptcha(recaptcha_token, 'recover-download');
    if (!recaptcha.ok) return recaptchaErrorResponse();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const productSlug = slug && typeof slug === 'string' ? slug : 'soft-boundaries';
    const normalizedEmail = email.trim().toLowerCase();

    const { data: service } = await supabase
      .from('services')
      .select('stripe_price_id, download_url, name')
      .eq('slug', productSlug)
      .maybeSingle();

    if (!service?.stripe_price_id) {
      return new Response(JSON.stringify({ found: false }), {
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
      .or(`product_slug.eq.${productSlug},price_id.eq.${service.stripe_price_id}`)
      .limit(1);

    if (queryError) {
      console.error('recover-download query error:', queryError);
      return new Response(JSON.stringify({ found: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const found = (orders?.length ?? 0) > 0;

    let downloadUrl: string | null = null;
    if (found && service.download_url) {
      const [bucketName, ...pathParts] = (service.download_url as string).split('/');
      const objectPath = pathParts.join('/');
      const { data: signedUrlData } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(objectPath, 3600);
      downloadUrl = signedUrlData?.signedUrl ?? null;
    }

    return new Response(
      JSON.stringify({
        found,
        download_url: downloadUrl,
        product_name: found ? service.name : null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err: any) {
    console.error('recover-download error:', err);
    return new Response(JSON.stringify({ found: false }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
