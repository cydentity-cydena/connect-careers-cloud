import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

interface MCQChallenge {
  type: "mcq";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface CTFChallenge {
  type: "ctf";
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  hints: any;
  flag: string;
}

type Challenge = MCQChallenge | CTFChallenge;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get date-based seed for consistent daily challenges
    const today = new Date().toISOString().split('T')[0];
    const dateSeed = today.split('-').join('');
    
    // Decide challenge type based on date (50/50 mix)
    const dayNumber = parseInt(dateSeed);
    const isCTFDay = dayNumber % 2 === 0;
    
    if (isCTFDay) {
      // Fetch an active CTF challenge
      console.log(`Fetching CTF challenge for ${today}`);
      
      const { data: ctfChallenges, error } = await supabase
        .from('ctf_challenges')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error("Error fetching CTF challenges:", error);
        throw error;
      }
      
      if (!ctfChallenges || ctfChallenges.length === 0) {
        console.log("No CTF challenges found, falling back to MCQ");
      } else {
        // Select a CTF challenge based on date
        const challengeIndex = dayNumber % ctfChallenges.length;
        const ctfChallenge = ctfChallenges[challengeIndex];
        
        const challenge: CTFChallenge = {
          type: "ctf",
          id: ctfChallenge.id,
          title: ctfChallenge.title,
          description: ctfChallenge.description,
          category: ctfChallenge.category,
          difficulty: ctfChallenge.difficulty,
          points: ctfChallenge.points,
          hints: ctfChallenge.hints,
          flag: ctfChallenge.flag
        };
        
        console.log("Successfully fetched CTF challenge:", challenge.title);
        
        return new Response(
          JSON.stringify(challenge),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    // Generate MCQ challenge
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
    let content = data.choices[0].message.content;
    
    console.log("AI response:", content);
    
    // Strip markdown code blocks if present
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.slice(7); // Remove ```json
    } else if (content.startsWith('```')) {
      content = content.slice(3); // Remove ```
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3); // Remove trailing ```
    }
    content = content.trim();
    
    // Parse the AI response
    let mcqData: any;
    try {
      mcqData = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    // Validate the challenge structure
    if (!mcqData.question || !mcqData.options || mcqData.options.length !== 4 || 
        mcqData.correctAnswer === undefined || !mcqData.explanation || !mcqData.category) {
      throw new Error("Invalid challenge structure from AI");
    }

    const challenge: MCQChallenge = {
      type: "mcq",
      ...mcqData
    };

    console.log("Successfully generated MCQ challenge:", challenge.question);

    return new Response(
      JSON.stringify(challenge),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-security-iq-challenge:", error);
    
    // Return a fallback MCQ challenge if generation fails
    const fallbackChallenge: MCQChallenge = {
      type: "mcq",
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
