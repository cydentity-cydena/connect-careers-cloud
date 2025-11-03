import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASSESSMENT_TYPES = {
  soc_analyst: {
    title: "SOC Analyst Assessment",
    questions: [
      "You receive an alert about multiple failed login attempts from an IP address. Walk through your investigation process.",
      "What's the difference between a SIEM and a SOAR platform? When would you use each?",
      "A user reports their account sending spam emails. What steps do you take to investigate and remediate?",
      "Explain how you would detect and respond to a potential data exfiltration attempt.",
      "What indicators would suggest a ransomware attack is in progress on your network?"
    ]
  },
  penetration_tester: {
    title: "Penetration Tester Assessment",
    questions: [
      "Describe your methodology for conducting a web application penetration test from reconnaissance to reporting.",
      "You've identified an SQL injection vulnerability. Explain how you would exploit it and what data you'd target.",
      "What's the difference between black box, white box, and grey box testing? When is each appropriate?",
      "Walk through how you would perform privilege escalation on a Linux system after gaining initial access.",
      "Explain how you would bypass common WAF protections during a penetration test."
    ]
  },
  security_engineer: {
    title: "Security Engineer Assessment",
    questions: [
      "Design a secure network architecture for a mid-sized company with 500 employees and cloud infrastructure.",
      "How would you implement zero-trust architecture in an existing enterprise environment?",
      "Explain your approach to securing a CI/CD pipeline for a development team.",
      "What security controls would you implement for a new cloud-native application?",
      "Describe how you would design and implement a vulnerability management program."
    ]
  },
  incident_responder: {
    title: "Incident Response Specialist Assessment",
    questions: [
      "Walk through your process for responding to a suspected ransomware infection on a critical server.",
      "How do you determine the scope and timeline of a security breach during an active incident?",
      "Describe your approach to collecting and preserving digital evidence during an incident investigation.",
      "What's your methodology for containing a compromised system while maintaining business operations?",
      "Explain how you would coordinate communication between technical teams, management, and legal during a major incident."
    ]
  },
  threat_intel_analyst: {
    title: "Threat Intelligence Analyst Assessment",
    questions: [
      "How do you assess the credibility and relevance of threat intelligence from different sources?",
      "Describe your process for tracking and attributing an Advanced Persistent Threat (APT) campaign.",
      "What indicators of compromise (IOCs) would you prioritize when investigating a potential state-sponsored attack?",
      "Explain how you would create actionable threat intelligence from raw data for different stakeholders.",
      "How do you use the MITRE ATT&CK framework to improve your organization's defensive posture?"
    ]
  },
  cloud_security: {
    title: "Cloud Security Engineer Assessment",
    questions: [
      "Design a secure multi-account AWS environment using security best practices and services.",
      "How would you detect and prevent data leakage from misconfigured S3 buckets or Azure Storage accounts?",
      "Explain your approach to implementing identity and access management in a multi-cloud environment.",
      "What security controls would you implement for a containerized application running in Kubernetes?",
      "Describe how you would secure serverless functions and prevent common cloud-native vulnerabilities."
    ]
  },
  grc_analyst: {
    title: "GRC Analyst Assessment",
    questions: [
      "Walk through your process for conducting a risk assessment for a new business initiative.",
      "How would you prepare an organization for an ISO 27001 or SOC 2 audit?",
      "Explain how you would develop and maintain security policies that balance compliance with business needs.",
      "Describe your approach to managing third-party vendor security risks.",
      "How do you track and report on security metrics and KPIs to executive leadership?"
    ]
  },
  security_architect: {
    title: "Security Architect Assessment",
    questions: [
      "Design a comprehensive security architecture for a financial services company handling sensitive customer data.",
      "How would you architect a secure remote access solution for a distributed workforce?",
      "Explain your approach to threat modeling for a new application or system.",
      "What security design patterns would you implement for a microservices architecture?",
      "Describe how you would balance security requirements with performance and user experience."
    ]
  },
  appsec_engineer: {
    title: "Application Security Engineer Assessment",
    questions: [
      "How would you implement a secure software development lifecycle (SSDLC) in an agile development environment?",
      "Explain your approach to identifying and remediating OWASP Top 10 vulnerabilities in code.",
      "What tools and processes would you use for automated security testing in a CI/CD pipeline?",
      "Describe how you would conduct a security code review for a critical application feature.",
      "How do you work with developers to fix security issues without slowing down releases?"
    ]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, assessmentType, answers } = await req.json();

    // Get questions for assessment type
    if (action === 'getQuestions') {
      const assessment = ASSESSMENT_TYPES[assessmentType as keyof typeof ASSESSMENT_TYPES];
      if (!assessment) {
        throw new Error('Invalid assessment type');
      }

      return new Response(
        JSON.stringify({
          title: assessment.title,
          questions: assessment.questions
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Grade assessment using AI
    if (action === 'gradeAssessment') {
      const assessment = ASSESSMENT_TYPES[assessmentType as keyof typeof ASSESSMENT_TYPES];
      if (!assessment) {
        throw new Error('Invalid assessment type');
      }

      // Prepare evaluation prompt with AI detection
      const systemPrompt = `You are an expert cybersecurity interviewer evaluating a candidate's technical knowledge for a ${assessment.title} position. 

CRITICAL: Detect if answers appear to be AI-generated rather than from genuine human experience.

Grade each answer on a scale of 0-20 points based on:
- Technical accuracy (40%)
- Depth of understanding (30%)
- Practical application (20%)
- Communication clarity (10%)

AI DETECTION CRITERIA:
- Generic, textbook-style responses without personal context → Flag as "likely_ai"
- Overly perfect formatting and structure → Suspicious
- Lack of specific tools, company names, or real scenarios → Red flag
- Too comprehensive without depth in specific areas → AI characteristic
- Missing personal pronouns or experiential language → Warning sign

Deduct 50% from scores if answers appear AI-generated.
Provide constructive feedback for each answer.`;

      const evaluationPrompt = `Evaluate these answers for a ${assessment.title}:

${assessment.questions.map((q, i) => `
Question ${i + 1}: ${q}
Answer: ${answers[i] || 'No answer provided'}
`).join('\n')}

Return your evaluation in this exact JSON format:
{
  "scores": [score1, score2, score3, score4, score5],
  "feedback": ["feedback1", "feedback2", "feedback3", "feedback4", "feedback5"],
  "aiDetectionFlags": [boolean1, boolean2, boolean3, boolean4, boolean5],
  "overallScore": totalScore,
  "summary": "Overall assessment summary",
  "integrityScore": 0-100 (100 = definitely human, 0 = definitely AI),
  "integrityNotes": "Brief explanation of AI detection findings"
}`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: evaluationPrompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI evaluation failed: ${aiResponse.statusText}`);
      }

      const aiResult = await aiResponse.json();
      const evaluation = JSON.parse(aiResult.choices[0].message.content);

      // Store assessment results
      const { error: insertError } = await supabase
        .from('skills_assessments')
        .insert({
          candidate_id: user.id,
          assessment_type: assessmentType,
          questions: assessment.questions,
          answers: answers,
          score: Math.round(evaluation.overallScore),
          ai_feedback: evaluation
        });

      if (insertError) {
        console.error('Error storing assessment:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          score: Math.round(evaluation.overallScore),
          feedback: evaluation
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Skills assessment error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});