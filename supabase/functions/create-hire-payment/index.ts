import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-HIRE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Input validation
    const HirePaymentSchema = z.object({
      application_id: z.string().uuid({ message: "Invalid application ID" }),
      candidate_id: z.string().uuid({ message: "Invalid candidate ID" }),
      job_id: z.string().uuid({ message: "Invalid job ID" }),
      position_title: z.string().min(1).max(200)
    });

    const rawBody = await req.json();
    const { application_id, candidate_id, job_id, position_title } = HirePaymentSchema.parse(rawBody);
    logStep("Request data validated", { application_id, candidate_id, job_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create payment session for £999 success fee
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: 99900, // £999.00
            product_data: {
              name: "Success Fee - Hire Confirmation",
              description: `Pay-per-hire fee for ${position_title}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?hire_success=true`,
      cancel_url: `${req.headers.get("origin")}/dashboard?hire_cancelled=true`,
      metadata: {
        application_id,
        candidate_id,
        job_id,
        employer_id: user.id,
        payment_type: "hire_success_fee",
      },
    });

    logStep("Payment session created", { sessionId: session.id, url: session.url });

    // Create placement record with pending status
    const { error: placementError } = await supabaseClient
      .from('placements')
      .insert({
        employer_id: user.id,
        candidate_id,
        job_id,
        position_title,
        commission_amount: 999,
        commission_status: 'pending',
        placement_date: new Date().toISOString().split('T')[0],
        notes: `Pay-per-hire model - Stripe session: ${session.id}`,
      });

    if (placementError) {
      logStep("Error creating placement", placementError);
      throw new Error(`Failed to create placement: ${placementError.message}`);
    }

    logStep("Placement record created");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
