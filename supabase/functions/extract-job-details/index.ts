import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, source, url } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Extracting job details from:', source);

    let extractionContent = content;

    // If URL is provided, fetch the content
    if (source === 'url' && url) {
      console.log('Fetching content from URL:', url);
      const urlResponse = await fetch(url);
      if (!urlResponse.ok) {
        throw new Error(`Failed to fetch URL: ${urlResponse.statusText}`);
      }
      extractionContent = await urlResponse.text();
    }

    const systemPrompt = `You are a job posting analyzer. Extract structured job information from the provided content.
Return ONLY valid JSON with these exact fields (use null for missing values):
{
  "title": "job title",
  "description": "full job description",
  "location": "job location or null",
  "jobType": "full-time" | "part-time" | "contract" | "freelance",
  "remoteAllowed": boolean,
  "salaryMin": number or null,
  "salaryMax": number or null,
  "requiredClearance": "clearance level or null",
  "requiredSkills": "comma-separated skills",
  "requiredCerts": "comma-separated certifications",
  "mustHaves": "comma-separated must-haves",
  "niceToHaves": "comma-separated nice-to-haves",
  "yearsExpMin": number or null,
  "yearsExpMax": number or null,
  "companyName": "company name or null"
}`;

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
          { role: "user", content: `Extract job details from:\n\n${extractionContent}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_job_details",
              description: "Extract structured job posting information",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  location: { type: ["string", "null"] },
                  jobType: { type: "string", enum: ["full-time", "part-time", "contract", "freelance"] },
                  remoteAllowed: { type: "boolean" },
                  salaryMin: { type: ["number", "null"] },
                  salaryMax: { type: ["number", "null"] },
                  requiredClearance: { type: ["string", "null"] },
                  requiredSkills: { type: "string" },
                  requiredCerts: { type: "string" },
                  mustHaves: { type: "string" },
                  niceToHaves: { type: "string" },
                  yearsExpMin: { type: ["number", "null"] },
                  yearsExpMax: { type: ["number", "null"] },
                  companyName: { type: ["string", "null"] }
                },
                required: ["title", "description"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_job_details" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    console.log('AI response:', JSON.stringify(result));

    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const jobDetails = JSON.parse(toolCall.function.arguments);
    console.log('Extracted job details:', jobDetails);

    return new Response(
      JSON.stringify({ success: true, data: jobDetails }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error extracting job details:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
