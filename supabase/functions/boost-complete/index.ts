import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenBadge validation helper
async function validateOpenBadge(badgeData: any, userEmail: string): Promise<{
  success: boolean;
  message: string;
  issuer?: string;
  badgeName?: string;
}> {
  try {
    // Support both OpenBadge 2.0 and 3.0 formats
    
    // Check for required fields
    if (!badgeData || typeof badgeData !== 'object') {
      return { success: false, message: 'Invalid badge data format' };
    }

    // Extract badge details (supports multiple formats)
    const badge = badgeData.badge || badgeData;
    const recipient = badgeData.recipient || badgeData.credentialSubject;
    const issuer = badgeData.issuer || badge.issuer || badgeData.issuer?.name;
    const badgeName = badge.name || badge.title || badgeData.name || badgeData.credentialSubject?.achievement?.name;
    
    // Validate issuer exists
    if (!issuer) {
      return { success: false, message: 'Missing issuer information' };
    }

    // Validate badge name exists
    if (!badgeName) {
      return { success: false, message: 'Missing badge/certification name' };
    }

    // Extract recipient identity (email)
    let recipientEmail = null;
    
    if (recipient) {
      // OpenBadge 2.0 format
      if (recipient.identity) {
        recipientEmail = recipient.identity.toLowerCase();
        // Remove mailto: prefix if present
        if (recipientEmail.startsWith('mailto:')) {
          recipientEmail = recipientEmail.substring(7);
        }
        // Handle hashed identities
        if (recipient.type === 'email' && recipient.hashed === false) {
          recipientEmail = recipient.identity.toLowerCase();
        }
      }
      // OpenBadge 3.0 / Verifiable Credentials format
      else if (recipient.id) {
        recipientEmail = recipient.id.toLowerCase();
        if (recipientEmail.startsWith('mailto:')) {
          recipientEmail = recipientEmail.substring(7);
        }
      }
    }

    // Verify recipient email matches user (optional - some badges don't include recipient)
    if (recipientEmail) {
      const normalizedUserEmail = userEmail.toLowerCase().trim();
      const normalizedRecipientEmail = recipientEmail.toLowerCase().trim();
      
      if (normalizedUserEmail !== normalizedRecipientEmail) {
        return { 
          success: false, 
          message: `Badge recipient (${recipientEmail}) doesn't match your account (${userEmail})` 
        };
      }
    } else {
      console.log('Warning: Badge does not contain recipient email for validation');
    }

    // Check for verification (optional but good practice)
    if (badgeData.verification || badgeData.proof) {
      console.log('Badge contains verification proof');
    }

    const issuerName = typeof issuer === 'string' ? issuer : (issuer.name || 'Unknown');
    
    return {
      success: true,
      message: `Verified badge from ${issuerName}`,
      issuer: issuerName,
      badgeName: badgeName
    };
  } catch (error) {
    console.error('OpenBadge validation error:', error);
    return { 
      success: false, 
      message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

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
    if (authError || !user || !user.email) {
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

    // Check for existing completion
    const { data: existing } = await supabase
      .from('course_completions')
      .select('id, status')
      .eq('candidate_id', user.id)
      .eq('partner_course_id', partnerCourseId)
      .maybeSingle();

    // Block only if already submitted/verified/rejected (not in_progress or enrollment)
    if (existing && existing.status !== 'in_progress') {
      const errorMessage = existing.status === 'PENDING' 
        ? 'Your submission is already pending review' 
        : existing.status === 'VERIFIED'
        ? 'This course has already been verified'
        : 'You have already submitted this course';
      
      console.log(`Blocking duplicate submission: ${errorMessage}`);
      
      // Return 200 with error in body so Supabase SDK can read it
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: existing.status
        }), 
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const existingRecordId = existing?.id;

    // Auto-verify OpenBadge if valid URL provided, screenshots go to manual review
    let status = 'PENDING';
    let awardedPoints = null;
    let validationMessage = null;
    
    if (proofType === 'screenshot') {
      status = 'PENDING';
      validationMessage = 'Screenshot submitted - pending manual review';
    } else if (proofType === 'openbadge' && proofUrl) {
      console.log(`Validating OpenBadge URL: ${proofUrl}`);
      
      try {
        // Fetch the badge data
        const response = await fetch(proofUrl, {
          headers: { 'Accept': 'application/json, application/ld+json' }
        });
        
        if (!response.ok) {
          console.warn(`Badge URL returned ${response.status}`);
          validationMessage = `Badge URL not accessible (HTTP ${response.status})`;
        } else {
          const badgeData = await response.json();
          console.log('Badge data received:', JSON.stringify(badgeData).substring(0, 200));
          
          // Validate OpenBadge structure
          const isValid = await validateOpenBadge(badgeData, user.email);
          
          if (isValid.success) {
            status = 'VERIFIED';
            awardedPoints = course.reward_amount;
            validationMessage = `Auto-verified: ${isValid.message}`;
            
            console.log(`OpenBadge validated successfully for ${user.email}`);
            
            // Award points immediately via service role
            const serviceClient = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );

            await serviceClient.rpc('award_points', {
              p_candidate_id: user.id,
              p_code: course.reward_code,
              p_meta: { 
                course_id: partnerCourseId, 
                course_title: course.title,
                badge_issuer: isValid.issuer,
                badge_name: isValid.badgeName
              }
            });
          } else {
            console.warn('Badge validation failed:', isValid.message);
            validationMessage = `Validation failed: ${isValid.message}`;
          }
        }
      } catch (error) {
        console.warn('Badge verification error:', error);
        validationMessage = `Error fetching badge: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    // Insert completion using service role to bypass RLS
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let completion;
    let insertError;

    if (existingRecordId) {
      // Update existing in_progress record
      const { data, error } = await serviceClient
        .from('course_completions')
        .update({
          proof_type: proofType,
          proof_url: proofUrl || null,
          status,
          awarded_points: awardedPoints,
          verified_at: status === 'VERIFIED' ? new Date().toISOString() : null
        })
        .eq('id', existingRecordId)
        .select()
        .single();
      completion = data;
      insertError = error;
    } else {
      // Insert new record
      const { data, error } = await serviceClient
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
      completion = data;
      insertError = error;
    }

    if (insertError) {
      console.error('Error creating/updating completion:', insertError);
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
        awardedPoints,
        validationMessage: validationMessage || (status === 'VERIFIED' ? 'Badge verified successfully' : 'Pending manual review')
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
