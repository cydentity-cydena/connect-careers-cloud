import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Sparkles, BriefcaseIcon, FileText, TrendingUp, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CareerAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userContext, setUserContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame for smoother scrolling during content updates
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [messages]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to use the Career Assistant");
        navigate("/auth");
        return;
      }
      // Only load context if user is authenticated
      await loadUserContext();
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    } finally {
      setIsAuthChecking(false);
    }
  };

  const loadUserContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load base profile
      const { data: baseProfile } = await supabase
        .from("profiles")
        .select("full_name, username, location, bio")
        .eq("id", user.id)
        .maybeSingle();

      // Load candidate profile
      const { data: candidateProfile } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Load skills with details
      const { data: skills } = await supabase
        .from("candidate_skills")
        .select("*, skill:skills(name, category)")
        .eq("candidate_id", user.id);

      // Load certifications
      const { data: certs } = await supabase
        .from("certifications")
        .select("name, issuer, issue_date, expiry_date, credential_url")
        .eq("candidate_id", user.id);

      // Load resumes
      const { data: resumes } = await supabase
        .from("candidate_resumes")
        .select("resume_name, resume_type, resume_url, is_primary")
        .eq("candidate_id", user.id)
        .order("is_primary", { ascending: false });

      // Load work history
      const { data: workHistory } = await supabase
        .from("work_history")
        .select("company, role, location, start_date, end_date, is_current, description")
        .eq("candidate_id", user.id)
        .order("start_date", { ascending: false });

      // Load education
      const { data: education } = await supabase
        .from("education")
        .select("institution, degree, field_of_study, start_date, end_date, gpa, description")
        .eq("candidate_id", user.id)
        .order("start_date", { ascending: false });

      // Load projects
      const { data: projects } = await supabase
        .from("projects")
        .select("name, description, url, github_url, tech_stack, start_date, end_date")
        .eq("candidate_id", user.id)
        .order("start_date", { ascending: false });

      const context = {
        profile: {
          ...baseProfile,
          ...candidateProfile,
        },
        skills: skills?.map(s => ({
          name: s.skill?.name,
          category: s.skill?.category,
          years_experience: s.years_experience,
          proficiency: s.proficiency_level,
        })) || [],
        certifications: certs?.map(c => ({
          name: c.name,
          issuer: c.issuer,
          issued: c.issue_date,
          expires: c.expiry_date,
          url: c.credential_url,
        })) || [],
        resumes: resumes?.map(r => ({
          name: r.resume_name,
          type: r.resume_type,
          url: r.resume_url,
          primary: r.is_primary,
        })) || [],
        workHistory: workHistory?.map(w => ({
          company: w.company,
          role: w.role,
          location: w.location,
          current: w.is_current,
          period: w.is_current 
            ? `${w.start_date} - Present` 
            : `${w.start_date} - ${w.end_date}`,
          description: w.description,
        })) || [],
        education: education?.map(e => ({
          institution: e.institution,
          degree: e.degree,
          field: e.field_of_study,
          period: `${e.start_date} - ${e.end_date}`,
          gpa: e.gpa,
          description: e.description,
        })) || [],
        projects: projects?.map(p => ({
          name: p.name,
          description: p.description,
          url: p.url,
          github: p.github_url,
          technologies: p.tech_stack,
          period: p.end_date 
            ? `${p.start_date} - ${p.end_date}`
            : `${p.start_date} - Ongoing`,
        })) || [],
      };

      setUserContext(context);
      console.log("Loaded comprehensive user context:", context);
    } catch (error) {
      console.error("Error loading context:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const CHAT_URL = `https://wbeomprrrmteftumwljf.supabase.co/functions/v1/career-assistant`;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: userContext,
        }),
      });

      if (response.status === 429) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast.error("AI usage limit reached. Please contact support.");
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      // Add placeholder for assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch (e) {
            // Incomplete JSON, put back and wait
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      icon: BriefcaseIcon,
      title: "Job Recommendations",
      prompt: "Based on my profile, what cybersecurity jobs would be a good fit for me?",
    },
    {
      icon: FileText,
      title: "Resume Review",
      prompt: "Can you review my profile and suggest how I can improve my resume for cybersecurity roles?",
    },
    {
      icon: TrendingUp,
      title: "Career Path",
      prompt: "What certifications should I pursue next to advance my cybersecurity career?",
    },
  ];

  // Show loading while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="AI Career Assistant - Cybersecurity Career Guidance"
          description="Get personalized cybersecurity career advice powered by AI. Resume optimization, job recommendations, certification paths, and interview prep for infosec roles."
          keywords="cybersecurity career advisor, AI career guidance, security analyst career path, infosec job recommendations"
        />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying access...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="AI Career Assistant - Cybersecurity Career Guidance"
        description="Get personalized cybersecurity career advice powered by AI. Resume optimization, job recommendations, certification paths, and interview prep for infosec roles."
        keywords="cybersecurity career advisor, AI career guidance, security analyst career path, infosec job recommendations"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">AI Career Assistant - Cybersecurity Career Guidance</h1>
          </div>
          <p className="text-muted-foreground">
            Your personal guide to cybersecurity career success
          </p>
        </div>

        {messages.length === 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:scale-105 transition-transform hover:border-primary"
                onClick={() => {
                  setInput(action.prompt);
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <action.icon className="h-5 w-5 text-primary" />
                    {action.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{action.prompt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-semibold mb-2">How can I help you today?</p>
                  <p className="text-sm">
                    Ask me about job recommendations, resume tips, or career advice
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-p:my-2 prose-ul:my-2 prose-li:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask me anything about your cybersecurity career..."
                className="min-h-[60px]"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          Responses are AI-generated and should be verified
        </p>
      </main>
    </div>
  );
};

export default CareerAssistant;