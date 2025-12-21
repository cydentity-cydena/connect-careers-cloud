import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    
    if (!videoId || typeof videoId !== "string" || videoId.length !== 11) {
      return new Response(
        JSON.stringify({ error: "Invalid video ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch video page to extract duration from meta tags
    const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    
    if (!videoPageResponse.ok) {
      throw new Error("Failed to fetch video page");
    }

    const html = await videoPageResponse.text();
    
    // Extract duration from the page
    // Look for "lengthSeconds":"XXX" in the JSON data
    const lengthMatch = html.match(/"lengthSeconds":"(\d+)"/);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    
    let durationMinutes = null;
    let title = null;
    
    if (lengthMatch) {
      const seconds = parseInt(lengthMatch[1]);
      durationMinutes = Math.ceil(seconds / 60);
    }
    
    if (titleMatch) {
      // Remove " - YouTube" suffix
      title = titleMatch[1].replace(/ - YouTube$/, "").trim();
    }
    
    // Also try oEmbed for additional info
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    
    let oembedTitle = null;
    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      oembedTitle = oembedData.title;
    }

    return new Response(
      JSON.stringify({
        videoId,
        title: oembedTitle || title,
        durationMinutes,
        valid: durationMinutes !== null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching video info:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch video info" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
