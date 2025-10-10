import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UNLOCK-PROFILE] ${step}${detailsStr}`);
};

interface UnlockRequest {
  candidateId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Input validation schema
    const UnlockSchema = z.object({
      candidateId: z.string().uuid({ message: "Invalid candidate ID format" })
    });

    const rawBody = await req.json();
    const { candidateId } = UnlockSchema.parse(rawBody);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    
    logStep('Auth header check', { hasHeader: !!authHeader });
    
    if (!authHeader) {
      logStep('ERROR: No auth header');
      throw new Error('Unauthorized: No auth header');
    }
    
    // Create client with service role for all operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get user from JWT token
    logStep('Getting user from JWT');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    logStep('Auth result', { 
      hasUser: !!user, 
      userId: user?.id,
      errorMessage: authError?.message
    });
    
    if (authError || !user) {
      logStep('ERROR: Auth failed', { error: authError?.message || 'No user' });
      throw new Error(`Unauthorized: ${authError?.message || 'No user found'}`);
    }

    const employerId = user.id;
    // candidateId already validated above
    logStep('Unlock request', { employerId, candidateId });

    // Check if already unlocked
    const { data: existingUnlock } = await supabaseAdmin
      .from('profile_unlocks')
      .select('id')
      .eq('employer_id', employerId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (existingUnlock) {
      logStep('Already unlocked');
      return new Response(
        JSON.stringify({ success: true, message: 'Already unlocked', alreadyUnlocked: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get employer subscription to determine tier and limits
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('tier, status')
      .eq('user_id', employerId)
      .eq('status', 'active')
      .maybeSingle();

    const tier = subscription?.tier || null;
    const hasTier = tier !== null;
    logStep('Subscription check', { tier, hasTier });

    // Get employer credits and allocation usage
    const { data: creditData, error: creditError } = await supabaseAdmin
      .from('employer_credits')
      .select('credits, credits_used, annual_unlocks_used, allocation_year, annual_allocation')
      .eq('employer_id', employerId)
      .maybeSingle();

    if (creditError) throw creditError;
    
    if (!creditData) {
      throw new Error('No credit account found');
    }

    const currentYear = new Date().getFullYear();
    let annualUnlocksUsed = creditData.annual_unlocks_used || 0;

    // Reset annual counter if new year
    if (creditData.allocation_year !== currentYear) {
      annualUnlocksUsed = 0;
      await supabaseAdmin
        .from('employer_credits')
        .update({ 
          annual_unlocks_used: 0, 
          allocation_year: currentYear 
        })
        .eq('employer_id', employerId);
      logStep('Reset annual allocation for new year');
    }

    // Determine if this unlock is within allocation or requires overage charge
    let tierLimit = 0;
    let overagePrice = 0;
    let isOverage = false;

    if (hasTier && tier) {
      // Get tier limits
      const { data: limitData } = await supabaseAdmin
        .rpc('get_tier_unlock_limit', { tier_name: tier });
      tierLimit = limitData || 0;

      const { data: priceData } = await supabaseAdmin
        .rpc('get_tier_overage_price', { tier_name: tier });
      overagePrice = priceData || 20.00;

      isOverage = annualUnlocksUsed >= tierLimit;
      logStep('Tier limits', { tierLimit, annualUnlocksUsed, isOverage, overagePrice });
    }

    // If overage and no credits, require payment
    if (isOverage && creditData.credits < 1) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Allocation exceeded. Purchase additional unlocks or upgrade tier.',
          isOverage: true,
          overagePrice: overagePrice,
          tierLimit: tierLimit,
          annualUsed: annualUnlocksUsed
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // If no tier and no credits, block
    if (!hasTier && creditData.credits < 1) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Subscribe to a plan or purchase credits to unlock profiles.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Deduct credit (either from allocation or purchased credits)
    // Use atomic update to prevent race conditions
    let newCredits = creditData.credits;
    let newAnnualUsed = annualUnlocksUsed;
    let chargeAmount = 0;
    let expectedOldCredits = creditData.credits;
    let expectedOldUsed = creditData.credits_used;

    if (isOverage) {
      // Using purchased credits for overage
      newCredits = creditData.credits - 1;
      chargeAmount = overagePrice;
      logStep('Charging overage from purchased credits');
    } else if (hasTier) {
      // Within allocation - track usage but don't deduct credits
      newAnnualUsed = annualUnlocksUsed + 1;
      logStep('Using allocation unlock', { newAnnualUsed, tierLimit });
    } else {
      // No subscription - use purchased credits
      newCredits = creditData.credits - 1;
      logStep('Using purchased credit (no subscription)');
    }

    // Atomic update with race condition protection
    // Only update if credits haven't changed since we checked
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from('employer_credits')
      .update({ 
        credits: newCredits,
        credits_used: creditData.credits_used + 1,
        annual_unlocks_used: newAnnualUsed
      })
      .eq('employer_id', employerId)
      .eq('credits', expectedOldCredits)  // Ensure credits haven't changed
      .eq('credits_used', expectedOldUsed)  // Ensure usage hasn't changed
      .select();

    if (updateError) throw updateError;
    
    // If no rows updated, another transaction modified credits first
    if (!updateResult || updateResult.length === 0) {
      throw new Error('Credit balance changed during transaction. Please try again.');
    }

    const { error: unlockError } = await supabaseAdmin
      .from('profile_unlocks')
      .insert({
        employer_id: employerId,
        candidate_id: candidateId,
      });

    if (unlockError) {
      // Rollback
      await supabaseAdmin
        .from('employer_credits')
        .update({ 
          credits: creditData.credits,
          credits_used: creditData.credits_used,
          annual_unlocks_used: annualUnlocksUsed
        })
        .eq('employer_id', employerId);
      throw unlockError;
    }

    // Log transaction
    await supabaseAdmin
      .from('credit_transactions')
      .insert({
        employer_id: employerId,
        amount: isOverage ? -1 : 0,
        price: chargeAmount,
        transaction_type: 'unlock',
        status: 'completed',
      });

    logStep('Profile unlocked successfully', { 
      remainingCredits: newCredits, 
      annualUsed: newAnnualUsed,
      tierLimit,
      isOverage 
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: isOverage ? 'Profile unlocked (overage charged)' : 'Profile unlocked',
        remainingCredits: newCredits,
        annualUsed: newAnnualUsed,
        tierLimit: tierLimit,
        isOverage: isOverage,
        overageCharged: isOverage ? overagePrice : 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    logStep('ERROR', { message: error.message });
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});