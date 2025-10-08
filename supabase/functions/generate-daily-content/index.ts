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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Generating daily cybersecurity content...");

    // Generate content using Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a cybersecurity content creator for the Cydena community platform. Generate engaging, professional content about cybersecurity trends, tips, certifications, or career advice. Keep it concise, actionable, and relevant to cybersecurity professionals.`
          },
          {
            role: "user",
            content: `Generate a community post for today. Choose one of these topics randomly:
            1. Daily Security Tip (practical advice)
            2. Industry News Insight (recent trends or threats)
            3. Certification Spotlight (highlight a certification)
            4. Career Growth Tip (professional development)
            5. Tool Recommendation (useful security tool)
            
            Format as JSON with: { "title": "...", "description": "...", "activity_type": "daily_content", "tags": ["tag1", "tag2"] }
            Keep title under 100 chars, description 200-400 chars. Use 2-3 relevant tags.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded");
      }
      if (response.status === 402) {
        throw new Error("Lovable AI credits exhausted");
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    console.log("Generated content:", content);

    // Parse AI response
    let postData;
    try {
      postData = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    // Get user_id from request body (required for automated posts)
    const { user_id } = await req.json().catch(() => ({}));

    if (!user_id) {
      throw new Error("user_id is required in request body");
    }

    // Insert into activity feed
    const { data: post, error: insertError } = await supabase
      .from("activity_feed")
      .insert({
        user_id: user_id,
        activity_type: postData.activity_type || "daily_content",
        title: postData.title,
        description: postData.description,
        metadata: { 
          tags: postData.tags || [], 
          generated: true, 
          generated_at: new Date().toISOString() 
        },
        is_public: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log("Successfully created daily content post:", post.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        post_id: post.id,
        title: postData.title 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error generating daily content:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});