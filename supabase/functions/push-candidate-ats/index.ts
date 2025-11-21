import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { candidateId, atsConnectionId } = await req.json();

    console.log('Pushing candidate to ATS:', { candidateId, atsConnectionId });

    // Get ATS connection
    const { data: atsConnection, error: atsError } = await supabase
      .from('ats_connections')
      .select('*')
      .eq('id', atsConnectionId)
      .eq('user_id', user.id)
      .eq('active', true)
      .single();

    if (atsError || !atsConnection) {
      throw new Error('ATS connection not found or inactive');
    }

    // Fetch candidate data
    const candidateData = await fetchCandidateData(supabase, candidateId);

    let result;
    switch (atsConnection.provider) {
      case 'workday':
        result = await pushToWorkday(atsConnection, candidateData);
        break;
      case 'greenhouse':
        result = await pushToGreenhouse(atsConnection, candidateData);
        break;
      case 'lever':
        result = await pushToLever(atsConnection, candidateData);
        break;
      case 'bamboohr':
        result = await pushToBambooHR(atsConnection, candidateData);
        break;
      case 'bullhorn':
        result = await pushToBullhorn(atsConnection, candidateData);
        break;
      default:
        throw new Error(`Unsupported ATS provider: ${atsConnection.provider}`);
    }

    // Log the integration
    await supabase.from('integration_logs').insert({
      user_id: user.id,
      candidate_id: candidateId,
      integration_type: atsConnection.provider,
      integration_id: atsConnectionId,
      payload: candidateData,
      response: result,
      status: result.success ? 'success' : 'failed',
      error_message: result.error || null,
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error pushing to ATS:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function fetchCandidateData(supabase: any, candidateId: string) {
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

async function pushToWorkday(connection: any, candidateData: any) {
  try {
    const { api_url, username, password } = connection.credentials;
    
    const workdayPayload = {
      worker: {
        personalInfo: {
          name: candidateData.profile.full_name,
          email: candidateData.profile.email,
          location: candidateData.profile.location,
        },
        professionalInfo: {
          title: candidateData.candidate_profile?.title,
          experience: candidateData.work_history,
          education: candidateData.education,
          skills: candidateData.skills.map((s: any) => s.skills?.name),
          certifications: candidateData.certifications,
        },
        verifications: candidateData.verifications,
      },
    };

    const response = await fetch(`${api_url}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`),
      },
      body: JSON.stringify(workdayPayload),
    });

    const responseData = await response.json();
    
    return {
      success: response.ok,
      data: responseData,
      error: response.ok ? null : responseData.error || 'Workday API error',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function pushToGreenhouse(connection: any, candidateData: any) {
  try {
    const { api_key, api_url } = connection.credentials;
    
    const greenhousePayload = {
      first_name: candidateData.profile.full_name?.split(' ')[0] || '',
      last_name: candidateData.profile.full_name?.split(' ').slice(1).join(' ') || '',
      email_addresses: [{ value: candidateData.profile.email, type: 'personal' }],
      phone_numbers: candidateData.candidate_profile?.phone ? [{ value: candidateData.candidate_profile.phone, type: 'mobile' }] : [],
      addresses: candidateData.profile.location ? [{ value: candidateData.profile.location, type: 'home' }] : [],
      website_addresses: [],
      social_media_addresses: [],
      educations: candidateData.education.map((e: any) => ({
        school_name: e.institution,
        degree: e.degree,
        discipline: e.field_of_study,
        start_date: e.start_date,
        end_date: e.end_date,
      })),
      employments: candidateData.work_history.map((w: any) => ({
        company_name: w.company,
        title: w.role,
        start_date: w.start_date,
        end_date: w.end_date,
      })),
      tags: candidateData.skills.map((s: any) => s.skills?.name).filter(Boolean),
      custom_fields: {
        certifications: candidateData.certifications.map((c: any) => c.name).join(', '),
        hr_ready: candidateData.verifications?.hr_ready || false,
        compliance_score: candidateData.verifications?.compliance_score || 0,
      },
    };

    const response = await fetch(`${api_url || 'https://harvest.greenhouse.io/v1'}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${api_key}:`),
      },
      body: JSON.stringify(greenhousePayload),
    });

    const responseData = await response.json();
    
    return {
      success: response.ok,
      data: responseData,
      error: response.ok ? null : responseData.message || 'Greenhouse API error',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function pushToLever(connection: any, candidateData: any) {
  try {
    const { api_key } = connection.credentials;
    
    const leverPayload = {
      name: candidateData.profile.full_name,
      emails: [candidateData.profile.email],
      phones: candidateData.candidate_profile?.phone ? [{ value: candidateData.candidate_profile.phone }] : [],
      location: candidateData.profile.location,
      headline: candidateData.candidate_profile?.title,
      summary: candidateData.profile.bio,
      tags: candidateData.skills.map((s: any) => s.skills?.name).filter(Boolean),
    };

    const response = await fetch('https://api.lever.co/v1/candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
      },
      body: JSON.stringify(leverPayload),
    });

    const responseData = await response.json();
    
    return {
      success: response.ok,
      data: responseData,
      error: response.ok ? null : responseData.message || 'Lever API error',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function pushToBambooHR(connection: any, candidateData: any) {
  try {
    const { subdomain, api_key } = connection.credentials;
    
    const bambooPayload = {
      firstName: candidateData.profile.full_name?.split(' ')[0] || '',
      lastName: candidateData.profile.full_name?.split(' ').slice(1).join(' ') || '',
      email: candidateData.profile.email,
      phone: candidateData.candidate_profile?.phone,
      address: candidateData.profile.location,
      dateOfBirth: null,
      ssn: null,
      jobTitle: candidateData.candidate_profile?.title,
    };

    const response = await fetch(`https://api.bamboohr.com/api/gateway.php/${subdomain}/v1/applicants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${api_key}:x`),
      },
      body: JSON.stringify(bambooPayload),
    });

    const responseData = await response.json();
    
    return {
      success: response.ok,
      data: responseData,
      error: response.ok ? null : responseData.message || 'BambooHR API error',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function pushToBullhorn(connection: any, candidateData: any) {
  try {
    const { client_id, client_secret, username, password, api_url } = connection.credentials;
    
    // First, authenticate to get access token
    const authResponse = await fetch(`${api_url || 'https://rest.bullhornstaffing.com/rest-services'}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id,
        client_secret,
        username,
        password,
        grant_type: 'password',
      }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.json();
      throw new Error(`Bullhorn authentication failed: ${authError.error_description || 'Unknown error'}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    const restUrl = authData.restUrl;

    // Format candidate data for Bullhorn
    const bullhornPayload = {
      firstName: candidateData.profile.full_name?.split(' ')[0] || '',
      lastName: candidateData.profile.full_name?.split(' ').slice(1).join(' ') || '',
      email: candidateData.profile.email,
      phone: candidateData.candidate_profile?.phone,
      address: {
        address1: candidateData.profile.location || '',
      },
      description: candidateData.profile.bio,
      status: 'Active',
      // Work history
      employmentPreference: candidateData.candidate_profile?.work_mode_preference,
      // Skills as comma-separated
      skillList: candidateData.skills.map((s: any) => s.skills?.name).filter(Boolean).join(', '),
      // Education
      educationDegree: candidateData.education[0]?.degree || '',
      // Certifications in custom field or notes
      customText1: candidateData.certifications.map((c: any) => c.name).join(', '),
      // Desired title
      occupation: candidateData.candidate_profile?.title,
      // Experience years
      yearsExperience: candidateData.candidate_profile?.years_experience,
    };

    const response = await fetch(`${restUrl}/entity/Candidate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'BhRestToken': accessToken,
      },
      body: JSON.stringify(bullhornPayload),
    });

    const responseData = await response.json();
    
    return {
      success: response.ok,
      data: responseData,
      error: response.ok ? null : responseData.message || 'Bullhorn API error',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}