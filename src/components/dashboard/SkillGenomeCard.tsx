import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Atom, Share2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SkillGenome3D } from "./SkillGenome3D";
import html2canvas from "html2canvas";

interface SkillData {
  name: string;
  value: number;
  category: string;
  color: string;
}

export function SkillGenomeCard() {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<SkillData[]>([]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: skillsData, error } = await supabase
        .from("candidate_skills")
        .select("proficiency_level, skills(name, category)")
        .eq("candidate_id", user.id)
        .limit(8); // Limit to 8 skills for better visualization

      if (error) throw error;

      if (skillsData && skillsData.length > 0) {
        const categoryColors: Record<string, string> = {
          "Security": "#00ff88",
          "Development": "#00ccff",
          "Cloud": "#ff00ff",
          "Network": "#ffaa00",
          "Compliance": "#ff0088",
          "default": "#888888"
        };

        const formattedSkills: SkillData[] = skillsData.map(s => ({
          name: (s.skills as any)?.name || "Unknown",
          value: s.proficiency_level || 50,
          category: (s.skills as any)?.category || "Other",
          color: categoryColors[(s.skills as any)?.category] || categoryColors.default
        }));

        setSkills(formattedSkills);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to load skill data");
    } finally {
      setLoading(false);
    }
  };

  const captureVisualization = async () => {
    const element = document.getElementById("skill-genome-card");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#0f172a",
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;

        if (navigator.share) {
          const file = new File([blob], "my-skill-genome.png", { type: "image/png" });
          navigator.share({
            title: "My Cybersecurity Skill Genome",
            text: "Check out my verified skills visualization on Cydena!",
            files: [file],
          }).catch(() => {
            downloadImage(canvas);
          });
        } else {
          downloadImage(canvas);
        }
      });
    } catch (error) {
      console.error("Error capturing visualization:", error);
      toast.error("Failed to capture visualization");
    }
  };

  const downloadImage = (canvas: HTMLCanvasElement) => {
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "skill-genome.png";
    a.click();
    toast.success("Image downloaded!");
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (skills.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Atom className="h-5 w-5 text-primary" />
            Skill Genome
          </CardTitle>
          <CardDescription>
            Add skills to your profile to see your 3D visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = "/skills"}>
            Add Skills
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="skill-genome-card" className="border-primary/20 bg-gradient-to-br from-background to-background/95">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Atom className="h-5 w-5 text-primary" />
              Your Skill Genome
            </CardTitle>
            <CardDescription>
              Interactive 3D visualization of your verified cybersecurity skills
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={captureVisualization}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={captureVisualization}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SkillGenome3D skills={skills} />
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-muted"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: skill.color }}
              />
              <span>{skill.name}</span>
              <span className="text-muted-foreground">{skill.value}%</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          💡 Drag to rotate • Scroll to zoom • Click skills to see details
        </p>
      </CardContent>
    </Card>
  );
}
