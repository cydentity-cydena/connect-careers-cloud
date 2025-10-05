import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();

    const apiKeyPresent = !!SENDGRID_API_KEY;
    if (!apiKeyPresent) {
      console.error("SENDGRID_API_KEY is not set. Configure the secret to enable email sending.");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Processing contact form submission from:", email);

    // Send email via SendGrid to contact@cydena.com
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="margin: 20px 0;">
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        </div>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Message:</strong></p>
          <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `;

    const sgPayload = {
      personalizations: [
        {
          to: [{ email: "contact@cydena.com" }],
        },
      ],
      from: { email: "contact@cydena.com", name: "Cydena Contact" },
      reply_to: { email, name },
      subject: `Contact Form: ${name}`,
      content: [
        { type: "text/html", value: html },
      ],
    };

    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sgPayload),
    });

    if (!sgRes.ok) {
      const errText = await sgRes.text();
      console.error("SendGrid error:", sgRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Email send failed", status: sgRes.status, details: errText }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const messageId = sgRes.headers.get("x-message-id") || sgRes.headers.get("X-Message-Id");
    console.log("Email sent via SendGrid. Message-Id:", messageId || "(none)");


    return new Response(JSON.stringify({ success: true, messageId }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.name || "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
