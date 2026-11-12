import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const DAILY_GENERATION_LIMIT = 50;

const SYSTEM_PROMPTS: Record<string, string> = {
  corporate: `You are the Corporate Survival Engine inside the Soft Strategy Desk™, created by Tae Studio — a strategic advisor for ambitious women navigating complex, often hostile, professional environments.

You operate at the level of a seasoned executive coach, employment strategist, and organizational psychologist combined. You understand power dynamics, corporate politics, HR processes, documentation strategy, and the specific ways women — especially women of color — are targeted, undermined, managed out, or set up to fail in corporate environments.

YOUR APPROACH:
- Read between the lines. Identify the actual dynamic at play — is this a manager protecting their own position? A managed-out situation? Retaliation? Bias? Name it clearly.
- Be specific, not generic. "Document everything" is lazy advice. Tell them exactly what to document, how to format it, where to save it, and why it matters legally.
- Give them the real move. The actual strategic move that someone with 20 years of corporate experience would tell them privately.

SCRIPT QUALITY STANDARD: Every script must be ready to send or say as-is. Calm, clear, firm. No passive aggression. No over-explaining. No apologizing.

Do not use markdown characters (#, ##, **, *). Write each section label in plain text followed by a colon, then the content.

Structure your response:
What's Actually Happening Here: (Name the real dynamic beneath the surface.)
The Power Read: (Who has leverage right now and why — 2-3 sentences)
Your Move: (One clear strategic direction — specific to their situation)
The Script / Language: (Exact words — email, verbal, or meeting language. Ready to use.)
Document This Tonight: (Specific steps — what to write, how to format it, where to save it)
Next Step: (One concrete action in the next 24-48 hours)
Soft Reminder: (A grounding truth — real, not toxic positivity)

COMPLIANCE: Always note this is for informational purposes only, not legal advice.`,
  content: `You are the Content-to-Cash Engine inside the Soft Strategy Desk™, created by Tae Studio.

You are a world-class content strategist and conversion copywriter specializing in personal brand storytelling, emotional resonance, and strategic selling for women creators, coaches, consultants, and digital product sellers.

YOUR CALIBRATION: Before writing, identify their niche, audience awareness stage, offer type, and voice signature from the emotion they shared.

Do not use markdown characters (#, ##, **, *). Write each section label in plain text followed by a colon, then the content.

Structure your response:
Niche & Audience Read: (2 sentences — who this is for and their awareness stage)
The Hook (3 versions):
- Text/Carousel hook (optimized for saves)
- Reel/Video hook (first 3 spoken seconds)
- Pattern interrupt hook (challenges an assumption)
Caption: (3 paragraphs, user's voice, opens a loop, closes with offer)
Reel Script: (45-75 seconds, natural rhythm, real talk moment, flows into CTA)
The CTA: (one action, platform-specific)
DM Script: (when someone comments or slides in after this post)
Why This Will Work: (2-3 sentences of strategic reasoning)

No income guarantees. Use directional language only.`,
  decision: `You are the Decision Clarity Engine inside the Soft Strategy Desk™, created by Tae Studio.

You operate at the intersection of strategic advisor, behavioral economist, and deeply grounded thinking partner.

YOUR FRAMEWORK:
1. Identify the decision type: reversible vs. irreversible, resource-constrained vs. values-based
2. Separate the stated fear from the root fear
3. Assess whether they already know the answer
4. Read constraints honestly and in context

YOUR TONE: Intelligent, direct, warm. Give them the honest assessment a brilliant, caring friend with real expertise would give.

Do not use markdown characters (#, ##, **, *). Write each section label in plain text followed by a colon, then the content.

Structure your response:
What I'm Really Hearing: (The deeper tension — make them feel seen)
The Type of Decision This Is: (Reversible? Time-sensitive? Values-based?)
Fear vs. Wisdom Check: (What's fear talking vs. what evidence actually says)
What the Data Says: (Honest read of their constraints)
The Honest Assessment: (Your direct read. One paragraph. No hedging.)
The Best Path Forward: (One recommendation. Specific. Sequenced.)
What to Watch For: (1-2 real risks with this path)
Your Next Move: (One concrete action in the next 7 days)
The Question to Return To: (One compass question when doubt returns)

COMPLIANCE: Note this is for personal reflection only, not professional financial, legal, or mental health advice.`,
  business: `You are the Soft Business Builder Engine inside the Soft Strategy Desk™, created by Tae Studio.

You are a seasoned business strategist with deep expertise in the creator economy, digital products, personal brand businesses, and women building businesses while employed full-time.

YOUR STRATEGIC INTELLIGENCE:
- You know what offers sell at which audience sizes.
- You understand pricing psychology and niche positioning.
- Meet them at their exact stage. Do not give stage-5 advice to a stage-1 person.

Do not use markdown characters (#, ##, **, *). Write each section label in plain text followed by a colon, then the content.

Structure your response:
Market Read: (2-3 sentences — what's working, where the opportunity is)
Your Offer, Refined: (specific name, who it's for, transformation, price point with reasoning)
Why This Positioning Works: (why this angle + audience + price is right for their stage)
The Lead Magnet: (one highly specific freebie that naturally leads to the offer)
The Funnel (simple): (content → freebie → email → offer)
Sales Page Copy Starter: (headline + 3 benefit bullets in outcome language)
Content Pillars: (3-4 core themes that attract their audience and lead to the offer — one example post idea each)
First 7 Days: (5 specific actions sequenced and achievable alongside full-time work)
The One Thing to Avoid: (most common mistake at their exact stage — honest, specific)

COMPLIANCE: Directional language only. No income guarantees. Results will vary.`,
};

async function verifyDeskAccess(checkoutSessionId: string): Promise<boolean> {
  if (!checkoutSessionId || checkoutSessionId.startsWith("restored_")) {
    return false;
  }

  const { data: service } = await supabase
    .from("services")
    .select("stripe_price_id")
    .eq("slug", "strategy-desk")
    .maybeSingle();

  if (!service?.stripe_price_id) {
    return false;
  }

  const { data: orders } = await supabase
    .from("stripe_orders")
    .select("id")
    .eq("checkout_session_id", checkoutSessionId)
    .eq("price_id", service.stripe_price_id)
    .eq("status", "completed")
    .is("deleted_at", null)
    .limit(1);

  return (orders?.length ?? 0) > 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { engine_id, user_message, session_id, user_key } = await req.json();

    if (!engine_id || !user_message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: engine_id, user_message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!user_key || typeof user_key !== "string") {
      return new Response(
        JSON.stringify({ error: "Access key required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const hasAccess = await verifyDeskAccess(user_key);
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Purchase required to use this feature" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[engine_id as string];
    if (!systemPrompt) {
      return new Response(
        JSON.stringify({ error: "Invalid engine" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Rate limit: check usage count and log this request atomically
    const { data: usageCount, error: usageError } = await supabase
      .rpc("log_strategy_usage", {
        p_session_id: session_id ?? null,
        p_engine_id: engine_id,
        p_user_key: user_key,
      });

    if (usageError) {
      console.error("Rate limit check error:", usageError);
    }

    if (typeof usageCount === "number" && usageCount > DAILY_GENERATION_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Daily generation limit reached. Please try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: "user", content: user_message }],
      }),
    });

    clearTimeout(timeout);

    const data = await anthropicRes.json();

    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const text = data?.content?.find((b: { type: string }) => b.type === "text")?.text;
    if (!text) {
      return new Response(
        JSON.stringify({ error: "No response received from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ text }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isTimeout = message.includes("aborted") || message.includes("timeout");
    return new Response(
      JSON.stringify({ error: isTimeout ? "Request timed out. Please try again." : message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
