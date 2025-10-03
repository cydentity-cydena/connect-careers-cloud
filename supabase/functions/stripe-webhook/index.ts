import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Credit mapping based on price IDs
const CREDIT_MAP: Record<string, number> = {
  'STRIPE_PRICE_BUNDLE_STARTER': 25,
  'STRIPE_PRICE_BUNDLE_GROWTH': 75,
  'STRIPE_PRICE_BUNDLE_SCALE': 150,
  'STRIPE_PRICE_SUBS_ESSENTIAL': 25,
  'STRIPE_PRICE_SUBS_PROFESSIONAL': 75,
  'STRIPE_PRICE_SUBS_ENTERPRISE': 200,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey || !webhookSecret) {
      throw new Error('Stripe configuration missing');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No stripe signature');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Webhook event type:', event.type);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        // Get line items to determine credits
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        
        if (!priceId) {
          console.error('No price ID found');
          break;
        }

        const credits = CREDIT_MAP[priceId] || 0;
        if (credits === 0) {
          console.error('Unknown price ID:', priceId);
          break;
        }

        // Update or create employer credits
        const { data: existingCredits } = await supabaseAdmin
          .from('employer_credits')
          .select('*')
          .eq('employer_id', userId)
          .single();

        if (existingCredits) {
          await supabaseAdmin
            .from('employer_credits')
            .update({
              credits: existingCredits.credits + credits,
              total_purchased: existingCredits.total_purchased + credits,
              updated_at: new Date().toISOString(),
            })
            .eq('employer_id', userId);
        } else {
          await supabaseAdmin
            .from('employer_credits')
            .insert({
              employer_id: userId,
              credits: credits,
              total_purchased: credits,
            });
        }

        // Log transaction
        await supabaseAdmin
          .from('credit_transactions')
          .insert({
            employer_id: userId,
            transaction_type: session.mode === 'subscription' ? 'subscription_start' : 'purchase',
            amount: credits,
            price: (session.amount_total || 0) / 100, // Convert from cents to pounds
            status: 'completed',
          });

        console.log(`Granted ${credits} credits to user ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Only process subscription renewals (not initial subscription)
        if (invoice.billing_reason !== 'subscription_cycle') {
          break;
        }

        const customerId = invoice.customer as string;
        
        // Get subscription to find userId from metadata
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        const priceId = invoice.lines.data[0]?.price?.id;
        const credits = CREDIT_MAP[priceId || ''] || 0;

        if (credits === 0) {
          console.error('Unknown price ID for renewal:', priceId);
          break;
        }

        // Add renewal credits
        const { data: existingCredits } = await supabaseAdmin
          .from('employer_credits')
          .select('*')
          .eq('employer_id', userId)
          .single();

        if (existingCredits) {
          await supabaseAdmin
            .from('employer_credits')
            .update({
              credits: existingCredits.credits + credits,
              total_purchased: existingCredits.total_purchased + credits,
              updated_at: new Date().toISOString(),
            })
            .eq('employer_id', userId);

          // Log renewal transaction
          await supabaseAdmin
            .from('credit_transactions')
            .insert({
              employer_id: userId,
              transaction_type: 'subscription_renewal',
              amount: credits,
              price: (invoice.amount_paid || 0) / 100,
              status: 'completed',
            });

          console.log(`Granted ${credits} renewal credits to user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          console.log(`Subscription cancelled for user ${userId}`);
          // Credits remain, just stop future renewals
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
