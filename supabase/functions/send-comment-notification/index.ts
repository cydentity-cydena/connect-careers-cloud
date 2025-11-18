import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "notifications@cydena.app";
const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Cydena Community";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommentNotificationRequest {
  commentId: string;
  postAuthorId: string;
  commenterId: string;
  postTitle: string;
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

    const { commentId, postAuthorId, commenterId, postTitle }: CommentNotificationRequest = await req.json();

    console.log("Sending comment notification email for comment:", commentId);

    // Get post author's email and name
    const { data: postAuthor, error: postAuthorError } = await supabaseClient
      .from("profiles")
      .select("email, full_name, username")
      .eq("id", postAuthorId)
      .single();

    if (postAuthorError || !postAuthor || !postAuthor.email) {
      console.error("Error fetching post author:", postAuthorError);
      throw new Error("Post author not found");
    }

    // Get commenter's name
    const { data: commenter, error: commenterError } = await supabaseClient
      .from("profiles")
      .select("full_name, username")
      .eq("id", commenterId)
      .single();

    if (commenterError || !commenter) {
      console.error("Error fetching commenter:", commenterError);
      throw new Error("Commenter not found");
    }

    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }

    const commenterName = commenter.full_name || commenter.username || "Someone";
    const recipientName = postAuthor.full_name || postAuthor.username || "there";

    const emailBody = {
      personalizations: [
        {
          to: [{ email: postAuthor.email }],
          subject: `💬 ${commenterName} commented on your post`,
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
                  <h1 style="color: white; margin: 0; font-size: 24px;">💬 New Comment</h1>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-top: 0;">Hi ${recipientName},</p>
                  
                  <p style="font-size: 16px;"><strong>${commenterName}</strong> commented on your post:</p>
                  
                  <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #555; font-weight: 600;">${postTitle}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app") || "https://cydena.lovable.app"}/community" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      View Comment
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    You're receiving this email because someone commented on your post in the Cydena community.
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

    const response = await fetch(SENDGRID_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SendGrid error:`, errorText);
      throw new Error(`SendGrid API error: ${errorText}`);
    }

    console.log("Comment notification email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-comment-notification function:", error);
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
