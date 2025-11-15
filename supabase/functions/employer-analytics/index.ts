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

    console.log(`[EMPLOYER-ANALYTICS] Fetching analytics for user ${user.id}`);

    // Get date range from query params (default to last 90 days)
    const url = new URL(req.url);
    const daysBack = parseInt(url.searchParams.get("days") || "90");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // 1. Total active jobs
    const { data: jobs, error: jobsError } = await supabaseClient
      .from("jobs")
      .select("id, created_at, title")
      .eq("created_by", user.id)
      .eq("is_active", true);

    if (jobsError) throw jobsError;
    console.log(`[EMPLOYER-ANALYTICS] Found ${jobs?.length || 0} active jobs`);

    // 2. Total applications received
    const { data: applications, error: appsError } = await supabaseClient
      .from("applications")
      .select(`
        id,
        applied_at,
        stage,
        job_id,
        candidate_id,
        jobs!inner(created_by)
      `)
      .eq("jobs.created_by", user.id)
      .gte("applied_at", startDate.toISOString());

    if (appsError) throw appsError;
    console.log(`[EMPLOYER-ANALYTICS] Found ${applications?.length || 0} applications`);

    // 3. Hires made through platform
    const { data: placements, error: placementsError } = await supabaseClient
      .from("placements")
      .select(`
        id,
        placement_date,
        start_date,
        position_title,
        salary_offered,
        candidate_id,
        job_id
      `)
      .eq("employer_id", user.id)
      .gte("placement_date", startDate.toISOString());

    if (placementsError) throw placementsError;
    console.log(`[EMPLOYER-ANALYTICS] Found ${placements?.length || 0} placements`);

    // 4. Profile unlocks (talent viewed)
    const { data: unlocks, error: unlocksError } = await supabaseClient
      .from("profile_unlocks")
      .select("id, unlocked_at, candidate_id")
      .eq("employer_id", user.id)
      .gte("unlocked_at", startDate.toISOString());

    if (unlocksError) throw unlocksError;

    // 5. Calculate time-to-hire metrics
    const timeToHireData = [];
    for (const placement of placements || []) {
      // Find matching application
      const matchingApp = applications?.find(
        (app) => app.candidate_id === placement.candidate_id &&
                 app.job_id === placement.job_id
      );

      if (matchingApp) {
        const appliedDate = new Date(matchingApp.applied_at);
        const hiredDate = new Date(placement.placement_date);
        const daysToHire = Math.floor(
          (hiredDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        timeToHireData.push({
          position: placement.position_title,
          days: daysToHire,
          hired_date: placement.placement_date,
        });
      }
    }

    const avgTimeToHire = timeToHireData.length > 0
      ? Math.round(
          timeToHireData.reduce((sum, item) => sum + item.days, 0) / timeToHireData.length
        )
      : 0;

    // 6. Application stage conversion rates
    const stageBreakdown = {
      applied: applications?.length || 0,
      screening: applications?.filter((a) => a.stage === "screening").length || 0,
      interview: applications?.filter((a) => a.stage === "interview").length || 0,
      offer: applications?.filter((a) => a.stage === "offer").length || 0,
      hired: placements?.length || 0,
      rejected: applications?.filter((a) => a.stage === "rejected").length || 0,
    };

    const conversionRates = {
      application_to_screening: stageBreakdown.applied > 0
        ? Math.round((stageBreakdown.screening / stageBreakdown.applied) * 100)
        : 0,
      application_to_interview: stageBreakdown.applied > 0
        ? Math.round((stageBreakdown.interview / stageBreakdown.applied) * 100)
        : 0,
      application_to_hire: stageBreakdown.applied > 0
        ? Math.round((stageBreakdown.hired / stageBreakdown.applied) * 100)
        : 0,
    };

    // 7. Recent activity summary
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentActivity = {
      applications: applications?.filter(
        (a) => new Date(a.applied_at) >= last30Days
      ).length || 0,
      unlocks: unlocks?.filter(
        (u) => new Date(u.unlocked_at) >= last30Days
      ).length || 0,
      hires: placements?.filter(
        (p) => new Date(p.placement_date) >= last30Days
      ).length || 0,
    };

    // 8. ROI Calculations (industry benchmarks)
    const industryAvgTimeToHire = 42; // days (industry average)
    const industryAvgCostPerHire = 4000; // USD (industry average)
    const estimatedSavingsPerHire = avgTimeToHire < industryAvgTimeToHire
      ? Math.round(((industryAvgTimeToHire - avgTimeToHire) / industryAvgTimeToHire) * industryAvgCostPerHire)
      : 0;
    const totalEstimatedSavings = estimatedSavingsPerHire * (placements?.length || 0);

    const analytics = {
      period: {
        days: daysBack,
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString(),
      },
      summary: {
        active_jobs: jobs?.length || 0,
        total_applications: applications?.length || 0,
        total_hires: placements?.length || 0,
        profiles_unlocked: unlocks?.length || 0,
        avg_time_to_hire_days: avgTimeToHire,
      },
      conversion_metrics: {
        stage_breakdown: stageBreakdown,
        conversion_rates: conversionRates,
      },
      time_to_hire: {
        average_days: avgTimeToHire,
        details: timeToHireData,
        vs_industry_avg: avgTimeToHire - industryAvgTimeToHire,
      },
      roi: {
        estimated_savings_per_hire: estimatedSavingsPerHire,
        total_estimated_savings: totalEstimatedSavings,
        industry_benchmark_days: industryAvgTimeToHire,
        industry_benchmark_cost: industryAvgCostPerHire,
      },
      recent_activity: recentActivity,
      jobs: jobs?.map((j) => ({
        id: j.id,
        title: j.title,
        applications: applications?.filter((a) => a.job_id === j.id).length || 0,
        hires: placements?.filter((p) => p.job_id === j.id).length || 0,
      })),
    };

    console.log(`[EMPLOYER-ANALYTICS] Analytics calculated successfully`);

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[EMPLOYER-ANALYTICS] Error:", error);
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
