import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscribeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  userType: 'candidate' | 'employer' | 'recruiter';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, userType }: SubscribeRequest = await req.json();

    // Validate input
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (email.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Email too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('MAILCHIMP_API_KEY');
    const audienceId = Deno.env.get('MAILCHIMP_AUDIENCE_ID');

    if (!apiKey || !audienceId) {
      console.error('Missing Mailchimp configuration');
      return new Response(
        JSON.stringify({ error: 'Mailchimp is not configured. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract datacenter from API key (format: key-datacenter, e.g., abc123-us1)
    const apiKeyParts = apiKey.split('-');
    const datacenter = apiKeyParts.length > 1 ? apiKeyParts[apiKeyParts.length - 1] : null;
    
    if (!datacenter || datacenter.length < 2) {
      console.error('Invalid Mailchimp API key format - cannot extract datacenter');
      return new Response(
        JSON.stringify({ error: 'Invalid Mailchimp API key format. Please check your configuration.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

    const memberData = {
      email_address: email.trim().toLowerCase(),
      status: 'subscribed',
      merge_fields: {
        ...(firstName && { FNAME: firstName.trim().substring(0, 100) }),
        ...(lastName && { LNAME: lastName.trim().substring(0, 100) }),
      },
      tags: [userType.toUpperCase()],
    };

    console.log('Subscribing to Mailchimp:', { email: memberData.email_address, userType });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`anystring:${apiKey}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    const data = await response.json();

    if (!response.ok) {
      // If user already subscribed, treat as success
      if (data.title === 'Member Exists') {
        console.log('User already subscribed:', email);
        return new Response(
          JSON.stringify({ success: true, message: 'Already subscribed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('Mailchimp API error:', data);
      
      // Provide specific error messages
      let errorMessage = 'Failed to subscribe to mailing list.';
      if (data.title === 'API Key Invalid') {
        errorMessage = 'Mailchimp configuration error. Please contact support.';
      } else if (data.title === 'Forgotten Email Not Subscribed') {
        errorMessage = 'This email was previously unsubscribed. Please contact support to resubscribe.';
      } else if (data.detail) {
        errorMessage = data.detail;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully subscribed:', email);

    return new Response(
      JSON.stringify({ success: true, message: 'Successfully subscribed!' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mailchimp-subscribe function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
