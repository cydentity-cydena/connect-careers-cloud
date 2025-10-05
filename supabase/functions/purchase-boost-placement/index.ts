import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@18.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEEKLY_BOOST_PRICE = 499; // $499 per week for dashboard placement

interface PurchaseRequest {
  courseId: string;
  courseName: string;
  partnerName: string;
  durationWeeks: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const purchaseData: PurchaseRequest = await req.json();

    if (!purchaseData.courseId || !purchaseData.durationWeeks) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing boost placement purchase for course ${purchaseData.courseId}, ${purchaseData.durationWeeks} weeks`);

    // Calculate dates and cost
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (purchaseData.durationWeeks * 7));
    const totalAmount = WEEKLY_BOOST_PRICE * purchaseData.durationWeeks;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Boost Placement: ${purchaseData.courseName}`,
              description: `Featured dashboard placement for ${purchaseData.durationWeeks} week(s)`,
            },
            unit_amount: totalAmount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/training?boost_success=true`,
      cancel_url: `${req.headers.get('origin')}/training?boost_canceled=true`,
      metadata: {
        type: 'boost_placement',
        course_id: purchaseData.courseId,
        duration_weeks: purchaseData.durationWeeks.toString(),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });

    console.log(`Stripe checkout session created: ${session.id}`);

    // Update course with pending boost placement
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseAdmin
      .from('partner_courses')
      .update({
        boost_featured: true,
        boost_start_date: startDate.toISOString(),
        boost_end_date: endDate.toISOString(),
        boost_purchased_by: user.id,
        boost_payment_status: 'pending',
        boost_amount_paid: totalAmount,
      })
      .eq('id', purchaseData.courseId);

    if (updateError) {
      console.error('Error updating course:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Boost placement record created for course ${purchaseData.courseId}`);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        checkoutUrl: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in purchase-boost-placement:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});