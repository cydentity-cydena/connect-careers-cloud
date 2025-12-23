import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  fullName: string;
  verificationUrl: string;
  role: string;
}

const getEmailHtml = (fullName: string, verificationUrl: string, role: string) => {
  const roleMessages: Record<string, string> = {
    candidate: "Start showcasing your verified certifications and skills to top employers.",
    employer: "Begin discovering pre-vetted cybersecurity talent for your team.",
    recruiter: "Access our network of verified cybersecurity professionals.",
  };

  const roleMessage = roleMessages[role] || roleMessages.candidate;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Cydena - Verify your email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 40px; text-align: center;">
              <h1 style="color: #06b6d4; font-size: 32px; font-weight: bold; margin: 0;">CYDENA</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0 0;">Verified Cyber Talent Platform</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #0a0a0a; font-size: 24px; font-weight: bold; margin: 0 0 16px 0;">
                Welcome to Cydena, ${fullName}! 👋
              </h2>
              
              <p style="color: #404040; font-size: 16px; line-height: 26px; margin: 0 0 20px 0;">
                Thank you for joining the platform for verified cybersecurity professionals. ${roleMessage}
              </p>
              
              <p style="color: #404040; font-size: 16px; line-height: 26px; margin: 0 0 32px 0;">
                To get started, please verify your email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 48px; border-radius: 8px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #64748b; font-size: 14px; line-height: 22px; margin: 0 0 12px 0;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #06b6d4; font-size: 13px; word-break: break-all; margin: 0 0 24px 0; background-color: #f1f5f9; padding: 12px; border-radius: 6px;">
                ${verificationUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              
              <!-- What's Next -->
              <h3 style="color: #0a0a0a; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">
                What's next?
              </h3>
              <ul style="color: #404040; font-size: 14px; line-height: 24px; margin: 0 0 24px 0; padding-left: 20px;">
                <li>Complete your profile to stand out</li>
                <li>Add your verified certifications</li>
                <li>Join our community of cyber professionals</li>
              </ul>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              
              <p style="color: #94a3b8; font-size: 12px; line-height: 20px; margin: 0;">
                This verification link will expire in 24 hours. If you didn't create an account with Cydena, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center;">
              <p style="color: #64748b; font-size: 12px; line-height: 20px; margin: 0 0 8px 0;">
                Need help? Contact us at <a href="mailto:support@cydena.com" style="color: #06b6d4; text-decoration: underline;">support@cydena.com</a>
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Cydena. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const { email, fullName, verificationUrl, role }: VerificationEmailRequest = await req.json();
    
    if (!email || !fullName || !verificationUrl) {
      throw new Error('Missing required fields: email, fullName, verificationUrl');
    }

    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL') || 'noreply@cydena.com';
    const fromName = Deno.env.get('SENDGRID_FROM_NAME') || 'Cydena';

    if (!sendgridApiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const html = getEmailHtml(fullName, verificationUrl, role);

    console.log('Sending verification email to:', email);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
          },
        ],
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: `Welcome to Cydena - Verify your email`,
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', response.status, errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log('Verification email sent successfully to:', email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send verification email',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
