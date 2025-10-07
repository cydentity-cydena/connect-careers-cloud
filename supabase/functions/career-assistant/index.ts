import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, context } = await req.json();
    console.log("Career assistant request:", { action, hasContext: !!context });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user context from authorization header
    const authHeader = req.headers.get("Authorization");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Build system prompt based on action
    let systemPrompt = `You are Cydena's AI Career Assistant, specialized in cybersecurity careers. You help candidates with:
1. Job recommendations - analyze their profile and suggest matching jobs
2. Resume optimization - review resumes against job requirements and suggest improvements
3. Career guidance - answer questions about certifications, career paths, and skill development

You are knowledgeable about cybersecurity certifications (CISSP, Security+, CEH, OSCP, etc.), clearance requirements, and career progression in the field.

Be conversational, encouraging, and specific. Provide actionable advice.`;

    // Add comprehensive user context to system prompt
    if (context) {
      systemPrompt += `\n\n=== CANDIDATE PROFILE ===`;
      
      if (context.profile) {
        systemPrompt += `\n\nBasic Info:
- Name: ${context.profile.full_name || 'Not provided'}
- Username: ${context.profile.username || 'Not provided'}
- Location: ${context.profile.location || 'Not provided'}
- Title: ${context.profile.title || 'Not provided'}
- Years of Experience: ${context.profile.years_experience || 0}
- Security Clearance: ${context.profile.security_clearance || 'None'}
- Willing to Relocate: ${context.profile.willing_to_relocate ? 'Yes' : 'No'}
- Professional Statement: ${context.profile.professional_statement || 'Not provided'}
- LinkedIn: ${context.profile.linkedin_url || 'Not provided'}
- GitHub: ${context.profile.github_url || 'Not provided'}
- Portfolio: ${context.profile.portfolio_url || 'Not provided'}`;
      }

      if (context.resumes?.length > 0) {
        systemPrompt += `\n\nResumes (${context.resumes.length} uploaded):`;
        context.resumes.forEach((r: any) => {
          systemPrompt += `\n- ${r.name} (${r.type})${r.primary ? ' [PRIMARY]' : ''}`;
        });
        systemPrompt += `\nNote: Resume files are uploaded but cannot be directly read by the AI. Base recommendations on other profile data.`;
      }

      if (context.skills?.length > 0) {
        systemPrompt += `\n\nSkills (${context.skills.length}):`;
        context.skills.forEach((s: any) => {
          systemPrompt += `\n- ${s.name}${s.category ? ` (${s.category})` : ''} - ${s.years_experience} years, Level ${s.proficiency}/5`;
        });
      }

      if (context.certifications?.length > 0) {
        systemPrompt += `\n\nCertifications (${context.certifications.length}):`;
        context.certifications.forEach((c: any) => {
          systemPrompt += `\n- ${c.name} by ${c.issuer}${c.expires ? ` (expires: ${c.expires})` : ''}`;
        });
      }

      if (context.workHistory?.length > 0) {
        systemPrompt += `\n\nWork History (${context.workHistory.length} positions):`;
        context.workHistory.forEach((w: any) => {
          systemPrompt += `\n- ${w.role} at ${w.company} (${w.period})${w.location ? ` - ${w.location}` : ''}`;
          if (w.description) systemPrompt += `\n  ${w.description}`;
        });
      }

      if (context.education?.length > 0) {
        systemPrompt += `\n\nEducation (${context.education.length} degrees):`;
        context.education.forEach((e: any) => {
          systemPrompt += `\n- ${e.degree} in ${e.field} from ${e.institution} (${e.period})${e.gpa ? ` - GPA: ${e.gpa}` : ''}`;
        });
      }

      if (context.projects?.length > 0) {
        systemPrompt += `\n\nProjects (${context.projects.length}):`;
        context.projects.forEach((p: any) => {
          systemPrompt += `\n- ${p.name} (${p.period})`;
          if (p.description) systemPrompt += `\n  ${p.description}`;
          if (p.technologies) systemPrompt += `\n  Tech: ${p.technologies.join(', ')}`;
        });
      }

      systemPrompt += `\n\n=== END PROFILE ===\n\nUse this comprehensive profile data to provide personalized, specific recommendations and guidance.`;
    }

    console.log("Making request to Lovable AI Gateway");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log("Streaming response from AI");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Career assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});