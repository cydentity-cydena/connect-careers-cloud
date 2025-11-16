import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "notifications@cydena.app";
const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Cydena";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MentionNotificationRequest {
  commentId: string;
  mentionedUserId: string;
  mentionerUserId: string;
  content: string;
  postId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { commentId, mentionedUserId, mentionerUserId, content, postId }: MentionNotificationRequest = await req.json();

    console.log("Sending mention notification email for comment:", commentId);

    // Get mentioned user's email and name
    const { data: mentionedUser, error: mentionedError } = await supabaseClient
      .from("profiles")
      .select("email, full_name, username")
      .eq("id", mentionedUserId)
      .single();

    if (mentionedError || !mentionedUser) {
      console.error("Error fetching mentioned user:", mentionedError);
      throw new Error("Mentioned user not found");
    }

    // Get mentioner's name
    const { data: mentioner, error: mentionerError } = await supabaseClient
      .from("profiles")
      .select("full_name, username")
      .eq("id", mentionerUserId)
      .single();

    if (mentionerError || !mentioner) {
      console.error("Error fetching mentioner:", mentionerError);
      throw new Error("Mentioner not found");
    }

    // Get post info
    const { data: post, error: postError } = await supabaseClient
      .from("activity_feed")
      .select("title")
      .eq("id", postId)
      .single();

    const mentionerName = mentioner.full_name || mentioner.username || "Someone";
    const mentionedName = mentionedUser.full_name || mentionedUser.username || "there";
    const postTitle = post?.title || "a post";
    
    // Truncate content for preview
    const preview = content.length > 150 ? content.substring(0, 150) + "..." : content;

    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }

    const emailBody = {
      personalizations: [
        {
          to: [{ email: mentionedUser.email }],
          subject: `${mentionerName} mentioned you in a comment`,
        },
      ],
      from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
      content: [
        {
          type: "text/html",
          value: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">You Were Mentioned!</h1>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-top: 0;">Hi ${mentionedName},</p>
                  
                  <p style="font-size: 16px;"><strong>${mentionerName}</strong> mentioned you in a comment on <strong>${postTitle}</strong>:</p>
                  
                  <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #555; font-style: italic;">"${preview}"</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app") || "https://cydena.lovable.app"}/community" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      View Comment
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    You're receiving this email because someone mentioned you in a community post on Cydena.
                  </p>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                  <p>© ${new Date().getFullYear()} Cydena. All rights reserved.</p>
                </div>
              </body>
            </html>
          `,
        },
      ],
    };

    const sgResponse = await fetch(SENDGRID_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailBody),
    });

    if (!sgResponse.ok) {
      const errorText = await sgResponse.text();
      console.error("SendGrid mention email error:", errorText);
      throw new Error(`SendGrid API error: ${sgResponse.status}`);
    }

    console.log("Mention email sent successfully via SendGrid");

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-mention-notification function:", error);
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
