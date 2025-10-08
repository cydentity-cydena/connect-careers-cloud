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

    console.log("Fetching recent cybersecurity news...");

    // Fetch recent cyber news for context
    let newsContext = "";
    try {
      const newsResponse = await fetch("https://news.google.com/rss/search?q=cybersecurity+OR+infosec+OR+data+breach+when:1d&hl=en-US&gl=US&ceid=US:en");
      const newsXml = await newsResponse.text();
      
      // Extract titles from RSS feed (basic parsing)
      const titleMatches = newsXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g);
      if (titleMatches && titleMatches.length > 1) {
        newsContext = titleMatches.slice(1, 6) // Skip first (feed title), get next 5
          .map(t => t.replace(/<title><!\[CDATA\[/, '').replace(/\]\]><\/title>/, ''))
          .join('\n');
        console.log("Retrieved news context:", newsContext);
      }
    } catch (e) {
      console.error("Failed to fetch news, continuing without context:", e);
    }

    console.log("Generating daily cybersecurity content...");

    // Generate content using Lovable AI with real news context
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
            content: `You are a cybersecurity content creator for the Cydena community platform. Generate engaging, professional content about cybersecurity trends, tips, certifications, or career advice. Keep it concise, actionable, and relevant to cybersecurity professionals. Use recent news when available to make content timely and relevant.`
          },
          {
            role: "user",
            content: `Generate a community post for today based on recent cybersecurity news or best practices.

${newsContext ? `Recent cybersecurity headlines:\n${newsContext}\n\nUse these headlines as inspiration but create original, actionable content. Focus on what professionals can learn or do.` : 'Create original content about a relevant cybersecurity topic.'}

Choose one of these formats:
1. Daily Security Tip (practical advice based on current threats)
2. Industry News Insight (analyze trends or recent incidents)
3. Certification Spotlight (highlight a relevant certification)
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

    // Parse AI response - strip markdown code blocks if present
    let postData;
    try {
      let cleanContent = content.trim();
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      postData = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    // Insert into activity feed with null user_id (system-generated)
    const { data: post, error: insertError } = await supabase
      .from("activity_feed")
      .insert({
        user_id: null,
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