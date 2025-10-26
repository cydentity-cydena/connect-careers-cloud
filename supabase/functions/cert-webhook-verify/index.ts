import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

interface WebhookPayload {
  provider: 'comptia' | 'isc2' | 'cresta' | 'credly';
  candidateEmail: string;
  certificationName: string;
  issuer: string;
  credentialId: string;
  credentialUrl?: string;
  issueDate?: string;
  expiryDate?: string;
}

async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return signature === expectedSignature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const payloadText = await req.text();
    const payload: WebhookPayload = JSON.parse(payloadText);
    const signature = req.headers.get('x-webhook-signature');

    if (!signature) {
      throw new Error('Missing webhook signature');
    }

    // Get the appropriate signing secret
    let secret: string | undefined;
    switch (payload.provider) {
      case 'comptia':
        secret = Deno.env.get('WEBHOOK_SIGNING_SECRET_COMPTIA');
        break;
      case 'isc2':
        secret = Deno.env.get('WEBHOOK_SIGNING_SECRET_ISC2');
        break;
      case 'cresta':
        secret = Deno.env.get('WEBHOOK_SIGNING_SECRET_CRESTA');
        break;
      case 'credly':
        secret = Deno.env.get('WEBHOOK_SIGNING_SECRET_CREDLY');
        break;
    }

    if (!secret) {
      throw new Error(`No signing secret configured for provider: ${payload.provider}`);
    }

    // Verify signature
    const isValid = await verifyWebhookSignature(payloadText, signature, secret);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    console.log('Webhook signature verified for:', payload.provider);

    // Find candidate by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', payload.candidateEmail)
      .single();

    if (profileError || !profile) {
      throw new Error('Candidate not found');
    }

    const candidateId = profile.id;

    // Check if certification already exists
    const { data: existing } = await supabaseAdmin
      .from('certifications')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('credential_id', payload.credentialId)
      .maybeSingle();

    if (existing) {
      console.log('Certification already exists, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Certification already recorded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Create verified certification
    const { error: certError } = await supabaseAdmin
      .from('certifications')
      .insert({
        candidate_id: candidateId,
        name: payload.certificationName,
        issuer: payload.issuer,
        credential_id: payload.credentialId,
        credential_url: payload.credentialUrl,
        issue_date: payload.issueDate,
        expiry_date: payload.expiryDate,
        signed_webhook: true,
        webhook_provider: payload.provider,
        webhook_verified_at: new Date().toISOString(),
      });

    if (certError) {
      console.error('Error creating certification:', certError);
      throw certError;
    }

    // Award points via RPC
    const { data: pointsData, error: pointsError } = await supabaseAdmin.rpc('award_points', {
      p_candidate_id: candidateId,
      p_code: 'CERT_VENDOR_WEBHOOK_VERIFIED',
      p_meta: JSON.stringify({
        provider: payload.provider,
        name: payload.certificationName,
        credentialId: payload.credentialId
      })
    });

    if (pointsError) {
      console.error('Error awarding points:', pointsError);
    } else {
      console.log('Points awarded:', pointsData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Certification verified and points awarded',
        points: pointsData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Webhook verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Webhook verification failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
