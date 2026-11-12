import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_NOTIFY_EMAIL =
  Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "hello@sitesonpolaris.com";
const FROM_EMAIL = "Tae Studio <noreply@taestudio.ai>";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rateSupabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

async function checkRateLimit(ip: string, functionName: string): Promise<boolean> {
  const ipHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip)).then((buf) => {
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  });

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count, error } = await rateSupabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("function_name", functionName)
    .gte("created_at", windowStart);

  if (error) {
    console.error("Rate limit check error:", error);
    return true;
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return false;
  }

  await rateSupabase.from("rate_limits").insert({ ip_hash: ipHash, function_name: functionName });
  return true;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function senderEmailHTML(name: string): string {
  const firstName = escapeHtml(name.split(" ")[0] || name);
  return [
    '<!DOCTYPE html>',
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>',
    '<body style="margin:0;padding:0;background-color:#14061F;font-family:Inter,Manrope,system-ui,sans-serif;">',
    '  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#14061F;min-height:100vh;">',
    '    <tr><td align="center" style="padding:48px 24px;">',
    '      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1B0A2A;border-radius:24px;overflow:hidden;border:1px solid rgba(212,169,74,0.15);">',
    '        <tr><td align="center" style="padding:48px 48px 36px;">',
    '          <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#E3BC5E,#C89A3D);display:flex;align-items:center;justify-content:center;margin:0 auto 28px;">',
    '            <span style="font-family:Cormorant Garamond,Playfair Display,Georgia,serif;font-weight:700;font-size:28px;color:#14061F;">T</span>',
    '          </div>',
    '          <h1 style="font-family:Cormorant Garamond,Playfair Display,Georgia,serif;font-weight:300;font-size:32px;color:#F5F2F7;margin:0 0 12px;letter-spacing:-0.5px;">Message received.</h1>',
    '          <p style="font-size:15px;line-height:1.6;color:#8D7D9F;margin:0 0 36px;max-width:420px;">',
    '            Thank you, ' + firstName + '. Your message has landed safely. We\'ll read it carefully and respond within <span style="color:#E3BC5E;">3 business days</span>.',
    '          </p>',
    '          <a href="https://taestudio.ai/desk" style="display:inline-block;border:1px solid rgba(167,123,255,0.3);color:#A77BFF;font-family:Inter,sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;">',
    '            Open the Soft Strategy Desk',
    '          </a>',
    '        </td></tr>',
    '        <tr><td style="padding:0 48px 40px;">',
    '          <div style="height:1px;background:rgba(212,169,74,0.2);margin-bottom:32px;"></div>',
    '          <p style="font-family:Cormorant Garamond,Georgia,serif;font-style:italic;font-size:15px;color:#8D7D9F;margin:0 0 24px;line-height:1.6;">',
    '            "Healing is the strategy. Alignment is the ROI."',
    '          </p>',
    '          <p style="font-size:12px;color:#726581;margin:0;">— Tae Studio</p>',
    '        </td></tr>',
    '        <tr><td style="padding:24px 48px 36px;border-top:1px solid rgba(255,255,255,0.04);">',
    '          <p style="font-size:11px;color:#726581;margin:0;line-height:1.5;">',
    '            Tae Studio · You received this email because you sent a message through the contact form.',
    '          </p>',
    '        </td></tr>',
    '      </table>',
    '    </td></tr>',
    '  </table>',
    '</body></html>',
  ].join('\n');
}

function adminNotifyHTML(name: string, email: string, message: string, timestamp: string): string {
  return [
    '<!DOCTYPE html>',
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>',
    '<body style="margin:0;padding:0;background-color:#14061F;font-family:Inter,Manrope,system-ui,sans-serif;">',
    '  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#14061F;min-height:100vh;">',
    '    <tr><td align="center" style="padding:48px 24px;">',
    '      <table width="520" cellpadding="0" cellspacing="0" style="background-color:#1B0A2A;border-radius:20px;overflow:hidden;border:1px solid rgba(212,169,74,0.15);">',
    '        <tr><td style="padding:36px 40px;">',
    '          <h1 style="font-family:Cormorant Garamond,Georgia,serif;font-weight:300;font-size:24px;color:#E3BC5E;margin:0 0 24px;">New Contact Form Message</h1>',
    '          <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;color:#F5F2F7;">',
    '            <tr><td style="padding:8px 0;color:#726581;width:100px;vertical-align:top;">Name</td><td style="padding:8px 0;color:#F5F2F7;font-weight:600;">' + escapeHtml(name) + '</td></tr>',
    '            <tr><td style="padding:8px 0;color:#726581;vertical-align:top;">Email</td><td style="padding:8px 0;color:#F5F2F7;font-weight:600;">' + escapeHtml(email) + '</td></tr>',
    '            <tr><td style="padding:8px 0;color:#726581;vertical-align:top;">Submitted</td><td style="padding:8px 0;color:#F5F2F7;">' + timestamp + '</td></tr>',
    '            <tr><td style="padding:8px 0;color:#726581;vertical-align:top;">Source</td><td style="padding:8px 0;color:#F5F2F7;">contact-form</td></tr>',
    '          </table>',
    '          <div style="height:1px;background:rgba(212,169,74,0.15);margin:24px 0;"></div>',
    '          <p style="font-size:12px;color:#726581;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">Message</p>',
    '          <p style="font-size:14px;color:#F5F2F7;line-height:1.6;margin:0;white-space:pre-wrap;">' + escapeHtml(message) + '</p>',
    '        </td></tr>',
    '      </table>',
    '    </td></tr>',
    '  </table>',
    '</body></html>',
  ].join('\n');
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Resend API error (${res.status}) sending to ${to}: ${text}`);
    return false;
  }
  console.info(`Email sent to ${to}: ${subject}`);
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const ip = getClientIp(req);
    const allowed = await checkRateLimit(ip, "send-contact");
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { name, email, message } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return new Response(
        JSON.stringify({ error: "Name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Valid email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!message || typeof message !== "string" || message.trim().length <= 10) {
      return new Response(
        JSON.stringify({ error: "Message must be longer than 10 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { error: insertError } = await supabase
      .from("contacts")
      .insert({ name: name.trim(), email: email.trim(), message: message.trim() });

    if (insertError) {
      console.error("Contact insert error:", insertError);
    }

    const timestamp = new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " UTC";

    if (RESEND_API_KEY) {
      await Promise.all([
        sendEmail(
          email.trim(),
          "Your message to Tae Studio — received",
          senderEmailHTML(name.trim()),
        ),
        sendEmail(
          ADMIN_NOTIFY_EMAIL,
          "New contact form message",
          adminNotifyHTML(name.trim(), email.trim(), message.trim(), timestamp),
        ),
      ]);
    } else {
      console.warn("RESEND_API_KEY not configured — skipping email delivery");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
