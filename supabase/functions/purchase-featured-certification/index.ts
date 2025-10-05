import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WEEKLY_FEATURED_PRICE = 299.00; // $299/week per slot

interface PurchaseRequest {
  cert_name: string;
  cert_slug: string;
  provider_name: string;
  description: string;
  logo_url?: string;
  website_url: string;
  slot_position: number;
  weeks: number; // number of weeks to purchase
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[PURCHASE-FEATURED-CERT] Starting request");

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

    const purchaseData: PurchaseRequest = await req.json();
    console.log("[PURCHASE-FEATURED-CERT] Purchase data:", purchaseData);

    // Validate slot position
    if (purchaseData.slot_position < 1 || purchaseData.slot_position > 4) {
      throw new Error("Invalid slot position. Must be between 1-4");
    }

    // Calculate dates and total
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (purchaseData.weeks * 7));
    const totalAmount = WEEKLY_FEATURED_PRICE * purchaseData.weeks;

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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
            product_data: {
              name: `Featured Certification Slot #${purchaseData.slot_position}`,
              description: `${purchaseData.weeks} week(s) of featured placement for ${purchaseData.cert_name}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/certifications-catalog?featured=success`,
      cancel_url: `${req.headers.get("origin")}/certifications-catalog?featured=canceled`,
      metadata: {
        cert_name: purchaseData.cert_name,
        cert_slug: purchaseData.cert_slug,
        provider_name: purchaseData.provider_name,
        slot_position: purchaseData.slot_position.toString(),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        user_id: userData.user.id,
      },
    });

    // Create pending record in database (admin will approve after payment)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: insertError } = await supabaseAdmin
      .from("featured_certifications")
      .insert({
        cert_name: purchaseData.cert_name,
        cert_slug: purchaseData.cert_slug,
        provider_name: purchaseData.provider_name,
        description: purchaseData.description,
        logo_url: purchaseData.logo_url,
        website_url: purchaseData.website_url,
        slot_position: purchaseData.slot_position,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_status: "pending",
        amount_paid: totalAmount,
        purchased_by: userData.user.id,
      });

    if (insertError) {
      console.error("[PURCHASE-FEATURED-CERT] Insert error:", insertError);
      throw insertError;
    }

    console.log("[PURCHASE-FEATURED-CERT] Success, returning checkout URL");
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[PURCHASE-FEATURED-CERT] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
