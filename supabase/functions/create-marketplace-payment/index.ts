import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_FEE_PERCENT = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const clientUserId = claimsData.claims.sub;

    const { engagement_id } = await req.json();
    if (!engagement_id) throw new Error("engagement_id is required");

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get engagement details
    const { data: engagement, error: engError } = await adminClient
      .from("marketplace_engagements")
      .select("*")
      .eq("id", engagement_id)
      .single();

    if (engError || !engagement) throw new Error("Engagement not found");
    if (engagement.client_id !== clientUserId) throw new Error("Not authorized for this engagement");

    // Get talent's Connect account
    const { data: talentProfile } = await adminClient
      .from("candidate_profiles")
      .select("stripe_connect_account_id")
      .eq("user_id", engagement.talent_id)
      .maybeSingle();

    if (!talentProfile?.stripe_connect_account_id) {
      throw new Error("Talent has not completed payment onboarding yet");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const grossAmountGbp = engagement.total_estimated_gbp || engagement.agreed_rate_gbp;
    const grossAmountPence = Math.round(grossAmountGbp * 100);
    const platformFeePence = Math.round(grossAmountPence * (PLATFORM_FEE_PERCENT / 100));

    const origin = req.headers.get("origin") || Deno.env.get("APP_URL") || "https://cydena.lovable.app";

    // Create Checkout Session with Connect destination charge
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: engagement.title,
              description: `Marketplace engagement: ${engagement.description?.substring(0, 200) || engagement.title}`,
            },
            unit_amount: grossAmountPence,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFeePence,
        transfer_data: {
          destination: talentProfile.stripe_connect_account_id,
        },
      },
      metadata: {
        engagement_id: engagement.id,
        talent_id: engagement.talent_id,
        client_id: clientUserId,
      },
      success_url: `${origin}/dashboard?tab=marketplace&payment=success&engagement=${engagement.id}`,
      cancel_url: `${origin}/dashboard?tab=marketplace&payment=cancelled`,
    });

    // Record the payout intent
    await adminClient.from("marketplace_payouts").insert({
      engagement_id: engagement.id,
      talent_id: engagement.talent_id,
      client_id: clientUserId,
      gross_amount_gbp: grossAmountGbp,
      platform_fee_gbp: Number((grossAmountGbp * PLATFORM_FEE_PERCENT / 100).toFixed(2)),
      net_amount_gbp: Number((grossAmountGbp * (1 - PLATFORM_FEE_PERCENT / 100)).toFixed(2)),
      status: "checkout_created",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
