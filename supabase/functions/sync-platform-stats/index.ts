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
      // TryHackMe's public API is unreliable - store username only
      try {
        // Try to fetch from TryHackMe, but make it non-blocking
        // The API endpoint has been unreliable, so we'll just store the username
        // and mark it as "Connected" similar to HackTheBox
        
        rankData = 'Connected';
        statsData = {
          username: username,
          verified: false,
          note: 'TryHackMe profile connected. Stats sync is currently unavailable due to API limitations.'
        };

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

        console.log(`Successfully connected TryHackMe username for user ${userId}`);

      } catch (error) {
        console.error('Error processing TryHackMe stats:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Could not connect TryHackMe profile.' 
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
