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

    const { partnerCourseId, proofType, proofUrl } = await req.json();

    if (!partnerCourseId || !proofType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Creating course completion for candidate ${user.id}, course ${partnerCourseId}`);

    // Get the course details
    const { data: course, error: courseError } = await supabase
      .from('partner_courses')
      .select('*')
      .eq('id', partnerCourseId)
      .single();

    if (courseError || !course) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('course_completions')
      .select('id, status')
      .eq('candidate_id', user.id)
      .eq('partner_course_id', partnerCourseId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          error: 'You have already submitted this course',
          status: existing.status
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Auto-verify OpenBadge if valid URL provided
    let status = 'PENDING';
    let awardedPoints = null;
    
    if (proofType === 'openbadge' && proofUrl) {
      // Simple validation: check if URL is accessible
      try {
        const response = await fetch(proofUrl);
        if (response.ok) {
          status = 'VERIFIED';
          awardedPoints = course.reward_amount;
          
          // Award points immediately via service role
          const serviceClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );

          await serviceClient.rpc('award_points', {
            p_candidate_id: user.id,
            p_code: course.reward_code,
            p_meta: { course_id: partnerCourseId, course_title: course.title }
          });
        }
      } catch (error) {
        console.warn('Badge verification failed:', error);
      }
    }

    // Insert completion
    const { data: completion, error: insertError } = await supabase
      .from('course_completions')
      .insert({
        candidate_id: user.id,
        partner_course_id: partnerCourseId,
        proof_type: proofType,
        proof_url: proofUrl || null,
        status,
        awarded_points: awardedPoints,
        verified_at: status === 'VERIFIED' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating completion:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Course completion created: ${completion.id}, status: ${status}`);

    return new Response(
      JSON.stringify({
        completionId: completion.id,
        status,
        awardedPoints
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
