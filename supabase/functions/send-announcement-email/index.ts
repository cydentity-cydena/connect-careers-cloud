import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "notifications@cydena.app";
const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Cydena Updates";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnnouncementRequest {
  postId: string;
  activityType: string;
  title: string;
  description: string;
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

    const { postId, activityType, title, description }: AnnouncementRequest = await req.json();

    console.log("Sending announcement emails for post:", postId);

    // Get users who should NOT receive community emails (employers and recruiters without admin/staff)
    const { data: excludedUsers, error: excludedError } = await supabaseClient
      .from("user_roles")
      .select("user_id, role");

    if (excludedError) {
      console.error("Error fetching user roles:", excludedError);
      throw new Error("Failed to fetch user roles");
    }

    // Build a map of user_id to their roles
    const userRolesMap = new Map<string, Set<string>>();
    excludedUsers?.forEach(row => {
      if (!userRolesMap.has(row.user_id)) {
        userRolesMap.set(row.user_id, new Set());
      }
      userRolesMap.get(row.user_id)!.add(row.role);
    });

    // Filter logic matching Community.tsx access rules:
    // - Exclude if user has employer OR recruiter role
    // - UNLESS they also have admin OR staff role
    const excludedUserIds = new Set<string>();
    userRolesMap.forEach((roles, userId) => {
      const hasAdminOrStaff = roles.has('admin') || roles.has('staff');
      const hasEmployerOrRecruiter = roles.has('employer') || roles.has('recruiter');
      
      if (hasEmployerOrRecruiter && !hasAdminOrStaff) {
        excludedUserIds.add(userId);
      }
    });

    console.log(`Excluding ${excludedUserIds.size} employer/recruiter users`);

    // Get all profiles except excluded ones (with email directly from profiles)
    const { data: allProfiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("id, full_name, username, email");

    if (profilesError || !allProfiles) {
      console.error("Error fetching profiles:", profilesError);
      throw new Error("Failed to fetch profiles");
    }

    // Filter out excluded users and those without emails
    const users = allProfiles
      .filter(p => !excludedUserIds.has(p.id) && p.email)
      .map(profile => ({
        email: profile.email,
        full_name: profile.full_name,
        username: profile.username,
      }));

    console.log(`Found ${users.length} eligible recipients with emails (from ${allProfiles.length} total profiles)`);

    if (users.length === 0) {
      console.error("No users with valid emails found");
      throw new Error("No users with emails found");
    }

    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }

    const announcementType = activityType === "release" 
      ? "Version Release" 
      : activityType === "bug_fix" 
        ? "Bug Fix" 
        : activityType === "announcement"
          ? "Announcement"
          : "Community Update";
    
    const emailSubject = activityType === "release" 
      ? `🚀 New Version Release: ${title}` 
      : activityType === "bug_fix"
        ? `🐛 Bug Fix Update: ${title}`
        : activityType === "announcement"
          ? `📢 ${title}`
          : `✨ ${title}`;

    // Send email to all users in batches
    const batchSize = 50; let totalFailures = 0;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const emailPromises = batch.map(async (user) => {
        const userName = user.full_name || user.username || "there";
        
        const emailBody = {
          personalizations: [
            {
              to: [{ email: user.email }],
              subject: emailSubject,
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
                      <h1 style="color: white; margin: 0; font-size: 24px;">${announcementType}</h1>
                    </div>
                    
                    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                      <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
                      
                      <h2 style="color: #667eea; font-size: 20px; margin: 20px 0;">${title}</h2>
                      
                      ${description ? `
                        <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
                          <p style="margin: 0; color: #555; white-space: pre-wrap; word-wrap: break-word; line-height: 1.6;">${description.replace(/\n/g, '<br>')}</p>
                        </div>
                      ` : ''}
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="https://app.cydena.com/community" 
                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          View in Community
                        </a>
                      </div>
                      
                      <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        You're receiving this email because you're a member of the Cydena community.
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
          console.error(`SendGrid error for ${user.email}:`, errorText);
          totalFailures++;
          return { ok: false, email: user.email, error: errorText };
        }

        return { ok: true, email: user.email };
      });

      await Promise.allSettled(emailPromises);
      console.log(`Sent batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(users.length / batchSize)}. Failures so far: ${totalFailures}`);
    }

    console.log(`Announcement email processing complete. Total recipients: ${users.length}, failures: ${totalFailures}`);

    return new Response(
      JSON.stringify({ success: totalFailures === 0, recipients: users.length, failed: totalFailures }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-announcement-email function:", error);
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
