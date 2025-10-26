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

    // Award community achievements
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

    await supabaseAdmin.rpc('check_and_award_achievements', {
      p_user_id: user.id,
      p_category: 'community',
      p_current_count: Math.max(endorsementCount, communityPoints)
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
          endorsements: endorsementCount,
          communityPoints
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