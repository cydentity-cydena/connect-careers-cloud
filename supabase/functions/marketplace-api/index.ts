import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Authenticate via API key
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = authHeader.replace("Bearer ", "");
    const keyPrefix = apiKey.substring(0, 8);

    // Check API key (for now, also allow supabase anon key for platform use)
    const isAnonKey = apiKey === Deno.env.get("SUPABASE_ANON_KEY");
    let authenticatedUserId: string | null = null;

    if (!isAnonKey) {
      // Look up marketplace API key
      const { data: keyData } = await supabase
        .from("marketplace_api_keys")
        .select("id, profile_id, permissions, rate_limit_per_hour, is_active")
        .eq("key_prefix", keyPrefix)
        .eq("is_active", true)
        .single();

      if (!keyData) {
        return new Response(JSON.stringify({ error: "Invalid API key" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      authenticatedUserId = keyData.profile_id;

      // Update last_used_at
      await supabase.from("marketplace_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id);
    }

    // Determine action
    const url = new URL(req.url);
    let action: string;
    let body: any = {};

    if (req.method === "GET") {
      action = url.searchParams.get("action") || "";
    } else {
      body = await req.json();
      action = body.action || "";
    }

    const startTime = Date.now();
    let result: any;
    let statusCode = 200;

    switch (action) {
      case "search_talent": {
        let query = supabase
          .from("candidate_profiles")
          .select(`
            user_id, title, marketplace_headline, hourly_rate_gbp, day_rate_gbp,
            availability_status, available_from, security_clearance, specializations,
            tools, industries, total_engagements_completed, average_rating, response_time_hours,
            years_experience
          `)
          .eq("is_marketplace_visible", true)
          .eq("is_api_bookable", true);

        const specialism = url.searchParams.get("specialism") || body.specialism;
        const clearance = url.searchParams.get("clearance") || body.clearance;
        const availability = url.searchParams.get("availability") || body.availability;
        const maxRate = url.searchParams.get("max_rate_gbp") || body.max_rate_gbp;
        const minRating = url.searchParams.get("min_rating") || body.min_rating;

        if (clearance) query = query.eq("security_clearance", clearance);
        if (availability) query = query.eq("availability_status", availability);
        if (maxRate) query = query.lte("day_rate_gbp", parseFloat(maxRate));
        if (minRating) query = query.gte("average_rating", parseFloat(minRating));

        const { data, error } = await query.order("average_rating", { ascending: false }).limit(50);
        if (error) throw error;

        let filtered = data || [];
        if (specialism) {
          filtered = filtered.filter((t: any) =>
            t.specializations?.some((s: string) => s.toLowerCase().includes(specialism.toLowerCase()))
          );
        }

        result = { talent: filtered, count: filtered.length };
        break;
      }

      case "check_availability": {
        const talentId = url.searchParams.get("talent_id") || body.talent_id;
        if (!talentId) throw new Error("talent_id required");

        const { data, error } = await supabase
          .from("candidate_profiles")
          .select("availability_status, available_from, max_concurrent_engagements")
          .eq("user_id", talentId)
          .single();
        if (error) throw error;

        // Count active engagements
        const { count } = await supabase
          .from("marketplace_engagements")
          .select("id", { count: "exact" })
          .eq("talent_id", talentId)
          .in("status", ["accepted", "in_progress"]);

        result = {
          ...data,
          current_engagements: count || 0,
          is_available: data.availability_status === "available" && (count || 0) < (data.max_concurrent_engagements || 1),
        };
        break;
      }

      case "book_talent": {
        if (!authenticatedUserId) throw new Error("Authentication required for booking");

        const talentId = body.talent_id;
        if (!talentId) throw new Error("talent_id required");

        // Get talent rate
        const { data: talent } = await supabase
          .from("candidate_profiles")
          .select("day_rate_gbp, hourly_rate_gbp")
          .eq("user_id", talentId)
          .single();

        // Get category
        let categoryId = null;
        if (body.category_slug) {
          const { data: cat } = await supabase
            .from("task_categories")
            .select("id")
            .eq("slug", body.category_slug)
            .single();
          categoryId = cat?.id;
        }

        const agreedRate = body.agreed_rate_gbp || talent?.day_rate_gbp || talent?.hourly_rate_gbp || 0;
        const estimatedDays = body.estimated_days || 1;
        const totalEstimated = agreedRate * estimatedDays;

        const { data: engagement, error } = await supabase
          .from("marketplace_engagements")
          .insert({
            client_id: authenticatedUserId,
            talent_id: talentId,
            category_id: categoryId,
            title: body.title || "New Engagement",
            description: body.description || "",
            requirements: body.requirements,
            deliverables: body.deliverables,
            engagement_type: body.engagement_type || "daily",
            estimated_hours: body.estimated_hours,
            estimated_days: estimatedDays,
            start_date: body.start_date,
            end_date: body.end_date,
            agreed_rate_gbp: agreedRate,
            total_estimated_gbp: totalEstimated,
            requires_nda: body.requires_nda || false,
            requires_clearance: body.requires_clearance || "none",
            compliance_framework: body.compliance_framework,
            source: "api",
            source_agent_id: body.agent_id,
            source_agent_name: body.agent_name,
          })
          .select()
          .single();

        if (error) throw error;
        result = { engagement };
        statusCode = 201;
        break;
      }

      case "post_bounty": {
        if (!authenticatedUserId) throw new Error("Authentication required for posting bounties");

        let categoryId = null;
        if (body.category_slug) {
          const { data: cat } = await supabase
            .from("task_categories")
            .select("id")
            .eq("slug", body.category_slug)
            .single();
          categoryId = cat?.id;
        }

        const { data: bounty, error } = await supabase
          .from("task_bounties")
          .insert({
            client_id: authenticatedUserId,
            category_id: categoryId,
            title: body.title,
            description: body.description,
            requirements: body.requirements,
            required_certifications: body.required_certifications || [],
            required_clearance: body.required_clearance || "none",
            location_requirement: body.location_requirement || "remote",
            location_city: body.location_city,
            budget_min_gbp: body.budget_min_gbp,
            budget_max_gbp: body.budget_max_gbp,
            engagement_type: body.engagement_type || "fixed",
            urgency: body.urgency || "normal",
            start_date: body.start_date,
            deadline: body.deadline,
            max_applicants: body.max_applicants || 10,
            source: "api",
            source_agent_id: body.agent_id,
          })
          .select()
          .single();

        if (error) throw error;
        result = { bounty };
        statusCode = 201;
        break;
      }

      case "get_engagement_status": {
        const engagementId = url.searchParams.get("engagement_id") || body.engagement_id;
        if (!engagementId) throw new Error("engagement_id required");

        const { data, error } = await supabase
          .from("marketplace_engagements")
          .select("*")
          .eq("id", engagementId)
          .single();
        if (error) throw error;
        result = { engagement: data };
        break;
      }

      case "get_categories": {
        const { data, error } = await supabase
          .from("task_categories")
          .select("*")
          .order("sort_order");
        if (error) throw error;
        result = { categories: data };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}`, available_actions: ["search_talent", "check_availability", "book_talent", "post_bounty", "get_engagement_status", "get_categories"] }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const responseTime = Date.now() - startTime;

    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Marketplace API error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
