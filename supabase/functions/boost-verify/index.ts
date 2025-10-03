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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const completionId = url.pathname.split('/').pop();
    const { approve } = await req.json();

    if (!completionId) {
      return new Response(JSON.stringify({ error: 'Missing completion ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Admin ${user.id} ${approve ? 'approving' : 'rejecting'} completion ${completionId}`);

    // Get completion details
    const { data: completion, error: fetchError } = await supabase
      .from('course_completions')
      .select('*, partner_courses(*)')
      .eq('id', completionId)
      .single();

    if (fetchError || !completion) {
      return new Response(JSON.stringify({ error: 'Completion not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newStatus = approve ? 'VERIFIED' : 'REJECTED';
    let awardedPoints = null;

    // Award points if approved
    if (approve) {
      const course = completion.partner_courses;
      awardedPoints = course.reward_amount;

      await supabase.rpc('award_points', {
        p_candidate_id: completion.candidate_id,
        p_code: course.reward_code,
        p_meta: { 
          course_id: course.id, 
          course_title: course.title,
          verified_by: user.id
        }
      });
    }

    // Update completion
    const { error: updateError } = await supabase
      .from('course_completions')
      .update({
        status: newStatus,
        awarded_points: awardedPoints,
        verified_at: new Date().toISOString()
      })
      .eq('id', completionId);

    if (updateError) {
      console.error('Error updating completion:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Completion ${completionId} ${newStatus}`);

    return new Response(
      JSON.stringify({
        status: newStatus,
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
