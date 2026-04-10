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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body));

    // MercadoPago sends different notification types
    // IPN: { topic: "payment", id: "123" }
    // Webhook v2: { action: "payment.created", data: { id: "123" } }
    let paymentId: string | null = null;

    if (body.topic === 'payment' && body.resource) {
      // IPN format - extract ID from resource URL
      const parts = body.resource.split('/');
      paymentId = parts[parts.length - 1];
    } else if (body.data?.id) {
      // Webhook v2 format
      paymentId = String(body.data.id);
    } else if (body.id && body.topic === 'payment') {
      paymentId = String(body.id);
    }

    if (!paymentId) {
      console.log('No payment ID found, possibly a test or merchant_order notification. Body:', JSON.stringify(body));
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch payment details from MercadoPago API
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error(`MercadoPago API error [${mpResponse.status}]:`, errorText);
      throw new Error(`Failed to fetch payment ${paymentId}: ${mpResponse.status}`);
    }

    const payment = await mpResponse.json();
    console.log('Payment details:', JSON.stringify({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
    }));

    // Parse external_reference to get user_id and plan
    let userId: string | null = null;
    let plan: string | null = null;

    if (payment.external_reference) {
      try {
        const ref = JSON.parse(payment.external_reference);
        userId = ref.user_id;
        plan = ref.plan;
      } catch {
        console.error('Failed to parse external_reference:', payment.external_reference);
      }
    }

    // Also try metadata
    if (!userId && payment.metadata?.user_id) {
      userId = payment.metadata.user_id;
      plan = payment.metadata.plan;
    }

    if (!userId) {
      console.error('No user_id found in payment:', paymentId);
      return new Response(JSON.stringify({ error: 'No user_id in payment' }), {
        status: 200, // Return 200 so MP doesn't retry
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map MercadoPago status to our subscription status
    const statusMap: Record<string, string> = {
      approved: 'active',
      authorized: 'active',
      pending: 'pending',
      in_process: 'pending',
      in_mediation: 'pending',
      rejected: 'cancelled',
      cancelled: 'cancelled',
      refunded: 'cancelled',
      charged_back: 'cancelled',
    };

    const subscriptionStatus = statusMap[payment.status] || 'pending';

    // Calculate expiration based on plan
    const now = new Date();
    let expiresAt: Date | null = null;
    if (subscriptionStatus === 'active') {
      if (plan === 'annual') {
        expiresAt = new Date(now);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }
    }

    // Find subscription by preference_id or create/update
    // First try to find by preference_id from payment
    const preferenceId = payment.collector?.id ? null : payment.order?.id;

    // Try to update existing pending subscription for this user
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSub) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: subscriptionStatus,
          mercadopago_payment_id: String(paymentId),
          started_at: subscriptionStatus === 'active' ? now.toISOString() : null,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
        })
        .eq('id', existingSub.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }
      console.log(`Subscription ${existingSub.id} updated to ${subscriptionStatus}`);
    } else {
      // Insert new subscription record
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: plan || 'monthly',
          status: subscriptionStatus,
          amount: payment.transaction_amount || 0,
          mercadopago_payment_id: String(paymentId),
          started_at: subscriptionStatus === 'active' ? now.toISOString() : null,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
        });

      if (insertError) {
        console.error('Error inserting subscription:', insertError);
        throw insertError;
      }
      console.log(`New subscription created for user ${userId} with status ${subscriptionStatus}`);
    }

    return new Response(JSON.stringify({ success: true, status: subscriptionStatus }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 to prevent MercadoPago from retrying on our errors
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
