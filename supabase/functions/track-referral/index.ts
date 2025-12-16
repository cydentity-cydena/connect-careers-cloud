import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMMUNITY_BUILDER_BADGE_ID = 'cb7d8e9f-1a2b-4c3d-5e6f-7a8b9c0d1e2f';

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
    const { data: currentCode } = await supabaseClient
      .from('referral_codes')
      .select('uses_count')
      .eq('code', referralCode)
      .single();
    
    await supabaseClient
      .from('referral_codes')
      .update({ uses_count: (currentCode?.uses_count || 0) + 1 })
      .eq('code', referralCode);

    // Award points to referrer (50 XP per referral)
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
    const { data: referrerXp } = await supabaseClient
      .from('candidate_xp')
      .select('total_xp')
      .eq('candidate_id', codeData.user_id)
      .maybeSingle();

    if (referrerXp) {
      await supabaseClient
        .from('candidate_xp')
        .update({ total_xp: referrerXp.total_xp + 50, updated_at: new Date().toISOString() })
        .eq('candidate_id', codeData.user_id);
      console.log('Referrer XP updated:', referrerXp.total_xp + 50);
    } else {
      await supabaseClient
        .from('candidate_xp')
        .insert({
          candidate_id: codeData.user_id,
          total_xp: 50,
          community_points: 0,
          level: 1
        });
      console.log('Referrer XP created with 50 XP');
    }

    // Award welcome bonus to new user (25 XP)
    await supabaseClient
      .from('reward_points')
      .insert({
        candidate_id: newUserId,
        type: 'REFERRED_USER_BONUS',
        amount: 25,
        meta: { referrer: codeData.user_id }
      });

    const { data: newUserXp } = await supabaseClient
      .from('candidate_xp')
      .select('total_xp')
      .eq('candidate_id', newUserId)
      .maybeSingle();

    if (newUserXp) {
      await supabaseClient
        .from('candidate_xp')
        .update({ total_xp: newUserXp.total_xp + 25, updated_at: new Date().toISOString() })
        .eq('candidate_id', newUserId);
      console.log('New user XP updated:', newUserXp.total_xp + 25);
    } else {
      await supabaseClient
        .from('candidate_xp')
        .insert({
          candidate_id: newUserId,
          total_xp: 25,
          community_points: 0,
          level: 1
        });
      console.log('New user XP created with 25 XP');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CHECK FOR 2+ REFERRALS MILESTONE REWARDS
    // ═══════════════════════════════════════════════════════════════════════
    
    // Count total completed referrals for this referrer
    const { data: referralCount, error: countError } = await supabaseClient
      .from('referrals')
      .select('id', { count: 'exact' })
      .eq('referrer_id', codeData.user_id)
      .in('status', ['completed', 'rewarded']);

    const totalReferrals = referralCount?.length || 0;
    console.log('Total referrals for user:', totalReferrals);

    if (totalReferrals >= 2) {
      // Check if milestone reward already given
      const { data: existingMilestone } = await supabaseClient
        .from('reward_points')
        .select('id')
        .eq('candidate_id', codeData.user_id)
        .eq('type', 'REFERRAL_MILESTONE_2')
        .maybeSingle();

      if (!existingMilestone) {
        console.log('Awarding 2+ referrals milestone rewards!');

        // 1. Award 500 bonus XP
        await supabaseClient
          .from('reward_points')
          .insert({
            candidate_id: codeData.user_id,
            type: 'REFERRAL_MILESTONE_2',
            amount: 500,
            meta: { milestone: '2_referrals', total_referrals: totalReferrals }
          });

        // Update XP
        const { data: currentXp } = await supabaseClient
          .from('candidate_xp')
          .select('total_xp')
          .eq('candidate_id', codeData.user_id)
          .single();

        if (currentXp) {
          await supabaseClient
            .from('candidate_xp')
            .update({ 
              total_xp: currentXp.total_xp + 500, 
              updated_at: new Date().toISOString() 
            })
            .eq('candidate_id', codeData.user_id);
          console.log('Milestone 500 XP awarded. New total:', currentXp.total_xp + 500);
        }

        // 2. Award Community Builder badge
        const { data: existingBadge } = await supabaseClient
          .from('user_badges')
          .select('id')
          .eq('user_id', codeData.user_id)
          .eq('badge_id', COMMUNITY_BUILDER_BADGE_ID)
          .maybeSingle();

        if (!existingBadge) {
          await supabaseClient
            .from('user_badges')
            .insert({
              user_id: codeData.user_id,
              badge_id: COMMUNITY_BUILDER_BADGE_ID
            });
          console.log('Community Builder badge awarded');
        }

        // 3. Set featured profile for 7 days
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + 7);

        await supabaseClient
          .from('profiles')
          .update({ featured_until: featuredUntil.toISOString() })
          .eq('id', codeData.user_id);
        console.log('Featured profile until:', featuredUntil.toISOString());

        // 4. Send notification
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: codeData.user_id,
            type: 'achievement',
            title: '🎉 Referral Milestone Reached!',
            message: 'You referred 2+ people! You earned 500 bonus XP, the Community Builder badge, and a 7-day featured profile!',
            link: '/dashboard'
          });
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
