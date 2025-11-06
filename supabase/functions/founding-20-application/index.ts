import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

async function sendEmailNotification(formData: any) {
  if (!SENDGRID_API_KEY) {
    console.error("SendGrid API key not configured");
    return;
  }

  const emailBody = {
    personalizations: [{
      to: [{ email: "contact@cydena.com" }],
      subject: `New Founding 20 Application - ${formData.fullName}`,
    }],
    from: { 
      email: "noreply@cydena.com",
      name: "Cydena Founding 20"
    },
    content: [{
      type: "text/html",
      value: `
        <h2>New Founding 20 Application Received</h2>
        
        <h3>Personal Information</h3>
        <p><strong>Name:</strong> ${formData.fullName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
        
        <h3>Professional Background</h3>
        <p><strong>Current Title:</strong> ${formData.currentTitle}</p>
        <p><strong>Years of Experience:</strong> ${formData.yearsExperience}</p>
        <p><strong>Top Certifications:</strong></p>
        <p>${formData.topCertifications.replace(/\n/g, '<br>')}</p>
        
        <p><strong>Key Skills:</strong></p>
        <p>${formData.keySkills.replace(/\n/g, '<br>')}</p>
        
        <h3>Availability & Expectations</h3>
        <p><strong>Availability:</strong> ${formData.availability}</p>
        <p><strong>Salary Expectations:</strong> ${formData.salaryExpectations}</p>
        
        <h3>Online Presence</h3>
        <p><strong>LinkedIn:</strong> ${formData.linkedinUrl || 'Not provided'}</p>
        <p><strong>GitHub:</strong> ${formData.githubUrl || 'Not provided'}</p>
        <p><strong>Portfolio:</strong> ${formData.portfolioUrl || 'Not provided'}</p>
        
        <h3>Why They Should Be in the Founding 20</h3>
        <p>${formData.whyTopTwenty.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><small>View and manage this application in your <a href="https://cydena.com/staff/funnel">Staff Funnel</a></small></p>
      `
    }]
  };

  try {
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
      console.error("SendGrid API error:", response.status, errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log("Email notification sent successfully");
  } catch (error) {
    console.error("Failed to send email notification:", error);
    // Don't throw - we don't want email failures to block the application submission
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const formData = await req.json();

    // Optional CV upload via service role
    let cvFilePath = formData.cvUrl || null;
    if (formData.cvBase64 && formData.cvFileName) {
      try {
        const base64Str = String(formData.cvBase64);
        const cleanBase64 = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
        const binary = atob(cleanBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const ext = String(formData.cvFileName).split('.').pop() || 'bin';
        const path = `founding-20/${crypto.randomUUID()}.${ext}`;
        const contentType = formData.cvContentType || 'application/octet-stream';
        const { error: uploadErr } = await supabase.storage.from('resumes').upload(path, bytes, { contentType });
        if (uploadErr) {
          console.error('Resume upload failed:', uploadErr);
        } else {
          cvFilePath = path;
        }
      } catch (e) {
        console.error('Error processing CV upload:', e);
      }
    }

    // Validate required fields
    const requiredFields = [
      'fullName', 'email', 'yearsExperience', 'currentTitle',
      'topCertifications', 'keySkills', 'availability', 'salaryExpectations', 'whyTopTwenty'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create a pipeline candidate entry
    const { data: pipelineEntry, error: pipelineError } = await supabase
      .from('pipeline_candidates')
      .insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        current_title: formData.currentTitle,
        years_experience: parseInt(formData.yearsExperience),
        top_certifications: formData.topCertifications,
        key_skills: formData.keySkills,
        availability: formData.availability,
        salary_expectations: formData.salaryExpectations,
        linkedin_url: formData.linkedinUrl || null,
        github_url: formData.githubUrl || null,
        portfolio_url: formData.portfolioUrl || null,
        why_top_twenty: formData.whyTopTwenty,
        cv_url: cvFilePath,
        stage: 'applied',
        is_founding_20: true,
        application_source: 'founding_20_page',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pipelineError) {
      console.error('Error creating pipeline entry:', pipelineError);
      throw pipelineError;
    }

    // Notify admins about the new application
    const { data: adminUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'staff']);

    if (adminUsers && adminUsers.length > 0) {
      const notifications = adminUsers.map(admin => ({
        user_id: admin.user_id,
        type: 'system',
        title: 'New Founding 20 Application',
        message: `${formData.fullName} has applied for the Founding 20 program`,
        link: '/staff/funnel',
      }));

      await supabase.from('notifications').insert(notifications);
    }

    // Send email notification to contact@cydena.com
    await sendEmailNotification(formData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Application submitted successfully',
        pipelineId: pipelineEntry.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('Error processing application:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
