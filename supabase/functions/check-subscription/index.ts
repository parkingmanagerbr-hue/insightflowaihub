/**
 * check-subscription — GENIA Billing Service proxy
 *
 * Accepts: POST { product_slug: string }  (or GET ?product_slug=X)
 * Returns: { active: boolean, plan?: string, active_until?: string }
 *
 * Auth: Bearer <supabase JWT>
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const BILLING_URL = Deno.env.get("BILLING_SERVICE_URL") ?? "https://billing.veloxisit.com.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify Supabase JWT → get email
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Get product_slug from body or query param
    let product_slug: string | null = null;
    const url = new URL(req.url);
    product_slug = url.searchParams.get("product_slug");
    if (!product_slug && req.method === "POST") {
      try {
        const body = await req.json();
        product_slug = body.product_slug ?? null;
      } catch { /* no body */ }
    }
    if (!product_slug) {
      return new Response(JSON.stringify({ error: "product_slug required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Query GENIA Billing Service
    const billingRes = await fetch(
      `${BILLING_URL}/subscriptions/active?email=${encodeURIComponent(user.email)}&product_slug=${encodeURIComponent(product_slug)}`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (!billingRes.ok) {
      // Fail-open: if billing service unreachable, allow access
      console.error(`[check-subscription] billing service error: ${billingRes.status}`);
      return new Response(JSON.stringify({ active: true, source: "fail-open" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const billing = await billingRes.json();
    return new Response(JSON.stringify(billing), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[check-subscription] error:", err);
    // Fail-open on unexpected errors
    return new Response(JSON.stringify({ active: true, source: "fail-open", error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
