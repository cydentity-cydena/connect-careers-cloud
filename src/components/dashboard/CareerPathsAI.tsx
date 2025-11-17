import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Clock, DollarSign, Target, CheckCircle, Share2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface CareerPath {
  role: string;
  probability: number;
  timeline: number;
  salary_range: string;
  required_skills: string[];
  required_certs: string[];
  description: string;
  next_steps: string[];
}

export function CareerPathsAI() {
  const [loading, setLoading] = useState(false);
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-predictions");
      
      if (error) {
        if (error.message?.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please try again in a few minutes.");
        } else if (error.message?.includes("credits")) {
          toast.error("AI credits exhausted. Please add credits to continue.");
        } else {
          toast.error("Failed to generate predictions");
        }
        console.error("Error:", error);
        return;
      }

      if (data?.paths) {
        setPaths(data.paths);
        toast.success("Career paths generated!");
      } else {
        toast.error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast.error("Failed to generate predictions");
    } finally {
      setLoading(false);
    }
  };

  const shareCard = async (pathIndex: number) => {
    const element = document.getElementById(`career-path-${pathIndex}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        if (navigator.share) {
          const file = new File([blob], "career-path.png", { type: "image/png" });
          navigator.share({
            title: `My Career Path: ${paths[pathIndex].role}`,
            text: `Check out my AI-predicted career path on Cydena!`,
            files: [file],
          }).catch(() => {
            // Fallback to download
            downloadImage(canvas);
          });
        } else {
          downloadImage(canvas);
        }
      });
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to generate share image");
    }
  };

  const downloadImage = (canvas: HTMLCanvasElement) => {
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-path.png";
    a.click();
    toast.success("Image downloaded!");
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return "text-green-500";
    if (prob >= 40) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-background to-background/95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Career GPS - AI Path Predictor
              </CardTitle>
              <CardDescription>
                Discover your personalized career trajectories powered by AI
              </CardDescription>
            </div>
            {paths.length === 0 && (
              <Button onClick={generatePredictions} disabled={loading} size="lg">
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? "Analyzing..." : "Generate My Paths"}
              </Button>
            )}
          </div>
        </CardHeader>

        {paths.length > 0 && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Based on your skills, certifications, and experience
              </p>
              <Button onClick={generatePredictions} variant="outline" size="sm" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Regenerate
              </Button>
            </div>

            <div className="grid gap-4">
              {paths.map((path, index) => (
                <Card
                  key={index}
                  id={`career-path-${index}`}
                  className="border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedPath(selectedPath === index ? null : index)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{path.role}</CardTitle>
                        <CardDescription>{path.description}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareCard(index);
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          Probability
                        </div>
                        <div className={`text-2xl font-bold ${getProbabilityColor(path.probability)}`}>
                          {path.probability}%
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Timeline
                        </div>
                        <div className="text-2xl font-bold">
                          {path.timeline}mo
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          Salary Range
                        </div>
                        <div className="text-lg font-bold">
                          {path.salary_range}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {selectedPath === index && (
                    <CardContent className="space-y-6 animate-fade-in">
                      {path.required_skills.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Skills to Develop
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {path.required_skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {path.required_certs.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Recommended Certifications
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {path.required_certs.map((cert) => (
                              <Badge key={cert} variant="outline">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-semibold">Next Steps</h4>
                        <ul className="space-y-2">
                          {path.next_steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={(e) => {
                          e.stopPropagation();
                          shareCard(index);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Career Card
                      </Button>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
