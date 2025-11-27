import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const candidateId = url.pathname.split('/').pop();

    console.log('Getting verification for candidate:', candidateId);

    const { data: verification, error } = await supabase
      .from('candidate_verifications')
      .select('*')
      .eq('candidate_id', candidateId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    // Fetch certifications from certifications table
    const { data: certifications, error: certsError } = await supabase
      .from('certifications')
      .select('*')
      .eq('candidate_id', candidateId);

    if (certsError) {
      console.error('Error fetching certifications:', certsError);
    }

    // Format certifications for display
    const formattedCerts = (certifications || []).map(cert => {
      // Determine status based on verification_status first, then expiry
      let status = 'grey'; // Default to unverified
      
      // Check verification status first - this is the primary factor
      if (cert.verification_status === 'verified') {
        status = 'green';
        // Check expiry for verified certs
        if (cert.expiry_date) {
          const expiryDate = new Date(cert.expiry_date);
          const now = new Date();
          if (expiryDate < now) {
            status = 'grey'; // Expired even if verified
          } else if ((expiryDate.getTime() - now.getTime()) < (30 * 24 * 60 * 60 * 1000)) {
            status = 'amber'; // Expiring within 30 days
          }
        }
      } else if (cert.verification_status === 'pending') {
        status = 'amber'; // Pending review
      } else if (cert.verification_status === 'rejected') {
        status = 'red'; // Rejected
      }
      // Otherwise stays grey (unverified/not submitted)
      
      return {
        name: cert.name,
        issuer: cert.issuer || 'Unknown',
        status,
        issued_date: cert.issue_date,
        expiry_date: cert.expiry_date,
        credential_id: cert.credential_id,
        source: cert.source || 'manual',
        verification_status: cert.verification_status,
      };
    });

    // Merge certifications into verification data
    const enrichedVerification = verification ? {
      ...verification,
      certifications: formattedCerts,
      certifications_count: formattedCerts.length,
      verified_certifications_count: formattedCerts.filter(c => c.status === 'green').length,
    } : null;

    return new Response(
      JSON.stringify({ 
        verification: enrichedVerification,
        hrReady: verification?.hr_ready || false,
        certifications: formattedCerts,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in hrready-get:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});