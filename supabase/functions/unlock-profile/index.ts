import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnlockRequest {
  candidateId: string;
}

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

    // Get employer from auth token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const employerId = user.id;
    const { candidateId }: UnlockRequest = await req.json();

    console.log('Unlock request:', { employerId, candidateId });

    // Check if already unlocked
    const { data: existingUnlock } = await supabaseAdmin
      .from('profile_unlocks')
      .select('id')
      .eq('employer_id', employerId)
      .eq('candidate_id', candidateId)
      .single();

    if (existingUnlock) {
      return new Response(
        JSON.stringify({ success: true, message: 'Already unlocked', alreadyUnlocked: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get employer credits
    const { data: creditData, error: creditError } = await supabaseAdmin
      .from('employer_credits')
      .select('credits')
      .eq('employer_id', employerId)
      .single();

    if (creditError || !creditData || creditData.credits < 1) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient credits' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Start transaction: deduct credit, create unlock, log transaction
    const { error: updateError } = await supabaseAdmin
      .from('employer_credits')
      .update({ credits: creditData.credits - 1 })
      .eq('employer_id', employerId);

    if (updateError) throw updateError;

    const { error: unlockError } = await supabaseAdmin
      .from('profile_unlocks')
      .insert({
        employer_id: employerId,
        candidate_id: candidateId,
      });

    if (unlockError) {
      // Rollback credit deduction
      await supabaseAdmin
        .from('employer_credits')
        .update({ credits: creditData.credits })
        .eq('employer_id', employerId);
      throw unlockError;
    }

    await supabaseAdmin
      .from('credit_transactions')
      .insert({
        employer_id: employerId,
        amount: -1,
        price: 0,
        transaction_type: 'unlock',
        status: 'completed',
      });

    console.log('Profile unlocked successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profile unlocked',
        remainingCredits: creditData.credits - 1,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Unlock error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});