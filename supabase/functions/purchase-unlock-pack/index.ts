import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Unlock pack configurations
const UNLOCK_PACKS = {
  "10": {
    price_id: "price_1SEzNhFnZFXoJvyLFP48eVQ9",
    credits: 10,
    amount: 59.00
  },
  "25": {
    price_id: "price_1SEzOCFnZFXoJvyLqOgt70oL",
    credits: 25,
    amount: 129.00
  },
  "50": {
    price_id: "price_1SEzOQFnZFXoJvyL6weodcHm",
    credits: 50,
    amount: 249.00
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[PURCHASE-UNLOCK-PACK] Starting request");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const { pack_size } = await req.json();
    console.log("[PURCHASE-UNLOCK-PACK] Pack size:", pack_size);

    if (!UNLOCK_PACKS[pack_size as keyof typeof UNLOCK_PACKS]) {
      throw new Error(`Invalid pack size: ${pack_size}`);
    }

    const pack = UNLOCK_PACKS[pack_size as keyof typeof UNLOCK_PACKS];

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: userData.user.email!,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userData.user.email!,
      });
      customerId = customer.id;
    }

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: pack.price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?unlock_purchase=success&credits=${pack.credits}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?unlock_purchase=canceled`,
      metadata: {
        pack_size: pack_size,
        credits: pack.credits.toString(),
        user_id: userData.user.id,
        purchase_type: "unlock_pack"
      },
    });

    console.log("[PURCHASE-UNLOCK-PACK] Success, returning checkout URL");
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[PURCHASE-UNLOCK-PACK] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
