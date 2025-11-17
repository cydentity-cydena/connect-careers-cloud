import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { referralCode, newUserId } = await req.json();

    console.log('Processing referral:', { referralCode, newUserId });

    // Get the referral code record
    const { data: codeData, error: codeError } = await supabaseClient
      .from('referral_codes')
      .select('user_id')
      .eq('code', referralCode)
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      console.log('Referral code not found:', referralCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid referral code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Don't allow self-referrals
    if (codeData.user_id === newUserId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot refer yourself' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create referral record
    const { error: referralError } = await supabaseClient
      .from('referrals')
      .insert({
        referrer_id: codeData.user_id,
        referred_user_id: newUserId,
        referral_code: referralCode,
        status: 'completed'
      });

    if (referralError) {
      console.error('Error creating referral:', referralError);
      throw referralError;
    }

    // Update uses count
    await supabaseClient
      .from('referral_codes')
      .update({ uses_count: supabaseClient.rpc('increment') })
      .eq('code', referralCode);

    // Award points to referrer
    const { error: pointsError } = await supabaseClient
      .from('reward_points')
      .insert({
        candidate_id: codeData.user_id,
        type: 'REFERRAL_SIGNUP',
        amount: 50,
        meta: { referred_user: newUserId }
      });

    if (pointsError) {
      console.error('Error awarding referrer points:', pointsError);
    }

    // Update referrer XP
    await supabaseClient
      .from('candidate_xp')
      .update({ total_xp: supabaseClient.rpc('increment', { x: 50 }) })
      .eq('candidate_id', codeData.user_id);

    // Award welcome bonus to new user
    const { error: welcomePointsError } = await supabaseClient
      .from('reward_points')
      .insert({
        candidate_id: newUserId,
        type: 'REFERRED_USER_BONUS',
        amount: 25,
        meta: { referrer: codeData.user_id }
      });

    if (welcomePointsError) {
      console.error('Error awarding welcome bonus:', welcomePointsError);
    }

    // Update new user XP
    await supabaseClient
      .from('candidate_xp')
      .update({ total_xp: supabaseClient.rpc('increment', { x: 25 }) })
      .eq('candidate_id', newUserId);

    console.log('Referral processed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Referral processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-referral function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});