import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BugReportRequest {
  name: string;
  email: string;
  bugType: string;
  url: string;
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, bugType, url, description }: BugReportRequest = await req.json();

    console.log('Bug report received:', {
      name: name || 'Anonymous',
      email: email || 'Not provided',
      bugType: bugType || 'Not specified',
      url: url || 'Not provided',
      description: description.substring(0, 100) + '...'
    });

    // For now, just log the bug report
    // In production, you would:
    // 1. Send an email notification to admin
    // 2. Store in a database table
    // 3. Create a ticket in your issue tracking system

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Bug report submitted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing bug report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
