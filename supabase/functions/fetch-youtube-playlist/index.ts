import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlaylistVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  position: number;
  durationSeconds: number | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistUrl } = await req.json();
    
    if (!playlistUrl || typeof playlistUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "Playlist URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Extract playlist ID from URL
    const playlistIdMatch = playlistUrl.match(/[?&]list=([^&]+)/);
    if (!playlistIdMatch) {
      return new Response(
        JSON.stringify({ error: "Could not find playlist ID in URL" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const playlistId = playlistIdMatch[1];
    console.log(`Fetching playlist: ${playlistId}`);

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Fetch playlist items
    const videos: PlaylistVideo[] = [];
    let nextPageToken: string | null = null;
    
    do {
      const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      playlistUrl.searchParams.set("part", "snippet,contentDetails");
      playlistUrl.searchParams.set("playlistId", playlistId);
      playlistUrl.searchParams.set("maxResults", "50");
      playlistUrl.searchParams.set("key", apiKey);
      if (nextPageToken) {
        playlistUrl.searchParams.set("pageToken", nextPageToken);
      }

      console.log(`Fetching page: ${nextPageToken || 'first'}`);
      
      const response = await fetch(playlistUrl.toString());
      const data = await response.json();

      if (!response.ok) {
        console.error("YouTube API error:", data);
        return new Response(
          JSON.stringify({ error: data.error?.message || "Failed to fetch playlist" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Collect video IDs for duration lookup
      const videoIds = data.items
        .filter((item: any) => item.snippet.resourceId?.videoId)
        .map((item: any) => item.snippet.resourceId.videoId);

      // Fetch video details (for duration)
      let videoDurations: Record<string, number> = {};
      if (videoIds.length > 0) {
        const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
        videosUrl.searchParams.set("part", "contentDetails");
        videosUrl.searchParams.set("id", videoIds.join(","));
        videosUrl.searchParams.set("key", apiKey);

        const videosResponse = await fetch(videosUrl.toString());
        const videosData = await videosResponse.json();

        if (videosResponse.ok && videosData.items) {
          for (const video of videosData.items) {
            // Parse ISO 8601 duration (PT1H2M3S)
            const duration = video.contentDetails?.duration;
            if (duration) {
              const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
              if (match) {
                const hours = parseInt(match[1] || "0");
                const minutes = parseInt(match[2] || "0");
                const seconds = parseInt(match[3] || "0");
                videoDurations[video.id] = hours * 3600 + minutes * 60 + seconds;
              }
            }
          }
        }
      }

      for (const item of data.items) {
        const videoId = item.snippet.resourceId?.videoId;
        if (!videoId) continue;

        videos.push({
          videoId,
          title: item.snippet.title,
          description: item.snippet.description || "",
          thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
          position: item.snippet.position,
          durationSeconds: videoDurations[videoId] || null,
        });
      }

      nextPageToken = data.nextPageToken || null;
    } while (nextPageToken);

    console.log(`Found ${videos.length} videos in playlist`);

    // Get playlist title
    const playlistInfoUrl = new URL("https://www.googleapis.com/youtube/v3/playlists");
    playlistInfoUrl.searchParams.set("part", "snippet");
    playlistInfoUrl.searchParams.set("id", playlistId);
    playlistInfoUrl.searchParams.set("key", apiKey);

    const playlistInfoResponse = await fetch(playlistInfoUrl.toString());
    const playlistInfoData = await playlistInfoResponse.json();
    
    const playlistTitle = playlistInfoData.items?.[0]?.snippet?.title || "Unknown Playlist";
    const channelTitle = playlistInfoData.items?.[0]?.snippet?.channelTitle || "Unknown Channel";

    return new Response(
      JSON.stringify({
        playlistId,
        playlistTitle,
        channelTitle,
        videoCount: videos.length,
        videos
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch playlist" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
