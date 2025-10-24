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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Running expiry check...');

    const now = new Date().toISOString();

    // Get all verifications
    const { data: verifications, error: fetchError } = await supabase
      .from('candidate_verifications')
      .select('*');

    if (fetchError) throw fetchError;

    let expiredCount = 0;

    for (const verification of verifications || []) {
      let needsUpdate = false;
      const updates: any = {};

      // Check identity expiry
      if (verification.identity_expires_at && verification.identity_expires_at < now && verification.identity_status !== 'grey') {
        updates.identity_status = 'grey';
        needsUpdate = true;
      }

      // Check RTW expiry
      if (verification.rtw_expires_at && verification.rtw_expires_at < now && verification.rtw_status !== 'grey') {
        updates.rtw_status = 'grey';
        needsUpdate = true;
      }

      // Check logistics expiry
      if (verification.logistics_expires_at && verification.logistics_expires_at < now && verification.logistics_status !== 'grey') {
        updates.logistics_status = 'grey';
        needsUpdate = true;
      }

      // Check certification expiry
      if (verification.certifications) {
        const certs = JSON.parse(verification.certifications);
        let certsUpdated = false;
        const updatedCerts = certs.map((cert: any) => {
          if (cert.expiresAt && cert.expiresAt < now && cert.status !== 'grey') {
            certsUpdated = true;
            return { ...cert, status: 'grey' };
          }
          return cert;
        });
        if (certsUpdated) {
          updates.certifications = JSON.stringify(updatedCerts);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        // Recompute HR Ready
        const idStatus = updates.identity_status || verification.identity_status;
        const rtwStatus = updates.rtw_status || verification.rtw_status;
        const logStatus = updates.logistics_status || verification.logistics_status;
        const certs = updates.certifications ? JSON.parse(updates.certifications) : JSON.parse(verification.certifications || '[]');

        const idOk = ['green', 'amber'].includes(idStatus);
        const certOk = certs.some((c: any) => ['green', 'amber'].includes(c.status));
        const rtwOk = ['green', 'amber'].includes(rtwStatus);
        const logOk = ['green', 'amber'].includes(logStatus);

        updates.hr_ready = idOk && certOk && rtwOk && logOk;
        updates.updated_at = now;

        const { error: updateError } = await supabase
          .from('candidate_verifications')
          .update(updates)
          .eq('id', verification.id);

        if (updateError) {
          console.error('Error updating verification:', updateError);
        } else {
          expiredCount++;
        }
      }
    }

    console.log(`Expiry check complete. Updated ${expiredCount} verifications.`);

    return new Response(
      JSON.stringify({ success: true, expiredCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in hrready-expire:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});