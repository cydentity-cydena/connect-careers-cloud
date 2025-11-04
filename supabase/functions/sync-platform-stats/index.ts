import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  platform: 'tryhackme' | 'hackthebox';
  username: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, username, userId }: RequestBody = await req.json();

    console.log(`Fetching stats for ${platform} user: ${username}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user making the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== userId) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let rankData = null;
    let statsData = null;

    if (platform === 'tryhackme') {
      // Fetch TryHackMe stats
      try {
        const thmResponse = await fetch(`https://tryhackme.com/api/v2/user/public-profile?username=${username}`);
        
        if (!thmResponse.ok) {
          console.error('TryHackMe API error:', thmResponse.status);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to fetch TryHackMe profile. Please check the username is correct.' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const thmData = await thmResponse.json();
        console.log('TryHackMe data received:', JSON.stringify(thmData).substring(0, 200));

        // Extract rank and level information
        rankData = thmData.rank || 'Unranked';
        statsData = {
          level: thmData.userRank || 0,
          points: thmData.points || 0,
          badges: thmData.badges?.length || 0,
          rooms_completed: thmData.rooms?.length || 0
        };

        // Update the profile with the fetched data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            tryhackme_rank: rankData,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating TryHackMe stats:', updateError);
          throw updateError;
        }

      } catch (error) {
        console.error('Error fetching TryHackMe stats:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Could not fetch TryHackMe profile. The username may not exist or the API is unavailable.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (platform === 'hackthebox') {
      // For HackTheBox, we'll store basic info since their API requires authentication
      // In production, you would need HackTheBox API credentials
      try {
        // HackTheBox public profile scraping or API call would go here
        // For now, we'll mark it as "Connected" since we can't easily verify without API keys
        rankData = 'Connected';
        statsData = {
          username: username,
          verified: false, // Would be true if we successfully fetched from API
          note: 'HackTheBox stats require API authentication'
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            hackthebox_rank: rankData,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating HackTheBox stats:', updateError);
          throw updateError;
        }

      } catch (error) {
        console.error('Error processing HackTheBox stats:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Could not process HackTheBox profile.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Successfully synced ${platform} stats for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        rank: rankData,
        stats: statsData,
        platform 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in sync-platform-stats function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
