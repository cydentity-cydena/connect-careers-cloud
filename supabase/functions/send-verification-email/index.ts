import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from 'https://esm.sh/resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getEmailHtml = (confirmationUrl: string, userEmail: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Cydena account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #0a0a0a; font-size: 24px; font-weight: bold; margin: 0 0 20px 0;">Welcome to Cydena!</h1>
              <p style="color: #404040; font-size: 16px; line-height: 26px; margin: 0 0 20px 0;">
                Thank you for signing up for Cydena, the platform for verified cyber talent.
              </p>
              <p style="color: #404040; font-size: 16px; line-height: 26px; margin: 0 0 27px 0;">
                To complete your registration and start showcasing your verified certifications and skills, please verify your email address:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 27px 0;">
                    <a href="${confirmationUrl}" style="display: inline-block; background-color: #06b6d4; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 40px; border-radius: 8px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #404040; font-size: 14px; line-height: 22px; margin: 0 0 10px 0;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #06b6d4; font-size: 14px; word-break: break-all; margin: 0 0 20px 0;">
                ${confirmationUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;">
              <p style="color: #898989; font-size: 12px; line-height: 22px; margin: 12px 0;">
                This verification link will expire in 24 hours. If you didn't create an account with Cydena, you can safely ignore this email.
              </p>
              <p style="color: #898989; font-size: 12px; line-height: 22px; margin: 12px 0;">
                Need help? Contact us at <a href="mailto:support@cydena.com" style="color: #06b6d4; text-decoration: underline;">support@cydena.com</a>
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
    const payload = await req.json();
    const { user, email_data } = payload;
    
    if (!user?.email || !email_data) {
      throw new Error('Missing required email data');
    }

    const { token_hash, email_action_type, redirect_to } = email_data;
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    
    // Build confirmation URL
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    // Get HTML email
    const html = getEmailHtml(confirmationUrl, user.email);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Cydena <noreply@cydena.com>',
      to: [user.email],
      subject: 'Verify your Cydena account',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Verification email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Failed to send verification email',
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
