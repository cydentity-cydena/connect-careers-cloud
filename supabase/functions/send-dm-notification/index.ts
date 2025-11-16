import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DMNotificationRequest {
  messageId: string;
  recipientId: string;
  senderId: string;
  content: string;
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

    const { messageId, recipientId, senderId, content }: DMNotificationRequest = await req.json();

    console.log("Sending DM notification email for message:", messageId);

    // Get recipient's email and name
    const { data: recipient, error: recipientError } = await supabaseClient
      .from("profiles")
      .select("email, full_name, username")
      .eq("id", recipientId)
      .single();

    if (recipientError || !recipient) {
      console.error("Error fetching recipient:", recipientError);
      throw new Error("Recipient not found");
    }

    // Get sender's name
    const { data: sender, error: senderError } = await supabaseClient
      .from("profiles")
      .select("full_name, username")
      .eq("id", senderId)
      .single();

    if (senderError || !sender) {
      console.error("Error fetching sender:", senderError);
      throw new Error("Sender not found");
    }

    const senderName = sender.full_name || sender.username || "Someone";
    const recipientName = recipient.full_name || recipient.username || "there";
    
    // Truncate content for preview
    const preview = content.length > 100 ? content.substring(0, 100) + "..." : content;

    const emailResponse = await resend.emails.send({
      from: "Cydena <notifications@cydena.app>",
      to: [recipient.email],
      subject: `New message from ${senderName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Direct Message</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-top: 0;">Hi ${recipientName},</p>
              
              <p style="font-size: 16px;">You have received a new message from <strong>${senderName}</strong>:</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #555; font-style: italic;">"${preview}"</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app") || "https://cydena.lovable.app"}/messages" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  View Message
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                You're receiving this email because you have an account on Cydena and someone sent you a direct message.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Cydena. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-dm-notification function:", error);
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
