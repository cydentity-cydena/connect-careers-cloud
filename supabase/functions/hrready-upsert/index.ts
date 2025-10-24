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
    const body = await req.json();

    console.log('Upserting verification for candidate:', candidateId);

    // Prepare the update object
    const updateData: any = { candidate_id: candidateId };

    if (body.identity) {
      updateData.identity_status = body.identity.status;
      updateData.identity_method = body.identity.method;
      updateData.identity_check_id = body.identity.checkId;
      updateData.identity_name_on_id = body.identity.nameOnId;
      updateData.identity_verifier = body.identity.verifier;
      updateData.identity_checked_at = body.identity.checkedAt;
      updateData.identity_expires_at = body.identity.expiresAt;
    }

    if (body.certification) {
      updateData.certifications = JSON.stringify(body.certification);
    }

    if (body.rightToWork) {
      updateData.rtw_status = body.rightToWork.status;
      updateData.rtw_country = body.rightToWork.country;
      updateData.rtw_restriction_notes = body.rightToWork.restrictionNotes;
      updateData.rtw_checked_at = body.rightToWork.checkedAt;
      updateData.rtw_expires_at = body.rightToWork.expiresAt;
      updateData.rtw_verifier = body.rightToWork.verifier;
    }

    if (body.logistics) {
      updateData.logistics_status = body.logistics.status;
      updateData.logistics_location = body.logistics.location;
      updateData.logistics_commute_radius_km = body.logistics.commuteRadiusKm;
      updateData.logistics_notice_days = body.logistics.noticeDays;
      updateData.logistics_salary_band = body.logistics.salaryBand;
      updateData.logistics_work_mode = body.logistics.workMode;
      updateData.logistics_interview_slots = JSON.stringify(body.logistics.interviewSlots || []);
      updateData.logistics_confirmed_at = body.logistics.confirmedAt;
      updateData.logistics_expires_at = body.logistics.expiresAt;
    }

    // Upsert the verification
    const { data: verification, error: upsertError } = await supabase
      .from('candidate_verifications')
      .upsert(updateData, { onConflict: 'candidate_id' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    // Compute HR Ready status
    const idOk = ['green', 'amber'].includes(verification.identity_status || 'grey');
    const certOk = verification.certifications && 
      JSON.parse(verification.certifications).some((c: any) => ['green', 'amber'].includes(c.status));
    const rtwOk = ['green', 'amber'].includes(verification.rtw_status || 'grey');
    const logOk = ['green', 'amber'].includes(verification.logistics_status || 'grey');
    const hrReady = idOk && certOk && rtwOk && logOk;

    // Calculate compliance score (identity 5, certs 7, rtw 5, logistics 3)
    let complianceScore = 0;
    if (verification.identity_status === 'green') complianceScore += 5;
    else if (verification.identity_status === 'amber') complianceScore += 3;

    if (certOk) {
      const certs = JSON.parse(verification.certifications);
      const greenCerts = certs.filter((c: any) => c.status === 'green').length;
      complianceScore += Math.min(greenCerts * 2, 7);
    }

    if (verification.rtw_status === 'green') complianceScore += 5;
    else if (verification.rtw_status === 'amber') complianceScore += 3;

    if (verification.logistics_status === 'green') complianceScore += 3;
    else if (verification.logistics_status === 'amber') complianceScore += 2;

    // Update with computed values
    const { data: updated, error: updateError } = await supabase
      .from('candidate_verifications')
      .update({ 
        hr_ready: hrReady, 
        compliance_score: complianceScore,
        updated_at: new Date().toISOString()
      })
      .eq('candidate_id', candidateId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Also update the candidate_pipeline compliance_score
    await supabase
      .from('candidate_pipeline')
      .update({ compliance_score: complianceScore })
      .eq('candidate_id', candidateId);

    console.log('Verification updated successfully:', { hrReady, complianceScore });

    return new Response(
      JSON.stringify({ success: true, verification: updated, hrReady, complianceScore }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in hrready-upsert:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});