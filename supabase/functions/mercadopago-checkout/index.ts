import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { plan } = await req.json();

    if (!plan || !['monthly', 'annual'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const planDetails = {
      monthly: {
        title: 'InsightFlow Pro - Mensal',
        price: 49.90,
        description: 'Assinatura mensal do InsightFlow Pro',
      },
      annual: {
        title: 'InsightFlow Pro - Anual',
        price: 149.00,
        description: 'Assinatura anual do InsightFlow Pro',
      },
    };

    const selected = planDetails[plan as keyof typeof planDetails];

    const preferenceBody = {
      items: [
        {
          title: selected.title,
          description: selected.description,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: selected.price,
        },
      ],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${req.headers.get('origin') || 'https://insightflowaihub.lovable.app'}/dashboard?payment=success`,
        failure: `${req.headers.get('origin') || 'https://insightflowaihub.lovable.app'}/plans?payment=failure`,
        pending: `${req.headers.get('origin') || 'https://insightflowaihub.lovable.app'}/plans?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({ user_id: user.id, plan }),
      metadata: {
        user_id: user.id,
        plan,
      },
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('MercadoPago error:', mpData);
      throw new Error(`MercadoPago API error: ${mpResponse.status}`);
    }

    // Save subscription record
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    await adminClient.from('subscriptions').insert({
      user_id: user.id,
      plan,
      amount: selected.price,
      mercadopago_preference_id: mpData.id,
      status: 'pending',
    });

    return new Response(JSON.stringify({
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      preference_id: mpData.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
