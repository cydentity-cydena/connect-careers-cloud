import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CandidateData {
  profile: any;
  candidate_profile: any;
  skills: any[];
  certifications: any[];
  work_history: any[];
  education: any[];
  verifications: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { candidateId, webhookId } = await req.json();

    console.log('Pushing candidate to webhook:', { candidateId, webhookId });

    // Get webhook configuration
    const { data: webhook, error: webhookError } = await supabase
      .from('webhook_integrations')
      .select('*')
      .eq('id', webhookId)
      .eq('user_id', user.id)
      .eq('active', true)
      .single();

    if (webhookError || !webhook) {
      throw new Error('Webhook not found or inactive');
    }

    // Fetch candidate data
    const candidateData = await fetchCandidateData(supabase, candidateId);

    // Push to webhook
    const webhookResponse = await fetch(webhook.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TrecCert-Integration/1.0',
      },
      body: JSON.stringify({
        event: 'candidate_verified',
        timestamp: new Date().toISOString(),
        data: candidateData,
      }),
    });

    const responseText = await webhookResponse.text();
    const isSuccess = webhookResponse.ok;

    // Log the integration
    await supabase.from('integration_logs').insert({
      user_id: user.id,
      candidate_id: candidateId,
      integration_type: 'webhook',
      integration_id: webhookId,
      payload: candidateData,
      response: { status: webhookResponse.status, body: responseText },
      status: isSuccess ? 'success' : 'failed',
      error_message: isSuccess ? null : `HTTP ${webhookResponse.status}: ${responseText}`,
    });

    return new Response(
      JSON.stringify({
        success: isSuccess,
        message: isSuccess ? 'Candidate pushed successfully' : 'Webhook push failed',
        response: { status: webhookResponse.status, body: responseText },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error pushing to webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function fetchCandidateData(supabase: any, candidateId: string): Promise<CandidateData> {
  const [profile, candidateProfile, skills, certs, workHistory, education, verifications] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', candidateId).single(),
    supabase.from('candidate_profiles').select('*').eq('user_id', candidateId).single(),
    supabase.from('candidate_skills').select('*, skills(*)').eq('candidate_id', candidateId),
    supabase.from('certifications').select('*').eq('candidate_id', candidateId),
    supabase.from('work_history').select('*').eq('candidate_id', candidateId),
    supabase.from('education').select('*').eq('candidate_id', candidateId),
    supabase.from('candidate_verifications').select('*').eq('candidate_id', candidateId).single(),
  ]);

  return {
    profile: profile.data,
    candidate_profile: candidateProfile.data,
    skills: skills.data || [],
    certifications: certs.data || [],
    work_history: workHistory.data || [],
    education: education.data || [],
    verifications: verifications.data,
  };
}