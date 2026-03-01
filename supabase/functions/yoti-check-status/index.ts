import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub;

    const { verification_id, simulate_complete } = await req.json();
    if (!verification_id) {
      return new Response(JSON.stringify({ error: 'verification_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch the verification record
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from('yoti_verifications')
      .select('*')
      .eq('id', verification_id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !verification) {
      return new Response(JSON.stringify({ error: 'Verification not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ──────────────────────────────────────────────────────────────
    // MOCK: Simulate completion when requested
    // In production, this would poll Yoti's API:
    //   GET https://api.yoti.com/idverify/v1/sessions/{sessionId}
    // ──────────────────────────────────────────────────────────────
    if (simulate_complete && verification.status === 'pending') {
      const mockResult = verification.verification_type === 'identity'
        ? {
            check_type: 'identity',
            document_type: 'passport',
            full_name: 'Mock Verified User',
            nationality: 'GBR',
            date_of_birth: '1990-01-15',
            confidence_score: 0.98,
            liveness_check: 'passed',
          }
        : {
            check_type: 'rtw',
            rtw_status: 'citizen',
            country: 'GB',
            share_code_verified: true,
            valid_until: null, // Citizens have indefinite RTW
          };

      const updateData: Record<string, any> = {
        status: 'completed',
        result: mockResult,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (verification.verification_type === 'identity') {
        updateData.full_name_on_id = mockResult.full_name;
        updateData.document_type = mockResult.document_type;
        updateData.nationality = mockResult.nationality;
        updateData.date_of_birth = mockResult.date_of_birth;
      } else {
        updateData.rtw_status = mockResult.rtw_status;
      }

      const { error: updateError } = await supabaseAdmin
        .from('yoti_verifications')
        .update(updateData)
        .eq('id', verification_id);

      if (updateError) throw updateError;

      // Also update candidate_verifications if it exists
      if (verification.verification_type === 'identity') {
        await supabaseAdmin
          .from('candidate_verifications')
          .upsert({
            candidate_id: userId,
            identity_status: 'green',
            identity_method: 'yoti',
            identity_verifier: 'yoti_automated',
            identity_checked_at: new Date().toISOString(),
            identity_name_on_id: mockResult.full_name,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'candidate_id' });
      } else {
        await supabaseAdmin
          .from('candidate_verifications')
          .upsert({
            candidate_id: userId,
            rtw_status: 'green',
            rtw_country: 'GB',
            rtw_verifier: 'yoti_automated',
            rtw_checked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'candidate_id' });
      }

      return new Response(JSON.stringify({
        ...verification,
        ...updateData,
        result: mockResult,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if session expired
    if (verification.expires_at && new Date(verification.expires_at) < new Date() && verification.status === 'pending') {
      await supabaseAdmin
        .from('yoti_verifications')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', verification_id);

      return new Response(JSON.stringify({ ...verification, status: 'expired' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(verification), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('yoti-check-status error:', err);
    return new Response(JSON.stringify({ error: String((err as any)?.message ?? err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
