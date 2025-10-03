import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AwardPointsRequest {
  candidateId: string;
  code: string;
  meta?: any;
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

    const { candidateId, code, meta }: AwardPointsRequest = await req.json();

    console.log('Awarding points:', { candidateId, code, meta });

    // Call the database function to award points
    const { data, error } = await supabaseAdmin.rpc('award_points', {
      p_candidate_id: candidateId,
      p_code: code,
      p_meta: meta ? JSON.stringify(meta) : null
    });

    if (error) {
      console.error('Error awarding points:', error);
      throw error;
    }

    console.log('Points awarded successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        ...data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Award points error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to award points',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
