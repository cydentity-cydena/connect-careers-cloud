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

    // Send email using SendGrid
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    
    if (SENDGRID_API_KEY) {
      const emailBody = {
        personalizations: [{
          to: [{ email: 'contact@cydena.com' }],
          subject: `Bug Report: ${bugType || 'General Issue'}`
        }],
        from: { email: 'noreply@cydena.com', name: 'Cydena Bug Reports' },
        content: [{
          type: 'text/html',
          value: `
            <h2>Bug Report Submitted</h2>
            <p><strong>Type:</strong> ${bugType || 'Not specified'}</p>
            <p><strong>Submitted by:</strong> ${name || 'Anonymous'}</p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            <p><strong>Page URL:</strong> ${url || 'Not provided'}</p>
            <hr>
            <h3>Description:</h3>
            <p>${description.replace(/\n/g, '<br>')}</p>
          `
        }]
      };

      const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailBody),
      });

      if (!sgResponse.ok) {
        const errorText = await sgResponse.text();
        console.error('SendGrid error:', errorText);
      } else {
        console.log('Bug report email sent successfully');
      }
    }

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
