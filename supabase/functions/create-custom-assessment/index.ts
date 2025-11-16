import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREDITS_PER_ASSESSMENT = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('[CREATE-ASSESSMENT] User authenticated:', user.id);

    // Parse request body
    const { assessment_name, assessment_type, description, questions } = await req.json();

    if (!assessment_name || !questions || questions.length === 0) {
      throw new Error('Assessment name and questions are required');
    }

    // Get user's subscription tier
    const { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('[CREATE-ASSESSMENT] Subscription fetch error:', subError);
    }

    const tier = subscription?.tier || 'employer_starter';
    console.log('[CREATE-ASSESSMENT] User tier:', tier);

    // Get monthly quota for this tier
    const { data: quotaData, error: quotaError } = await supabaseClient
      .rpc('get_assessment_quota', { p_tier: tier });

    if (quotaError) {
      console.error('[CREATE-ASSESSMENT] Quota fetch error:', quotaError);
      throw new Error('Failed to fetch assessment quota');
    }

    const monthlyQuota = quotaData || 0;
    console.log('[CREATE-ASSESSMENT] Monthly quota:', monthlyQuota);

    // Count assessments created this month
    const { data: countData, error: countError } = await supabaseClient
      .rpc('count_monthly_assessments', { p_user_id: user.id });

    if (countError) {
      console.error('[CREATE-ASSESSMENT] Count fetch error:', countError);
      throw new Error('Failed to count monthly assessments');
    }

    const assessmentsThisMonth = countData || 0;
    console.log('[CREATE-ASSESSMENT] Assessments this month:', assessmentsThisMonth);

    // Check if within quota
    const withinQuota = assessmentsThisMonth < monthlyQuota;

    if (!withinQuota) {
      console.log('[CREATE-ASSESSMENT] Over quota, checking credits');
      
      // Need to use credits - check employer_credits table
      const { data: creditData, error: creditError } = await supabaseClient
        .from('employer_credits')
        .select('credits')
        .eq('employer_id', user.id)
        .single();

      if (creditError && creditError.code !== 'PGRST116') {
        console.error('[CREATE-ASSESSMENT] Credit fetch error:', creditError);
        throw new Error('Failed to fetch credit balance');
      }

      const availableCredits = creditData?.credits || 0;
      console.log('[CREATE-ASSESSMENT] Available credits:', availableCredits);

      if (availableCredits < CREDITS_PER_ASSESSMENT) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Insufficient credits',
            message: `You've used ${assessmentsThisMonth}/${monthlyQuota} free assessments this month. Creating additional assessments costs ${CREDITS_PER_ASSESSMENT} credits. You have ${availableCredits} credits available.`,
            requiresCredits: true,
            creditsNeeded: CREDITS_PER_ASSESSMENT,
            creditsAvailable: availableCredits,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }

      // Deduct credits
      const { error: deductError } = await supabaseClient
        .from('employer_credits')
        .update({ 
          credits: availableCredits - CREDITS_PER_ASSESSMENT,
        })
        .eq('employer_id', user.id);

      if (deductError) {
        console.error('[CREATE-ASSESSMENT] Credit deduction error:', deductError);
        throw new Error('Failed to deduct credits');
      }

      console.log(`[CREATE-ASSESSMENT] Deducted ${CREDITS_PER_ASSESSMENT} credits`);
    }

    // Create the custom assessment
    const { data: assessment, error: insertError } = await supabaseClient
      .from('custom_assessments')
      .insert({
        created_by: user.id,
        assessment_name,
        assessment_type: assessment_type || 'Custom',
        description,
        questions,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[CREATE-ASSESSMENT] Insert error:', insertError);
      throw new Error('Failed to create assessment');
    }

    console.log('[CREATE-ASSESSMENT] Assessment created:', assessment.id);

    return new Response(
      JSON.stringify({
        success: true,
        assessment,
        creditsUsed: withinQuota ? 0 : CREDITS_PER_ASSESSMENT,
        remainingQuota: monthlyQuota - assessmentsThisMonth - 1,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('[CREATE-ASSESSMENT] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
