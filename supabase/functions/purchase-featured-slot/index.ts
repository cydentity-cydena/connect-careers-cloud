import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseRequest {
  partner_name: string;
  partner_slug: string;
  description?: string;
  logo_url?: string;
  website_url: string;
  slot_position: number;
  weeks: number; // 1-4 weeks
}

const WEEKLY_PRICE = 299; // $299 per week per slot

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("Unauthorized");
    }

    const body: PurchaseRequest = await req.json();
    
    // Validate weeks (1-4)
    if (body.weeks < 1 || body.weeks > 4) {
      throw new Error("Weeks must be between 1 and 4");
    }

    // Validate slot position (1-4)
    if (body.slot_position < 1 || body.slot_position > 4) {
      throw new Error("Slot position must be between 1 and 4");
    }

    const totalAmount = WEEKLY_PRICE * body.weeks;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (body.weeks * 7));

    // Check if slot is available for the requested period
    const { data: existingSlots } = await supabaseAdmin
      .from("featured_training_partners")
      .select("*")
      .eq("slot_position", body.slot_position)
      .or(`start_date.lte.${endDate.toISOString()},end_date.gte.${startDate.toISOString()}`)
      .eq("payment_status", "completed");

    if (existingSlots && existingSlots.length > 0) {
      throw new Error("This slot is already booked for the selected period");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId = customers.data[0]?.id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email! });
      customerId = customer.id;
    }

    // Create pending record
    const { data: featuredPartner, error: insertError } = await supabaseAdmin
      .from("featured_training_partners")
      .insert({
        partner_name: body.partner_name,
        partner_slug: body.partner_slug,
        description: body.description,
        logo_url: body.logo_url,
        website_url: body.website_url,
        slot_position: body.slot_position,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_status: "pending",
        amount_paid: totalAmount,
        purchased_by: user.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Featured Training Partner - Slot ${body.slot_position}`,
              description: `${body.weeks} week${body.weeks > 1 ? 's' : ''} of featured placement`,
            },
            unit_amount: totalAmount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/training?featured=success`,
      cancel_url: `${req.headers.get("origin")}/training?featured=cancelled`,
      metadata: {
        featured_partner_id: featuredPartner.id,
      },
    });

    return new Response(
      JSON.stringify({ 
        url: session.url,
        featured_partner_id: featuredPartner.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in purchase-featured-slot:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
