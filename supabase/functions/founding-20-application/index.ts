import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.json();

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
        stage: 'new_application',
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
        type: 'info',
        title: 'New Founding 20 Application',
        message: `${formData.fullName} has applied for the Founding 20 program`,
        link: '/staff/funnel',
      }));

      await supabase.from('notifications').insert(notifications);
    }

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
