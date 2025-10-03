import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching boost courses for candidate ${user.id}`);

    // Get candidate XP for points balance
    const { data: xpData } = await supabase
      .from('candidate_xp')
      .select('points_balance')
      .eq('candidate_id', user.id)
      .single();

    const pointsBalance = xpData?.points_balance || 0;

    // Get candidate skills for personalization
    const { data: skillsData } = await supabase
      .from('candidate_skills')
      .select('skill_id, skills(name)')
      .eq('candidate_id', user.id);

    // Get completed courses to filter out
    const { data: completedData } = await supabase
      .from('course_completions')
      .select('partner_course_id')
      .eq('candidate_id', user.id);

    const completedCourseIds = completedData?.map(c => c.partner_course_id) || [];

    // Fetch active courses not yet completed
    let query = supabase
      .from('partner_courses')
      .select('*')
      .eq('active', true);
    
    // Only filter out completed courses if there are any
    if (completedCourseIds.length > 0) {
      query = query.not('id', 'in', `(${completedCourseIds.join(',')})`);
    }
    
    const { data: courses, error: coursesError } = await query;

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return new Response(JSON.stringify({ error: coursesError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simple personalization: recommend based on skills
    let recommendedSkill = null;
    if (skillsData && skillsData.length > 0 && skillsData[0].skills) {
      const skillInfo = skillsData[0].skills as any;
      recommendedSkill = skillInfo.name || null;
    }

    console.log(`Found ${courses?.length || 0} available courses for candidate`);

    return new Response(
      JSON.stringify({
        pointsBalance,
        recommendedSkill,
        items: courses || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
