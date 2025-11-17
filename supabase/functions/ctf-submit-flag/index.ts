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
    const authHeader = req.headers.get('Authorization')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user from the auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { challengeId, flag } = await req.json();

    if (!challengeId || !flag) {
      throw new Error('Missing challengeId or flag');
    }

    // Get the challenge
    const { data: challenge, error: challengeError } = await supabaseClient
      .from('ctf_challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      throw new Error('Challenge not found');
    }

    // Check if already solved
    const { data: existingSolved } = await supabaseClient
      .from('ctf_submissions')
      .select('id')
      .eq('candidate_id', user.id)
      .eq('challenge_id', challengeId)
      .eq('is_correct', true)
      .single();

    if (existingSolved) {
      return new Response(
        JSON.stringify({
          correct: false,
          message: 'You have already solved this challenge',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Verify the flag
    const isCorrect = flag.trim() === challenge.flag.trim();

    // Record the submission
    const { error: submissionError } = await supabaseClient
      .from('ctf_submissions')
      .upsert({
        candidate_id: user.id,
        challenge_id: challengeId,
        submitted_flag: flag,
        is_correct: isCorrect,
        points_awarded: isCorrect ? challenge.points : 0,
      }, {
        onConflict: 'candidate_id,challenge_id'
      });

    if (submissionError) {
      console.error('Submission error:', submissionError);
      throw submissionError;
    }

    // Award points if correct
    if (isCorrect) {
      const { error: pointsError } = await supabaseClient.rpc('award_points', {
        p_candidate_id: user.id,
        p_code: 'CTF_SOLVED',
        p_meta: JSON.stringify({
          challenge_id: challengeId,
          challenge_title: challenge.title,
          points: challenge.points,
        }),
      });

      if (pointsError) {
        console.error('Points error:', pointsError);
      }
    }

    return new Response(
      JSON.stringify({
        correct: isCorrect,
        pointsAwarded: isCorrect ? challenge.points : 0,
        message: isCorrect ? 'Congratulations!' : 'Incorrect flag',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('CTF submit error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to submit flag',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
