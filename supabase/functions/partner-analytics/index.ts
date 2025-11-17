import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin or partner
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roles || (roles.role !== "admin" && roles.role !== "staff")) {
      throw new Error("Unauthorized");
    }

    const url = new URL(req.url);
    const partnerSlug = url.searchParams.get("partner");
    const certName = url.searchParams.get("cert");
    const daysBack = parseInt(url.searchParams.get("days") || "365");

    console.log(`[PARTNER-ANALYTICS] Fetching analytics for partner: ${partnerSlug}, cert: ${certName}`);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Build cert filter
    let certFilter = certName ? `%${certName}%` : null;
    if (partnerSlug && !certName) {
      // If only partner specified, match common cert patterns
      certFilter = `%${partnerSlug}%`;
    }

    // 1. Get all candidates with this cert
    let certQuery = supabaseClient
      .from("certifications")
      .select("candidate_id, name, issuer, created_at, verification_status");

    if (certFilter) {
      certQuery = certQuery.or(`name.ilike.${certFilter},issuer.ilike.${certFilter}`);
    }

    const { data: certifications, error: certError } = await certQuery;
    if (certError) throw certError;

    const candidateIds = [...new Set(certifications?.map(c => c.candidate_id) || [])];
    
    console.log(`[PARTNER-ANALYTICS] Found ${candidateIds.length} candidates with matching certs`);

    // 2. Get placements for these candidates
    const { data: placements, error: placementsError } = await supabaseClient
      .from("placements")
      .select(`
        id,
        candidate_id,
        placement_date,
        position_title,
        salary_offered,
        employer_id
      `)
      .in("candidate_id", candidateIds.length > 0 ? candidateIds : ["00000000-0000-0000-0000-000000000000"])
      .gte("placement_date", startDate.toISOString());

    if (placementsError) throw placementsError;

    // 3. Get profile views for these candidates
    const { data: profileViews, error: viewsError } = await supabaseClient
      .from("profile_views")
      .select("candidate_id, viewed_at")
      .in("candidate_id", candidateIds.length > 0 ? candidateIds : ["00000000-0000-0000-0000-000000000000"])
      .gte("viewed_at", startDate.toISOString());

    if (viewsError) throw viewsError;

    // 4. Get profile unlocks for these candidates
    const { data: unlocks, error: unlocksError } = await supabaseClient
      .from("profile_unlocks")
      .select("candidate_id, unlocked_at")
      .in("candidate_id", candidateIds.length > 0 ? candidateIds : ["00000000-0000-0000-0000-000000000000"])
      .gte("unlocked_at", startDate.toISOString());

    if (unlocksError) throw unlocksError;

    // 5. Calculate metrics
    const totalCandidates = candidateIds.length;
    const totalPlacements = placements?.length || 0;
    const placementRate = totalCandidates > 0 
      ? Math.round((totalPlacements / totalCandidates) * 100) 
      : 0;

    const avgSalary = placements && placements.length > 0
      ? Math.round(
          placements
            .filter(p => p.salary_offered)
            .reduce((sum, p) => sum + (p.salary_offered || 0), 0) / 
          placements.filter(p => p.salary_offered).length
        )
      : 0;

    // Group by cert type
    const certBreakdown = certifications?.reduce((acc, cert) => {
      const name = cert.name;
      if (!acc[name]) {
        acc[name] = {
          count: 0,
          verified: 0,
          pending: 0,
        };
      }
      acc[name].count++;
      if (cert.verification_status === "verified") {
        acc[name].verified++;
      } else {
        acc[name].pending++;
      }
      return acc;
    }, {} as Record<string, { count: number; verified: number; pending: number; }>) || {};

    // Recent placements details
    const recentPlacements = placements?.slice(0, 10).map(p => ({
      position: p.position_title,
      date: p.placement_date,
      salary: p.salary_offered,
    })) || [];

    const analytics = {
      period: {
        days: daysBack,
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString(),
      },
      partner_info: {
        slug: partnerSlug,
        cert_filter: certName,
      },
      summary: {
        total_candidates_with_cert: totalCandidates,
        total_placements: totalPlacements,
        placement_rate_percent: placementRate,
        avg_salary: avgSalary,
        profile_views: profileViews?.length || 0,
        profile_unlocks: unlocks?.length || 0,
      },
      certification_breakdown: certBreakdown,
      engagement: {
        views_per_candidate: totalCandidates > 0 
          ? Math.round((profileViews?.length || 0) / totalCandidates * 10) / 10
          : 0,
        unlock_rate_percent: totalCandidates > 0
          ? Math.round(((unlocks?.length || 0) / totalCandidates) * 100)
          : 0,
      },
      recent_placements: recentPlacements,
      value_metrics: {
        total_hiring_value: placements
          ?.filter(p => p.salary_offered)
          .reduce((sum, p) => sum + (p.salary_offered || 0), 0) || 0,
        employer_connections: [...new Set(placements?.map(p => p.employer_id) || [])].length,
      },
    };

    console.log(`[PARTNER-ANALYTICS] Analytics calculated successfully`);

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[PARTNER-ANALYTICS] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
