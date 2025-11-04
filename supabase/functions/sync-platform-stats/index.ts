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
      // Fetch TryHackMe stats using the correct API endpoint
      try {
        // TryHackMe's public API endpoint
        const thmResponse = await fetch(`https://tryhackme.com/api/user/public-profile/${username}`, {
          headers: {
            'User-Agent': 'Cydena Platform'
          }
        });
        
        console.log('TryHackMe API response status:', thmResponse.status);
        
        if (!thmResponse.ok) {
          const responseText = await thmResponse.text();
          console.error('TryHackMe API error response:', responseText.substring(0, 200));
          
          return new Response(
            JSON.stringify({ 
              error: 'Failed to fetch TryHackMe profile. Please verify the username is correct and try again.' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const contentType = thmResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await thmResponse.text();
          console.error('TryHackMe returned non-JSON response:', responseText.substring(0, 200));
          
          return new Response(
            JSON.stringify({ 
              error: 'TryHackMe API returned an invalid response. The username may not exist.' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const thmData = await thmResponse.json();
        console.log('TryHackMe data received:', JSON.stringify(thmData).substring(0, 500));

        // Extract rank and level information from the response
        // TryHackMe API structure may vary, so we handle different formats
        const userRank = thmData.userRank || thmData.rank || thmData.level || 'Member';
        const points = thmData.points || 0;
        const badges = thmData.badges?.length || 0;
        
        rankData = `Level ${userRank}`;
        statsData = {
          level: userRank,
          points: points,
          badges: badges,
          username: username
        };

        // Update the profile with the fetched data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            tryhackme_rank: rankData,
            tryhackme_level: userRank,
            tryhackme_points: points,
            tryhackme_badges: badges
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating TryHackMe stats:', updateError);
          throw updateError;
        }

        console.log(`Successfully synced TryHackMe stats for ${username}`);

      } catch (error) {
        console.error('Error fetching TryHackMe stats:', error);
        
        // If it's a parsing error, provide more details
        if (error instanceof SyntaxError) {
          return new Response(
            JSON.stringify({ 
              error: 'TryHackMe API returned an invalid response format. Please verify the username exists on TryHackMe.' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'Could not fetch TryHackMe profile. The username may not exist or the API is temporarily unavailable.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (platform === 'hackthebox') {
      // For HackTheBox, we'll store basic info since their API requires authentication
      try {
        // HackTheBox API endpoint - requires authentication
        // For now, we'll mark it as "Connected" and suggest manual verification
        rankData = 'Connected';
        statsData = {
          username: username,
          verified: false,
          note: 'HackTheBox stats require API authentication. Please verify your profile manually.'
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

        console.log(`Successfully synced hackthebox stats for user ${userId}`);

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
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
