import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tiered pricing per week by slot position
const SLOT_PRICING = {
  1: { weeklyPrice: 399.00, priceId: "price_1SG4ycFnZFXoJvyLWNgE0o02" },
  2: { weeklyPrice: 349.00, priceId: "price_1SG4ynDOcfakZuIaAMyU78YG" },
  3: { weeklyPrice: 299.00, priceId: "price_1SG4yxFnZFXoJvyL1PIVJ7Mo" },
  4: { weeklyPrice: 249.00, priceId: "price_1SG4z7DOcfakZuIaql09IhKv" },
};

// Volume discount tiers
const getVolumeDiscount = (weeks: number): number => {
  if (weeks >= 12) return 0.20; // 20% off for 12+ weeks
  if (weeks >= 8) return 0.15;  // 15% off for 8-11 weeks
  if (weeks >= 4) return 0.10;  // 10% off for 4-7 weeks
  return 0; // No discount for 1-3 weeks
};

interface PurchaseRequest {
  partner_name: string;
  partner_slug: string;
  description: string;
  logo_url?: string;
  website_url: string;
  slot_position: number;
  weeks: number;
  start_date?: string; // Optional: allow future scheduling
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[PURCHASE-FEATURED-SLOT] Starting request");

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
    console.log("[PURCHASE-FEATURED-SLOT] Purchase data:", purchaseData);

    // Validate slot position
    if (purchaseData.slot_position < 1 || purchaseData.slot_position > 4) {
      throw new Error("Invalid slot position. Must be between 1-4");
    }

    // Validate weeks
    if (purchaseData.weeks < 1) {
      throw new Error("Minimum purchase is 1 week");
    }

    // Get pricing for the selected slot
    const slotPricing = SLOT_PRICING[purchaseData.slot_position as keyof typeof SLOT_PRICING];
    if (!slotPricing) {
      throw new Error("Invalid slot pricing configuration");
    }

    // Calculate dates
    const startDate = purchaseData.start_date ? new Date(purchaseData.start_date) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (purchaseData.weeks * 7));

    // Check for slot conflicts in the requested date range
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: conflicts } = await supabaseAdmin
      .from("featured_training_partners")
      .select("id, start_date, end_date")
      .eq("slot_position", purchaseData.slot_position)
      .eq("payment_status", "completed")
      .or(`and(start_date.lte.${endDate.toISOString()},end_date.gte.${startDate.toISOString()})`);

    if (conflicts && conflicts.length > 0) {
      throw new Error(`Slot ${purchaseData.slot_position} is already booked for these dates. Please choose different dates or another slot.`);
    }

    // Calculate total with volume discount
    const baseTotal = slotPricing.weeklyPrice * purchaseData.weeks;
    const discount = getVolumeDiscount(purchaseData.weeks);
    const totalAmount = baseTotal * (1 - discount);
    
    console.log(`[PURCHASE-FEATURED-SLOT] Pricing: $${slotPricing.weeklyPrice}/week × ${purchaseData.weeks} weeks = $${baseTotal}, Discount: ${discount * 100}%, Final: $${totalAmount}`);

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

    // Create checkout session with calculated pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
            product_data: {
              name: `Featured Training Partner - Slot #${purchaseData.slot_position}`,
              description: `${purchaseData.weeks} week(s) for ${purchaseData.partner_name}${discount > 0 ? ` (${discount * 100}% volume discount)` : ''}`,
              metadata: {
                slot_position: purchaseData.slot_position.toString(),
                base_weekly_price: slotPricing.weeklyPrice.toString(),
                weeks: purchaseData.weeks.toString(),
                discount_percent: (discount * 100).toString(),
              },
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/training?featured=success`,
      cancel_url: `${req.headers.get("origin")}/training?featured=canceled`,
      metadata: {
        partner_name: purchaseData.partner_name,
        partner_slug: purchaseData.partner_slug,
        slot_position: purchaseData.slot_position.toString(),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        user_id: userData.user.id,
        weeks: purchaseData.weeks.toString(),
        base_price: baseTotal.toString(),
        discount_applied: discount.toString(),
        final_amount: totalAmount.toString(),
      },
    });

    // Create pending record in database
    const { error: insertError } = await supabaseAdmin
      .from("featured_training_partners")
      .insert({
        partner_name: purchaseData.partner_name,
        partner_slug: purchaseData.partner_slug,
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
      console.error("[PURCHASE-FEATURED-SLOT] Insert error:", insertError);
      throw insertError;
    }

    console.log("[PURCHASE-FEATURED-SLOT] Success, returning checkout URL");
    return new Response(JSON.stringify({ 
      url: session.url,
      pricing: {
        weeklyRate: slotPricing.weeklyPrice,
        weeks: purchaseData.weeks,
        subtotal: baseTotal,
        discount: discount * 100,
        total: totalAmount
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[PURCHASE-FEATURED-SLOT] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});