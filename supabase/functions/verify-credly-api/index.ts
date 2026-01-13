import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CredlyBadge {
  id: string;
  name: string;
  issued_at: string;
  expires_at: string | null;
  issuer: {
    name: string;
  };
  badge_template: {
    name: string;
    description: string;
  };
}

interface AccredibleCredential {
  id: number;
  name: string;
  issued_on: string;
  expired_on: string | null;
  issuer: string;
  url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { certificationId, credentialUrl, provider } = await req.json();
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the certification details
    const { data: certification, error: certError } = await supabaseAdmin
      .from('certifications')
      .select('*')
      .eq('id', certificationId)
      .single();

    if (certError || !certification) {
      throw new Error('Certification not found');
    }

    let verificationResult = {
      verified: false,
      provider: provider || 'unknown',
      details: {} as any,
      error: null as string | null
    };

    // Verify with Credly API
    if (provider === 'credly' || credentialUrl?.includes('credly.com')) {
      const credlyApiKey = Deno.env.get('CREDLY_API_KEY');
      
      if (!credlyApiKey) {
        console.log('Credly API key not configured, falling back to URL verification');
        // Fall back to URL-based verification
        verificationResult = await verifyCredlyByUrl(credentialUrl);
      } else {
        // Extract badge ID from URL
        const badgeIdMatch = credentialUrl?.match(/\/badges\/([a-f0-9-]+)/i);
        const badgeId = badgeIdMatch?.[1];

        if (badgeId) {
          try {
            const response = await fetch(
              `https://api.credly.com/v1/obi/v2/badge_assertions/${badgeId}`,
              {
                headers: {
                  'Authorization': `Bearer ${credlyApiKey}`,
                  'Accept': 'application/json'
                }
              }
            );

            if (response.ok) {
              const badgeData = await response.json();
              verificationResult = {
                verified: true,
                provider: 'credly',
                details: {
                  name: badgeData.badge?.name || certification.name,
                  issuer: badgeData.badge?.issuer?.name || certification.issuer,
                  issuedAt: badgeData.issuedOn,
                  expiresAt: badgeData.expires,
                  verificationUrl: credentialUrl
                },
                error: null
              };
            } else {
              console.log('Credly API returned non-OK status:', response.status);
              verificationResult.error = 'Badge not found in Credly';
            }
          } catch (apiError) {
            console.error('Credly API error:', apiError);
            // Fall back to URL verification
            verificationResult = await verifyCredlyByUrl(credentialUrl);
          }
        }
      }
    }

    // Verify with Accredible API
    if (provider === 'accredible' || credentialUrl?.includes('accredible.com') || credentialUrl?.includes('credential.net')) {
      const accredibleApiKey = Deno.env.get('ACCREDIBLE_API_KEY');
      
      if (!accredibleApiKey) {
        console.log('Accredible API key not configured');
        verificationResult.error = 'Accredible API not configured';
      } else {
        // Extract credential ID from URL
        const credIdMatch = credentialUrl?.match(/\/(\d+)(?:\/|$)/);
        const credId = credIdMatch?.[1];

        if (credId) {
          try {
            const response = await fetch(
              `https://api.accredible.com/v1/credentials/${credId}`,
              {
                headers: {
                  'Authorization': `Token ${accredibleApiKey}`,
                  'Accept': 'application/json'
                }
              }
            );

            if (response.ok) {
              const credData: { credential: AccredibleCredential } = await response.json();
              verificationResult = {
                verified: true,
                provider: 'accredible',
                details: {
                  name: credData.credential.name,
                  issuer: credData.credential.issuer,
                  issuedAt: credData.credential.issued_on,
                  expiresAt: credData.credential.expired_on,
                  verificationUrl: credData.credential.url || credentialUrl
                },
                error: null
              };
            } else {
              verificationResult.error = 'Credential not found in Accredible';
            }
          } catch (apiError) {
            console.error('Accredible API error:', apiError);
            verificationResult.error = 'Failed to verify with Accredible';
          }
        }
      }
    }

    // Update certification with verification result
    if (verificationResult.verified) {
      await supabaseAdmin
        .from('certifications')
        .update({
          verification_status: 'verified',
          webhook_provider: verificationResult.provider,
          webhook_verified_at: new Date().toISOString(),
          signed_webhook: true
        })
        .eq('id', certificationId);

      // Award points for verified certification
      await supabaseAdmin.rpc('award_points', {
        p_candidate_id: certification.candidate_id,
        p_code: 'CERT_VERIFIED',
        p_meta: { certification_id: certificationId, provider: verificationResult.provider }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        verification: verificationResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying certification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback URL-based verification for Credly
async function verifyCredlyByUrl(url: string): Promise<{
  verified: boolean;
  provider: string;
  details: any;
  error: string | null;
}> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        verified: false,
        provider: 'credly',
        details: {},
        error: 'Badge URL not accessible'
      };
    }

    const html = await response.text();
    
    // Check for valid Credly badge indicators
    const isValidBadge = html.includes('credly.com') && 
                         (html.includes('badge-template') || html.includes('issued'));
    
    if (isValidBadge) {
      // Extract meta information
      const nameMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
      const issuerMatch = html.match(/Issued by[:\s]+([^<\n]+)/i);
      
      return {
        verified: true,
        provider: 'credly',
        details: {
          name: nameMatch?.[1] || 'Unknown Badge',
          issuer: issuerMatch?.[1]?.trim() || 'Unknown Issuer',
          verificationUrl: url,
          verificationMethod: 'url_check'
        },
        error: null
      };
    }

    return {
      verified: false,
      provider: 'credly',
      details: {},
      error: 'Invalid Credly badge page'
    };
  } catch (error) {
    return {
      verified: false,
      provider: 'credly',
      details: {},
      error: 'Failed to verify URL'
    };
  }
}
