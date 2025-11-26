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

    console.log('Extracting CV details from:', source);

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

    const systemPrompt = `You are a CV/resume parser. Extract structured candidate information from the provided content.
Return ONLY valid JSON with these exact fields (use null for missing values):
{
  "fullName": "candidate name or null",
  "email": "email address or null",
  "phone": "phone number or null",
  "location": "location or null",
  "title": "current or desired job title",
  "professionalStatement": "professional summary or objective",
  "yearsExperience": number or null,
  "linkedinUrl": "LinkedIn profile URL or null",
  "githubUrl": "GitHub profile URL or null",
  "portfolioUrl": "portfolio website URL or null",
  "securityClearance": "clearance level or null",
  "workModePreference": "remote/hybrid/on-site or null",
  "willingToRelocate": boolean or null,
  "skills": ["array", "of", "skills"],
  "certifications": [
    {
      "name": "cert name",
      "issuer": "issuing organization",
      "issueDate": "YYYY-MM-DD or null",
      "expiryDate": "YYYY-MM-DD or null",
      "credentialId": "credential ID or null"
    }
  ],
  "workHistory": [
    {
      "company": "company name",
      "title": "job title",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null (null for current)",
      "description": "job description"
    }
  ],
  "education": [
    {
      "institution": "school name",
      "degree": "degree type",
      "fieldOfStudy": "field or null",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null",
      "gpa": "GPA or null"
    }
  ]
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
          { role: "user", content: `Extract candidate details from:\n\n${extractionContent}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_cv_details",
              description: "Extract structured candidate information from CV/resume",
              parameters: {
                type: "object",
                properties: {
                  fullName: { type: ["string", "null"] },
                  email: { type: ["string", "null"] },
                  phone: { type: ["string", "null"] },
                  location: { type: ["string", "null"] },
                  title: { type: "string" },
                  professionalStatement: { type: "string" },
                  yearsExperience: { type: ["number", "null"] },
                  linkedinUrl: { type: ["string", "null"] },
                  githubUrl: { type: ["string", "null"] },
                  portfolioUrl: { type: ["string", "null"] },
                  securityClearance: { type: ["string", "null"] },
                  workModePreference: { type: ["string", "null"] },
                  willingToRelocate: { type: ["boolean", "null"] },
                  skills: { 
                    type: "array",
                    items: { type: "string" }
                  },
                  certifications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        issuer: { type: ["string", "null"] },
                        issueDate: { type: ["string", "null"] },
                        expiryDate: { type: ["string", "null"] },
                        credentialId: { type: ["string", "null"] }
                      },
                      required: ["name"]
                    }
                  },
                  workHistory: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string" },
                        title: { type: "string" },
                        startDate: { type: ["string", "null"] },
                        endDate: { type: ["string", "null"] },
                        description: { type: ["string", "null"] }
                      },
                      required: ["company", "title"]
                    }
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        institution: { type: "string" },
                        degree: { type: "string" },
                        fieldOfStudy: { type: ["string", "null"] },
                        startDate: { type: ["string", "null"] },
                        endDate: { type: ["string", "null"] },
                        gpa: { type: ["string", "null"] }
                      },
                      required: ["institution", "degree"]
                    }
                  }
                },
                required: ["title", "professionalStatement"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_cv_details" } }
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

    const cvDetails = JSON.parse(toolCall.function.arguments);
    console.log('Extracted CV details:', cvDetails);

    return new Response(
      JSON.stringify({ success: true, data: cvDetails }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error extracting CV details:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
