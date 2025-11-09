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
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only staff/admin allowed
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    if (rolesError) throw rolesError;

    const allowed = (roles || []).some((r: any) => ['admin', 'staff'].includes(String(r.role)));
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    let status = url.searchParams.get('status');
    try {
      const body = await req.json();
      if (!status && body?.status) status = String(body.status);
    } catch { /* no body */ }

    // Load verification requests (identity/rtw, candidates only)
    let query = supabaseAdmin
      .from('verification_requests')
      .select('id,candidate_id,verification_type,status,created_at,reviewed_at,reviewed_by,admin_comment,rejection_reason,document_urls,notes,company_name')
      .is('company_name', null)
      .in('verification_type', ['identity','rtw'])
      .order('created_at', { ascending: false });

    if (status && ['pending','approved','rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: reqs, error: reqsError } = await query;
    if (reqsError) throw reqsError;

    const items = (reqs as any[]) || [];

    // Fetch profiles for candidates
    const candidateIds = Array.from(new Set(items.map((r) => r.candidate_id).filter(Boolean)));
    let profilesById: Record<string, any> = {};
    if (candidateIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, username, email')
        .in('id', candidateIds);
      if (profilesError) throw profilesError;
      profilesById = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
    }

    const enriched = items.map((r) => ({
      ...r,
      profiles: profilesById[r.candidate_id] ?? null,
    }));

    return new Response(JSON.stringify({ items: enriched }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('verification-requests-list error', err);
    return new Response(JSON.stringify({ error: String((err as any)?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
