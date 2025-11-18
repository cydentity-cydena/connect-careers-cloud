import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "Access Control",
  "Network Security", 
  "Cryptography",
  "Web Security",
  "Malware",
  "Social Engineering",
  "Cloud Security",
  "Incident Response",
  "Compliance",
  "Identity Management"
];

interface Challenge {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get date-based seed for consistent daily challenges
    const today = new Date().toISOString().split('T')[0];
    const dateSeed = today.split('-').join('');
    const categoryIndex = parseInt(dateSeed.slice(-2)) % CATEGORIES.length;
    const category = CATEGORIES[categoryIndex];

    console.log(`Generating Security IQ challenge for ${today}, category: ${category}`);

    // Generate challenge using Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity educator creating multiple-choice questions for professionals. Generate engaging, practical questions that test real-world knowledge. Always return valid JSON only, no additional text.`
          },
          {
            role: "user",
            content: `Generate a multiple-choice cybersecurity question about "${category}" for date ${today}.

Requirements:
- Intermediate to advanced difficulty level
- 4 answer options
- Clear, concise question
- Detailed explanation (2-3 sentences)
- Practical, real-world focused

Return ONLY valid JSON in this exact format:
{
  "question": "Your question here?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation here.",
  "category": "${category}"
}

The correctAnswer should be the index (0-3) of the correct option.`
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("AI response:", content);
    
    // Parse the AI response
    let challenge: Challenge;
    try {
      challenge = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    // Validate the challenge structure
    if (!challenge.question || !challenge.options || challenge.options.length !== 4 || 
        challenge.correctAnswer === undefined || !challenge.explanation || !challenge.category) {
      throw new Error("Invalid challenge structure from AI");
    }

    console.log("Successfully generated challenge:", challenge.question);

    return new Response(
      JSON.stringify(challenge),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-security-iq-challenge:", error);
    
    // Return a fallback challenge if generation fails
    const fallbackChallenge: Challenge = {
      question: "What is the primary purpose of two-factor authentication (2FA)?",
      options: [
        "To encrypt data in transit",
        "To add an extra layer of security beyond passwords",
        "To automatically update passwords regularly",
        "To scan for malware"
      ],
      correctAnswer: 1,
      explanation: "Two-factor authentication adds an additional security layer by requiring a second form of verification beyond just a password. This significantly reduces the risk of unauthorized access even if a password is compromised.",
      category: "Identity Management"
    };
    
    return new Response(
      JSON.stringify(fallbackChallenge),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
