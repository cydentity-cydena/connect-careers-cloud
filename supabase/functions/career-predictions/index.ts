import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Fetch user profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, desired_job_title, bio, location")
      .eq("id", user.id)
      .single();

    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("title, years_experience, specializations, security_clearance")
      .eq("user_id", user.id)
      .single();

    const { data: skills } = await supabase
      .from("candidate_skills")
      .select("skill_id, proficiency_level, years_experience, skills(name, category)")
      .eq("candidate_id", user.id);

    const { data: certifications } = await supabase
      .from("certifications")
      .select("name, issuer, verification_status")
      .eq("candidate_id", user.id);

    const { data: xp } = await supabase
      .from("candidate_xp")
      .select("level, total_xp, community_points")
      .eq("candidate_id", user.id)
      .single();

    // Build profile summary for AI
    const profileSummary = {
      name: profile?.full_name,
      current_title: candidateProfile?.title,
      desired_role: profile?.desired_job_title,
      years_experience: candidateProfile?.years_experience,
      specializations: candidateProfile?.specializations || [],
      clearance: candidateProfile?.security_clearance,
      skills: skills?.map(s => ({
        name: (s.skills as any)?.name,
        proficiency: s.proficiency_level,
        years: s.years_experience
      })) || [],
      certifications: certifications?.filter(c => c.verification_status === 'verified').map(c => ({
        name: c.name,
        issuer: c.issuer
      })) || [],
      level: xp?.level || 1,
      total_xp: xp?.total_xp || 0
    };

    console.log("Generating career predictions for profile:", profileSummary);

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert cybersecurity career advisor. Analyze the candidate's profile and suggest 3 realistic career paths.
            
For each path provide:
- role: exact job title
- probability: realistic % chance based on their current skills (be honest, not overly optimistic)
- timeline: months to achieve this role
- salary_range: realistic USD range (e.g., "$80k-$120k")
- required_skills: array of specific skills they need to develop
- required_certs: array of certifications they should obtain
- description: 2-3 sentences explaining why this path fits
- next_steps: array of 3-4 specific actionable steps

Consider:
- Their current experience level
- Existing certifications and skills
- Market demand for their specializations
- Typical career progression in cybersecurity
- Be realistic with timelines and probabilities`
          },
          {
            role: "user",
            content: `Analyze this cybersecurity professional's profile and suggest 3 career paths:
            
${JSON.stringify(profileSummary, null, 2)}

Return your response as a JSON object with a "paths" array containing exactly 3 career path objects.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_career_paths",
              description: "Return 3 realistic career path suggestions",
              parameters: {
                type: "object",
                properties: {
                  paths: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        role: { type: "string" },
                        probability: { type: "number", minimum: 0, maximum: 100 },
                        timeline: { type: "number", description: "months to achieve" },
                        salary_range: { type: "string" },
                        required_skills: {
                          type: "array",
                          items: { type: "string" }
                        },
                        required_certs: {
                          type: "array",
                          items: { type: "string" }
                        },
                        description: { type: "string" },
                        next_steps: {
                          type: "array",
                          items: { type: "string" }
                        }
                      },
                      required: ["role", "probability", "timeline", "salary_range", "required_skills", "required_certs", "description", "next_steps"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["paths"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_career_paths" } }
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("AI service unavailable");
    }

    const aiData = await aiResponse.json();
    console.log("AI Response:", JSON.stringify(aiData, null, 2));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "suggest_career_paths") {
      throw new Error("Invalid AI response format");
    }

    const careerPaths = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(careerPaths), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Career predictions error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate predictions" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
