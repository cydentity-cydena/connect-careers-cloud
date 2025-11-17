import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "noreply@cydena.com";
const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Cydena";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all active candidate users with emails
    const { data: profiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("id, email, full_name, username")
      .not("email", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter for candidates only
    const { data: candidates, error: rolesError } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "candidate");

    if (rolesError) {
      console.error("Error fetching candidate roles:", rolesError);
    }

    const candidateIds = new Set(candidates?.map(c => c.user_id) || []);
    const candidateProfiles = profiles.filter(p => candidateIds.has(p.id));

    console.log(`Sending daily challenge notification to ${candidateProfiles.length} candidates`);

    let successCount = 0;
    let failureCount = 0;

    // Send emails in batches of 50
    const batchSize = 50;
    for (let i = 0; i < candidateProfiles.length; i += batchSize) {
      const batch = candidateProfiles.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (profile) => {
          try {
            const displayName = profile.full_name || profile.username || "there";
            
            const emailHtml = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Daily Security Challenge</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                          <!-- Header -->
                          <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎯 Daily Security Challenge</h1>
                              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Test your cybersecurity knowledge!</p>
                            </td>
                          </tr>
                          
                          <!-- Content -->
                          <tr>
                            <td style="padding: 40px 30px;">
                              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hey ${displayName}! 👋
                              </p>
                              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Your daily Security IQ challenge is ready! Test your knowledge and maintain your streak.
                              </p>
                              
                              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">
                                  <strong style="color: #667eea;">💡 Quick Tip:</strong> Complete challenges daily to build your streak and climb the Security IQ leaderboard!
                                </p>
                              </div>
                              
                              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                  <td align="center">
                                    <a href="${Deno.env.get("VITE_SUPABASE_URL")?.replace('/supabase/', '/')}/dashboard" 
                                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                      Take Today's Challenge
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              
                              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                Keep learning and stay sharp! 🚀
                              </p>
                            </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} Cydena. All rights reserved.
                              </p>
                              <p style="margin: 0; color: #999999; font-size: 12px;">
                                You're receiving this because you're part of the Cydena community.
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

            await resend.emails.send({
              from: `${SENDGRID_FROM_NAME} <${SENDGRID_FROM_EMAIL}>`,
              to: [profile.email],
              subject: "🎯 Your Daily Security Challenge is Ready!",
              html: emailHtml,
            });

            successCount++;
          } catch (error) {
            console.error(`Failed to send email to ${profile.email}:`, error);
            failureCount++;
          }
        })
      );

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < candidateProfiles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Email sending complete. Success: ${successCount}, Failed: ${failureCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        recipients: candidateProfiles.length,
        successCount,
        failureCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-daily-challenge-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
