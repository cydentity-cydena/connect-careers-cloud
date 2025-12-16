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

    if (!referralCode || !newUserId) {
      console.log('Missing required fields:', { referralCode, newUserId });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing referral code or user ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the referral code record
    const { data: codeData, error: codeError } = await supabaseClient
      .from('referral_codes')
      .select('user_id')
      .eq('code', referralCode)
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      console.log('Referral code not found:', referralCode, codeError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid referral code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Don't allow self-referrals
    if (codeData.user_id === newUserId) {
      console.log('Self-referral attempted');
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot refer yourself' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if referral already exists
    const { data: existingReferral } = await supabaseClient
      .from('referrals')
      .select('id')
      .eq('referred_user_id', newUserId)
      .maybeSingle();

    if (existingReferral) {
      console.log('Referral already exists for this user');
      return new Response(
        JSON.stringify({ success: false, error: 'User already has a referral' }),
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

    console.log('Referral record created');

    // Update uses count
    const { error: usesError } = await supabaseClient
      .from('referral_codes')
      .update({ uses_count: (await supabaseClient.from('referral_codes').select('uses_count').eq('code', referralCode).single()).data?.uses_count + 1 || 1 })
      .eq('code', referralCode);

    if (usesError) {
      console.error('Error updating uses count:', usesError);
    }

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

    // Update referrer XP using upsert
    const { data: referrerXp } = await supabaseClient
      .from('candidate_xp')
      .select('total_xp')
      .eq('candidate_id', codeData.user_id)
      .maybeSingle();

    if (referrerXp) {
      const { error: referrerXpError } = await supabaseClient
        .from('candidate_xp')
        .update({ total_xp: referrerXp.total_xp + 50, updated_at: new Date().toISOString() })
        .eq('candidate_id', codeData.user_id);
      
      if (referrerXpError) {
        console.error('Error updating referrer XP:', referrerXpError);
      } else {
        console.log('Referrer XP updated:', referrerXp.total_xp + 50);
      }
    } else {
      const { error: referrerXpInsertError } = await supabaseClient
        .from('candidate_xp')
        .insert({
          candidate_id: codeData.user_id,
          total_xp: 50,
          community_points: 0,
          level: 1
        });
      
      if (referrerXpInsertError) {
        console.error('Error creating referrer XP:', referrerXpInsertError);
      } else {
        console.log('Referrer XP created with 50 XP');
      }
    }

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

    // Update new user XP using upsert
    const { data: newUserXp } = await supabaseClient
      .from('candidate_xp')
      .select('total_xp')
      .eq('candidate_id', newUserId)
      .maybeSingle();

    if (newUserXp) {
      const { error: newUserXpError } = await supabaseClient
        .from('candidate_xp')
        .update({ total_xp: newUserXp.total_xp + 25, updated_at: new Date().toISOString() })
        .eq('candidate_id', newUserId);
      
      if (newUserXpError) {
        console.error('Error updating new user XP:', newUserXpError);
      } else {
        console.log('New user XP updated:', newUserXp.total_xp + 25);
      }
    } else {
      const { error: newUserXpInsertError } = await supabaseClient
        .from('candidate_xp')
        .insert({
          candidate_id: newUserId,
          total_xp: 25,
          community_points: 0,
          level: 1
        });
      
      if (newUserXpInsertError) {
        console.error('Error creating new user XP:', newUserXpInsertError);
      } else {
        console.log('New user XP created with 25 XP');
      }
    }

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
