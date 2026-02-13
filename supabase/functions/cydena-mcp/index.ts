import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const app = new Hono();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// MCP tool definitions
const TOOLS = [
  {
    name: "cydena_search_talent",
    description: "Search for verified cybersecurity professionals by skill, certification, clearance level, and availability. Returns matching talent profiles with rates and ratings.",
    inputSchema: {
      type: "object",
      properties: {
        specialism: { type: "string", description: "Specialism to search for (e.g. pentest, red-team, incident-response, soc, grc, cloud-security, appsec)" },
        clearance: { type: "string", description: "Required security clearance level", enum: ["none", "BPSS", "SC", "DV"] },
        availability: { type: "string", description: "Availability status filter", enum: ["available", "busy"] },
        max_rate_gbp: { type: "number", description: "Maximum day rate in GBP" },
        min_rating: { type: "number", description: "Minimum average rating (0-5)" },
      },
    },
  },
  {
    name: "cydena_check_availability",
    description: "Check a specific professional's availability and current engagement count.",
    inputSchema: {
      type: "object",
      properties: {
        talent_id: { type: "string", description: "UUID of the talent to check" },
      },
      required: ["talent_id"],
    },
  },
  {
    name: "cydena_book_talent",
    description: "Create an engagement request to book a verified cybersecurity professional for a task.",
    inputSchema: {
      type: "object",
      properties: {
        talent_id: { type: "string", description: "UUID of the talent to book" },
        category_slug: { type: "string", description: "Task category slug" },
        title: { type: "string", description: "Engagement title" },
        description: { type: "string", description: "Detailed description of the work" },
        engagement_type: { type: "string", enum: ["hourly", "daily", "fixed", "retainer"] },
        estimated_days: { type: "number", description: "Estimated duration in days" },
        start_date: { type: "string", description: "Desired start date (YYYY-MM-DD)" },
        requires_nda: { type: "boolean", description: "Whether NDA is required" },
      },
      required: ["talent_id", "title", "description"],
    },
  },
  {
    name: "cydena_post_bounty",
    description: "Post an open task bounty for qualified cybersecurity professionals to apply to.",
    inputSchema: {
      type: "object",
      properties: {
        category_slug: { type: "string", description: "Task category slug" },
        title: { type: "string", description: "Bounty title" },
        description: { type: "string", description: "Detailed description" },
        required_certifications: { type: "array", items: { type: "string" }, description: "Required certifications" },
        required_clearance: { type: "string", enum: ["none", "BPSS", "SC", "DV"] },
        location_requirement: { type: "string", enum: ["remote", "onsite", "hybrid"] },
        budget_min_gbp: { type: "number" },
        budget_max_gbp: { type: "number" },
        urgency: { type: "string", enum: ["critical", "urgent", "normal", "flexible"] },
        deadline: { type: "string", description: "Deadline date (YYYY-MM-DD)" },
      },
      required: ["title", "description", "budget_min_gbp", "budget_max_gbp"],
    },
  },
  {
    name: "cydena_get_engagement_status",
    description: "Check the status of an active engagement.",
    inputSchema: {
      type: "object",
      properties: {
        engagement_id: { type: "string", description: "UUID of the engagement" },
      },
      required: ["engagement_id"],
    },
  },
  {
    name: "cydena_get_categories",
    description: "List all available cybersecurity task categories and their requirements.",
    inputSchema: { type: "object", properties: {} },
  },
];

// Handle tool calls
async function handleToolCall(name: string, args: any): Promise<any> {
  const supabase = getSupabase();

  switch (name) {
    case "cydena_search_talent": {
      let query = supabase
        .from("candidate_profiles")
        .select("user_id, title, marketplace_headline, hourly_rate_gbp, day_rate_gbp, availability_status, security_clearance, specializations, tools, average_rating, response_time_hours, years_experience, total_engagements_completed")
        .eq("is_marketplace_visible", true)
        .eq("is_mcp_bookable", true);

      if (args.clearance) query = query.eq("security_clearance", args.clearance);
      if (args.availability) query = query.eq("availability_status", args.availability);
      if (args.max_rate_gbp) query = query.lte("day_rate_gbp", args.max_rate_gbp);
      if (args.min_rating) query = query.gte("average_rating", args.min_rating);

      const { data, error } = await query.order("average_rating", { ascending: false }).limit(20);
      if (error) throw error;

      let filtered = data || [];
      if (args.specialism) {
        filtered = filtered.filter((t: any) =>
          t.specializations?.some((s: string) => s.toLowerCase().includes(args.specialism.toLowerCase()))
        );
      }
      return { talent: filtered, count: filtered.length };
    }

    case "cydena_check_availability": {
      const { data, error } = await supabase
        .from("candidate_profiles")
        .select("availability_status, available_from, max_concurrent_engagements")
        .eq("user_id", args.talent_id)
        .single();
      if (error) throw error;

      const { count } = await supabase
        .from("marketplace_engagements")
        .select("id", { count: "exact" })
        .eq("talent_id", args.talent_id)
        .in("status", ["accepted", "in_progress"]);

      return {
        ...data,
        current_engagements: count || 0,
        is_available: data.availability_status === "available" && (count || 0) < (data.max_concurrent_engagements || 1),
      };
    }

    case "cydena_book_talent": {
      const { data: talent } = await supabase
        .from("candidate_profiles")
        .select("day_rate_gbp, hourly_rate_gbp")
        .eq("user_id", args.talent_id)
        .single();

      let categoryId = null;
      if (args.category_slug) {
        const { data: cat } = await supabase.from("task_categories").select("id").eq("slug", args.category_slug).single();
        categoryId = cat?.id;
      }

      const rate = talent?.day_rate_gbp || talent?.hourly_rate_gbp || 0;
      const days = args.estimated_days || 1;

      const { data, error } = await supabase
        .from("marketplace_engagements")
        .insert({
          client_id: "00000000-0000-0000-0000-000000000000", // MCP bookings need admin review
          talent_id: args.talent_id,
          category_id: categoryId,
          title: args.title,
          description: args.description,
          engagement_type: args.engagement_type || "daily",
          estimated_days: days,
          start_date: args.start_date,
          agreed_rate_gbp: rate,
          total_estimated_gbp: rate * days,
          requires_nda: args.requires_nda || false,
          source: "mcp",
        })
        .select()
        .single();
      if (error) throw error;
      return { engagement: data, message: "Engagement created and pending talent acceptance" };
    }

    case "cydena_post_bounty": {
      let categoryId = null;
      if (args.category_slug) {
        const { data: cat } = await supabase.from("task_categories").select("id").eq("slug", args.category_slug).single();
        categoryId = cat?.id;
      }

      const { data, error } = await supabase
        .from("task_bounties")
        .insert({
          client_id: "00000000-0000-0000-0000-000000000000", // MCP bounties need admin review
          category_id: categoryId,
          title: args.title,
          description: args.description,
          required_certifications: args.required_certifications || [],
          required_clearance: args.required_clearance || "none",
          location_requirement: args.location_requirement || "remote",
          budget_min_gbp: args.budget_min_gbp,
          budget_max_gbp: args.budget_max_gbp,
          engagement_type: "fixed",
          urgency: args.urgency || "normal",
          deadline: args.deadline,
          source: "mcp",
        })
        .select()
        .single();
      if (error) throw error;
      return { bounty: data };
    }

    case "cydena_get_engagement_status": {
      const { data, error } = await supabase
        .from("marketplace_engagements")
        .select("*")
        .eq("id", args.engagement_id)
        .single();
      if (error) throw error;
      return { engagement: data };
    }

    case "cydena_get_categories": {
      const { data, error } = await supabase.from("task_categories").select("*").order("sort_order");
      if (error) throw error;
      return { categories: data };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// MCP SSE endpoint
app.all("/*", async (c) => {
  const req = c.req.raw;

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle MCP protocol messages
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { method, id, params } = body;

      let response: any;

      switch (method) {
        case "initialize":
          response = {
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: { tools: {} },
              serverInfo: {
                name: "cydena-marketplace",
                version: "1.0.0",
              },
            },
          };
          break;

        case "tools/list":
          response = {
            jsonrpc: "2.0",
            id,
            result: { tools: TOOLS },
          };
          break;

        case "tools/call":
          try {
            const result = await handleToolCall(params.name, params.arguments || {});
            response = {
              jsonrpc: "2.0",
              id,
              result: {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
              },
            };
          } catch (error) {
            response = {
              jsonrpc: "2.0",
              id,
              result: {
                content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
                isError: true,
              },
            };
          }
          break;

        default:
          response = {
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Method not found: ${method}` },
          };
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // GET - return server info
  return new Response(JSON.stringify({
    name: "cydena-marketplace",
    version: "1.0.0",
    description: "Cydena Cybersecurity Talent Marketplace MCP Server",
    tools: TOOLS.map(t => t.name),
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

Deno.serve(app.fetch);
