import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Backfilling achievements for user:', user.id);

    // Check profile completion
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: candidateProfile } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: resumes } = await supabaseAdmin
      .from('candidate_resumes')
      .select('id')
      .eq('candidate_id', user.id);

    let profileScore = 0;
    if (profile?.full_name) profileScore += 10;
    if (profile?.bio) profileScore += 10;
    if (profile?.location) profileScore += 10;
    if (profile?.avatar_url) profileScore += 10;
    if (candidateProfile?.title) profileScore += 10;
    if (candidateProfile?.years_experience > 0) profileScore += 10;
    if (candidateProfile?.linkedin_url) profileScore += 10;
    if (resumes && resumes.length > 0) profileScore += 10;

    const { data: skills } = await supabaseAdmin
      .from('candidate_skills')
      .select('id')
      .eq('candidate_id', user.id);

    const { data: certs } = await supabaseAdmin
      .from('certifications')
      .select('id')
      .eq('candidate_id', user.id);

    if (skills && skills.length > 0) profileScore += 10;
    if (certs && certs.length > 0) profileScore += 10;

    // Award profile achievements
    await supabaseAdmin.rpc('check_and_award_achievements', {
      p_user_id: user.id,
      p_category: 'profile',
      p_current_count: profileScore
    });

    // Award skill achievements
    const skillCount = skills?.length || 0;
    await supabaseAdmin.rpc('check_and_award_achievements', {
      p_user_id: user.id,
      p_category: 'skills',
      p_current_count: skillCount
    });

    // Award certification achievements
    const certCount = certs?.length || 0;
    await supabaseAdmin.rpc('check_and_award_achievements', {
      p_user_id: user.id,
      p_category: 'certifications',
      p_current_count: certCount
    });

    // Award training achievements
    const { data: trainings } = await supabaseAdmin
      .from('course_completions')
      .select('id')
      .eq('candidate_id', user.id)
      .eq('status', 'VERIFIED');

    const trainingCount = trainings?.length || 0;
    await supabaseAdmin.rpc('check_and_award_achievements', {
      p_user_id: user.id,
      p_category: 'training',
      p_current_count: trainingCount
    });

    // Get community activity counts - each type separately
    const { data: posts } = await supabaseAdmin
      .from('activity_feed')
      .select('id')
      .eq('user_id', user.id);
    const postCount = posts?.length || 0;

    const { data: comments } = await supabaseAdmin
      .from('post_comments')
      .select('id')
      .eq('user_id', user.id);
    const commentCount = comments?.length || 0;

    const { data: reactions } = await supabaseAdmin
      .from('post_reactions')
      .select('id')
      .eq('user_id', user.id);
    const reactionCount = reactions?.length || 0;

    const { data: endorsements } = await supabaseAdmin
      .from('peer_endorsements')
      .select('id')
      .eq('to_user_id', user.id);
    const endorsementCount = endorsements?.length || 0;

    const { data: xp } = await supabaseAdmin
      .from('candidate_xp')
      .select('community_points')
      .eq('candidate_id', user.id)
      .maybeSingle();
    const communityPoints = xp?.community_points || 0;

    // Get all community achievements
    const { data: communityAchievements } = await supabaseAdmin
      .from('achievements')
      .select('id, name, requirement_value')
      .eq('category', 'community');

    // Get user's already earned achievements
    const { data: earnedAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);
    
    const earnedIds = new Set(earnedAchievements?.map(a => a.achievement_id) || []);

    // Award community achievements based on specific criteria
    const achievementsToAward: string[] = [];
    
    for (const achievement of (communityAchievements || [])) {
      if (earnedIds.has(achievement.id)) continue; // Already earned
      
      const name = achievement.name.toLowerCase();
      const req = achievement.requirement_value || 0;
      let shouldAward = false;

      // Post-related achievements
      if (name.includes('first post') || name === 'conversation starter' || 
          name === 'prolific poster' || name === 'community leader' || 
          name === 'community voice') {
        if (name === 'first post' && postCount >= 1) shouldAward = true;
        else if (name === 'conversation starter' && postCount >= req) shouldAward = true;
        else if (name === 'prolific poster' && postCount >= req) shouldAward = true;
        else if (name === 'community leader' && postCount >= req) shouldAward = true;
        else if (name === 'community voice' && postCount >= req) shouldAward = true;
      }
      // Comment-related achievements
      else if (name.includes('first comment') || name === 'active commenter' || 
               name === 'discussion enthusiast' || name === 'discussion master') {
        if (name === 'first comment' && commentCount >= 1) shouldAward = true;
        else if (name === 'active commenter' && commentCount >= req) shouldAward = true;
        else if (name === 'discussion enthusiast' && commentCount >= req) shouldAward = true;
        else if (name === 'discussion master' && commentCount >= req) shouldAward = true;
      }
      // Reaction-related achievements
      else if (name.includes('first reaction') || name === 'engaged member' || 
               name === 'super supporter' || name === 'community champion') {
        if (name === 'first reaction' && reactionCount >= 1) shouldAward = true;
        else if (name === 'engaged member' && reactionCount >= req) shouldAward = true;
        else if (name === 'super supporter' && reactionCount >= req) shouldAward = true;
        else if (name === 'community champion' && reactionCount >= req) shouldAward = true;
      }
      // Endorsement-related achievements
      else if (name === 'rising star') {
        if (endorsementCount >= req) shouldAward = true;
      }
      // Community points achievements - only the specific one
      else if (name === 'community leader' && achievement.requirement_value === 1000) {
        if (communityPoints >= req) shouldAward = true;
      }
      // Skip achievements that require specific actions we can't verify
      // (Popular Post, Viral Content, Mentor, Community Helper, Knowledge Sharer)
      
      if (shouldAward) {
        achievementsToAward.push(achievement.id);
      }
    }

    // Award the achievements
    for (const achievementId of achievementsToAward) {
      await supabaseAdmin
        .from('user_achievements')
        .upsert({
          user_id: user.id,
          achievement_id: achievementId,
          earned_at: new Date().toISOString()
        }, { onConflict: 'user_id,achievement_id' });
    }

    console.log('Backfill completed:', {
      postCount,
      commentCount,
      reactionCount,
      endorsementCount,
      communityPoints,
      achievementsAwarded: achievementsToAward.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Achievement backfill completed',
        counts: {
          profile: profileScore,
          skills: skillCount,
          certifications: certCount,
          training: trainingCount,
          posts: postCount,
          comments: commentCount,
          reactions: reactionCount,
          endorsements: endorsementCount,
          communityPoints,
          achievementsAwarded: achievementsToAward.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Backfill error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to backfill achievements',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
