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

    const { verification_type } = await req.json();
    if (!verification_type || !['identity', 'rtw'].includes(verification_type)) {
      return new Response(JSON.stringify({ error: 'Invalid verification_type. Must be "identity" or "rtw".' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if there's already a pending/in_progress session for this user+type
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: existing } = await supabaseAdmin
      .from('yoti_verifications')
      .select('id, session_id, qr_code_url, status, expires_at')
      .eq('user_id', userId)
      .eq('verification_type', verification_type)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // If existing non-expired session, return it
    if (existing && existing.expires_at && new Date(existing.expires_at) > new Date()) {
      return new Response(JSON.stringify({
        session_id: existing.session_id,
        qr_code_url: existing.qr_code_url,
        verification_id: existing.id,
        status: existing.status,
        expires_at: existing.expires_at,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ──────────────────────────────────────────────────────────────
    // MOCK: Generate a fake Yoti session
    // In production, this would call Yoti's IDV API:
    //   POST https://api.yoti.com/idverify/v1/sessions
    // ──────────────────────────────────────────────────────────────
    const mockSessionId = `yoti_session_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

    // Mock QR code URL — in production this comes from Yoti's response
    // Using a QR code generator to show the session ID
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=yoti-verify:${mockSessionId}`;

    // Create verification record
    const { data: verification, error: insertError } = await supabaseAdmin
      .from('yoti_verifications')
      .insert({
        user_id: userId,
        verification_type,
        session_id: mockSessionId,
        qr_code_url: qrCodeUrl,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      session_id: mockSessionId,
      qr_code_url: qrCodeUrl,
      verification_id: verification.id,
      status: 'pending',
      expires_at: expiresAt,
      mock: true, // Flag so UI knows this is a mock
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('yoti-create-session error:', err);
    return new Response(JSON.stringify({ error: String((err as any)?.message ?? err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
