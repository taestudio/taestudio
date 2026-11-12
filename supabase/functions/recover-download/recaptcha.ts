const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY") ?? "";
const RECAPTCHA_MIN_SCORE = 0.5;

export type VerifyResult = { ok: boolean; skipped: boolean };

// Verifies a reCAPTCHA v3 token with Google. Token absent (visitor declined
// consent) -> skipped, request proceeds under rate limits alone. Token present
// but invalid or low-score -> ok=false. Google unreachable -> fail open.
export async function verifyRecaptcha(
  token: unknown,
  functionName: string,
): Promise<VerifyResult> {
  if (!RECAPTCHA_SECRET_KEY) return { ok: true, skipped: true };
  if (typeof token !== "string" || !token) return { ok: false, skipped: false };

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET_KEY, response: token }).toString(),
    });
    const data = await res.json();
    if (!data.success) {
      console.warn(`reCAPTCHA verify failed on ${functionName}: ${JSON.stringify(data)}`);
      return { ok: false, skipped: false };
    }
    if (typeof data.score === "number" && data.score < RECAPTCHA_MIN_SCORE) {
      console.warn(`reCAPTCHA low score (${data.score}) on ${functionName}`);
      return { ok: false, skipped: false };
    }
    return { ok: true, skipped: false };
  } catch (err) {
    console.error(`reCAPTCHA verify error on ${functionName}:`, err);
    return { ok: true, skipped: true };
  }
}

export function recaptchaErrorResponse(): Response {
  return new Response(
    JSON.stringify({
      error:
        "We couldn't verify you're not a robot. Please enable cookies for this site and try again.",
    }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
