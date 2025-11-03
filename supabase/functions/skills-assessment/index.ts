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

      // Prepare evaluation prompt
      const systemPrompt = `You are an expert cybersecurity interviewer evaluating a candidate's technical knowledge for a ${assessment.title} position. 
      
Grade each answer on a scale of 0-20 points based on:
- Technical accuracy (40%)
- Depth of understanding (30%)
- Practical application (20%)
- Communication clarity (10%)

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
  "overallScore": totalScore,
  "summary": "Overall assessment summary"
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