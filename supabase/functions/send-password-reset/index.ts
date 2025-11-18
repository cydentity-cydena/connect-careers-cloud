import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  redirectTo: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectTo }: PasswordResetRequest = await req.json();
    
    console.log("Processing password reset for:", email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate password reset link using Supabase
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectTo
      }
    });

    if (error) {
      console.error("Error generating reset link:", error);
      throw error;
    }

    // Send email via SendGrid
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || Deno.env.get("cydenaemail");
    const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Cydena";
    
    if (!SENDGRID_FROM_EMAIL) {
      throw new Error("SENDGRID_FROM_EMAIL is not configured");
    }

    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email }],
          subject: "Reset Your Cydena Password",
        }],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME,
        },
        content: [{
          type: "text/html",
          value: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Reset Your Password</h1>
                  </div>
                  
                  <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                      Hello,
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 30px 0;">
                      We received a request to reset your Cydena password. Click the button below to create a new password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${data.properties.action_link}" 
                         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        Reset Password
                      </a>
                    </div>
                    
                    <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #eeeeee;">
                      If you didn't request a password reset, you can safely ignore this email. This link will expire in 60 minutes.
                    </p>
                    
                    <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 20px 0 0 0;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    
                    <p style="font-size: 13px; line-height: 1.6; color: #667eea; word-break: break-all; margin: 10px 0 0 0;">
                      ${data.properties.action_link}
                    </p>
                  </div>
                  
                  <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="font-size: 13px; color: #999999; margin: 0;">
                      © ${new Date().getFullYear()} Cydena. All rights reserved.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("SendGrid error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log("Password reset email sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
