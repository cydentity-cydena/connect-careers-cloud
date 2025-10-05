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

    // First, try to fetch paid boost placements
    const now = new Date().toISOString();
    
    let boostQuery = supabase
      .from('partner_courses')
      .select('*')
      .eq('active', true)
      .eq('boost_featured', true)
      .eq('boost_payment_status', 'completed')
      .lte('boost_start_date', now)
      .gte('boost_end_date', now);
    
    if (completedCourseIds.length > 0) {
      boostQuery = boostQuery.not('id', 'in', `(${completedCourseIds.join(',')})`);
    }
    
    const { data: boostCourses } = await boostQuery;

    // If no paid boosts, fall back to showing regular active courses
    let courses = boostCourses;
    
    if (!boostCourses || boostCourses.length === 0) {
      console.log('No paid boosts found, fetching regular active courses');
      let fallbackQuery = supabase
        .from('partner_courses')
        .select('*')
        .eq('active', true)
        .limit(6); // Show up to 6 example courses
      
      if (completedCourseIds.length > 0) {
        fallbackQuery = fallbackQuery.not('id', 'in', `(${completedCourseIds.join(',')})`);
      }
      
      const { data: fallbackCourses, error: coursesError } = await fallbackQuery;
      
      if (coursesError) {
        console.error('Error fetching fallback courses:', coursesError);
        return new Response(JSON.stringify({ error: coursesError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      courses = fallbackCourses;
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
