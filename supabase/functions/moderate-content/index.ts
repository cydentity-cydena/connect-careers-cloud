import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, isAdmin } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Content moderation service unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to check for inappropriate content
    // For admins, only check for profanity and hate speech (allow links and promotional content)
    const moderationPrompt = isAdmin 
      ? `You are a content moderation system for a professional cybersecurity platform.
Analyze the following text posted by an ADMIN and determine if it contains:
- Profanity or vulgar language
- Hate speech or discriminatory content
- Harassment or bullying

Note: Admins ARE allowed to post links, URLs, promotional content, meeting invites, and calls to action. Only flag truly inappropriate content.

Text to analyze: "${content}"

Respond ONLY with a JSON object in this exact format (no other text):
{"appropriate": true/false, "reason": "brief explanation if inappropriate, empty string if appropriate"}`
      : `You are a content moderation system for a professional cybersecurity platform. 
Analyze the following text and determine if it contains:
- Profanity or vulgar language
- Hate speech or discriminatory content
- Harassment or bullying
- Spam or promotional content
- Any other inappropriate content for a professional community

Text to analyze: "${content}"

Respond ONLY with a JSON object in this exact format (no other text):
{"appropriate": true/false, "reason": "brief explanation if inappropriate, empty string if appropriate"}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: moderationPrompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status, await response.text());
      // Fail open - allow content if moderation service is down
      return new Response(
        JSON.stringify({ appropriate: true, reason: '' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices?.[0]?.message?.content || '{"appropriate": true, "reason": ""}';
    
    // Parse the AI response
    let moderationResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        moderationResult = JSON.parse(jsonMatch[0]);
      } else {
        moderationResult = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      // Fail open - allow content if we can't parse the response
      moderationResult = { appropriate: true, reason: '' };
    }

    return new Response(
      JSON.stringify(moderationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in moderate-content function:', error);
    // Fail open - allow content if there's an error
    return new Response(
      JSON.stringify({ appropriate: true, reason: '' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
