import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PurchaseSchema = z.object({
  package: z.enum(['starter', 'professional', 'enterprise'], {
    errorMap: () => ({ message: 'Package must be one of: starter, professional, enterprise' })
  })
});

const CREDIT_PACKAGES = {
  starter: { credits: 5, price: 49.99 },
  professional: { credits: 20, price: 149.99 },
  enterprise: { credits: 100, price: 499.99 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const employerId = user.id;
    
    // Validate input with Zod
    const body = await req.json();
    const { package: packageType } = PurchaseSchema.parse(body);

    const pkg = CREDIT_PACKAGES[packageType];
    console.log('Credit purchase:', { employerId, packageType, credits: pkg.credits, price: pkg.price });

    // Check if employer credits record exists
    const { data: existingCredits } = await supabaseAdmin
      .from('employer_credits')
      .select('*')
      .eq('employer_id', employerId)
      .single();

    if (existingCredits) {
      // Update existing record
      await supabaseAdmin
        .from('employer_credits')
        .update({
          credits: existingCredits.credits + pkg.credits,
          total_purchased: existingCredits.total_purchased + pkg.credits,
        })
        .eq('employer_id', employerId);
    } else {
      // Create new record
      await supabaseAdmin
        .from('employer_credits')
        .insert({
          employer_id: employerId,
          credits: pkg.credits,
          total_purchased: pkg.credits,
        });
    }

    // Log transaction
    await supabaseAdmin
      .from('credit_transactions')
      .insert({
        employer_id: employerId,
        amount: pkg.credits,
        price: pkg.price,
        transaction_type: 'purchase',
        status: 'completed',
      });

    console.log('Credits purchased successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: `${pkg.credits} credits added`,
        totalCredits: (existingCredits?.credits || 0) + pkg.credits,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Purchase error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});