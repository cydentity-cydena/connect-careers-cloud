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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { saveAsResume = false } = await req.json();

    // Fetch all candidate data
    const [profileData, candidateProfile, skills, certifications, workHistory, education] = await Promise.all([
      supabaseClient.from("profiles").select("*").eq("id", user.id).single(),
      supabaseClient.from("candidate_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabaseClient.from("candidate_skills").select("*, skills(name)").eq("candidate_id", user.id),
      supabaseClient.from("certifications").select("*").eq("candidate_id", user.id),
      supabaseClient.from("work_history").select("*").eq("candidate_id", user.id).order("start_date", { ascending: false }),
      supabaseClient.from("education").select("*").eq("candidate_id", user.id).order("start_date", { ascending: false }),
    ]);

    const profile = profileData.data;
    const candidateInfo = candidateProfile.data;
    const skillsList = skills.data || [];
    const certsList = certifications.data || [];
    const workList = workHistory.data || [];
    const eduList = education.data || [];

    // Build structured data for AI
    const profileSummary = {
      fullName: profile?.full_name || "Candidate",
      email: profile?.email,
      phone: candidateInfo?.phone,
      location: profile?.location,
      bio: profile?.bio,
      title: candidateInfo?.title,
      yearsExperience: candidateInfo?.years_experience,
      professionalStatement: candidateInfo?.professional_statement,
      linkedIn: candidateInfo?.linkedin_url,
      github: candidateInfo?.github_url,
      portfolio: candidateInfo?.portfolio_url,
      skills: skillsList.map((s: any) => ({
        name: s.skills?.name,
        proficiency: s.proficiency_level,
        years: s.years_experience,
      })),
      certifications: certsList.map((c: any) => ({
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issue_date,
        expiryDate: c.expiry_date,
        credentialId: c.credential_id,
      })),
      workHistory: workList.map((w: any) => ({
        company: w.company,
        role: w.role,
        startDate: w.start_date,
        endDate: w.end_date,
        isCurrent: w.is_current,
        description: w.description,
        location: w.location,
      })),
      education: eduList.map((e: any) => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.field_of_study,
        startDate: e.start_date,
        endDate: e.end_date,
        gpa: e.gpa,
        description: e.description,
      })),
    };

    // Call Lovable AI to generate formatted resume
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a professional resume writer. Generate a well-formatted, ATS-friendly resume in plain text format based on the candidate's profile data. 

Structure the resume with clear sections:
- Contact Information
- Professional Summary
- Skills (organized by category if possible)
- Professional Experience (with bullet points for achievements)
- Education
- Certifications

Use professional language, action verbs, and quantifiable achievements where possible. Keep it concise and impactful. Format with proper spacing and bullet points using "• " for better readability.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Generate a professional resume for this candidate:\n\n${JSON.stringify(profileSummary, null, 2)}` 
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("Failed to generate resume with AI");
    }

    const aiData = await aiResponse.json();
    const resumeContent = aiData.choices[0].message.content;

    // If requested, save as a resume in the database
    let resumeId = null;
    if (saveAsResume) {
      // Check if an auto-generated resume already exists
      const { data: existingResume } = await supabaseClient
        .from("candidate_resumes")
        .select("id")
        .eq("candidate_id", user.id)
        .eq("resume_type", "auto-generated")
        .maybeSingle();

      if (existingResume) {
        // Update existing auto-generated resume
        const { data: updated } = await supabaseClient
          .from("candidate_resumes")
          .update({
            resume_name: `${profile?.full_name || 'Candidate'} - Auto-Generated Resume`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingResume.id)
          .select()
          .single();
        
        resumeId = updated?.id;
      } else {
        // Create new auto-generated resume entry
        const { data: newResume } = await supabaseClient
          .from("candidate_resumes")
          .insert({
            candidate_id: user.id,
            resume_name: `${profile?.full_name || 'Candidate'} - Auto-Generated Resume`,
            resume_type: "auto-generated",
            resume_url: `auto-generated-${user.id}`, // placeholder URL
            is_primary: false,
            is_visible_to_employers: true,
          })
          .select()
          .single();
        
        resumeId = newResume?.id;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        resumeContent,
        resumeId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating resume:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});