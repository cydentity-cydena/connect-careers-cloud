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

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CareerAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    loadUserContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to use the Career Assistant");
      navigate("/auth");
    }
  };

  const loadUserContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load candidate profile
      const { data: profile } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Load skills
      const { data: skills } = await supabase
        .from("candidate_skills")
        .select("*, skill:skills(name)")
        .eq("candidate_id", user.id);

      // Load certifications
      const { data: certs } = await supabase
        .from("certifications")
        .select("name, issuer")
        .eq("candidate_id", user.id);

      setUserContext({
        profile,
        skills: skills?.map(s => s.skill?.name),
        certifications: certs?.map(c => c.name),
      });

      console.log("Loaded user context:", { profile, skills, certs });
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

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="AI Career Assistant - Cydena"
        description="Get personalized career guidance, job recommendations, and resume optimization powered by AI"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">AI Career Assistant</h1>
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
                    <p className="whitespace-pre-wrap">{msg.content}</p>
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
          Powered by Lovable AI • Responses are AI-generated and should be verified
        </p>
      </main>
    </div>
  );
};

export default CareerAssistant;