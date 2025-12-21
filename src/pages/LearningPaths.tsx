import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LearningPathCard } from "@/components/training/LearningPathCard";
import { LearningPathDetail } from "@/components/training/LearningPathDetail";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Youtube, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  channel_name: string;
  channel_url: string | null;
  difficulty: string | null;
  category: string | null;
  total_xp: number | null;
  display_order: number | null;
}

interface VideoCount {
  path_id: string;
  count: number;
}

const categories = [
  { value: "all", label: "All" },
  { value: "penetration-testing", label: "Penetration Testing" },
  { value: "networking", label: "Networking" },
  { value: "bug-bounty", label: "Bug Bounty" },
  { value: "malware-analysis", label: "Malware Analysis" },
  { value: "web-security", label: "Web Security" },
];

const difficulties = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function LearningPaths() {
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const { data: paths } = useQuery({
    queryKey: ["learning-paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_learning_paths")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as LearningPath[];
    },
  });

  const { data: videoCounts } = useQuery({
    queryKey: ["learning-paths-video-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_path_videos")
        .select("path_id");
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((v) => {
        counts[v.path_id] = (counts[v.path_id] || 0) + 1;
      });
      return counts;
    },
  });

  const { data: userCompletions } = useQuery({
    queryKey: ["learning-paths-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};
      
      const { data, error } = await supabase
        .from("youtube_video_completions")
        .select("path_id");
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((c) => {
        counts[c.path_id] = (counts[c.path_id] || 0) + 1;
      });
      return counts;
    },
  });

  const filteredPaths = paths?.filter((path) => {
    const matchesSearch =
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.channel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || path.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || path.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const totalXpAvailable = paths?.reduce((sum, p) => sum + (p.total_xp || 0), 0) || 0;
  const completedPaths = paths?.filter((p) => {
    const videoCount = videoCounts?.[p.id] || 0;
    const completed = userCompletions?.[p.id] || 0;
    return videoCount > 0 && completed === videoCount;
  }).length || 0;

  if (selectedPathId) {
    return (
      <>
        <SEO
          title="Learning Path | Cydena"
          description="Learn cybersecurity through curated YouTube courses"
        />
        <Navigation />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8">
            <LearningPathDetail
              pathId={selectedPathId}
              onBack={() => setSelectedPathId(null)}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Learning Paths | Free Cybersecurity Courses | Cydena"
        description="Learn cybersecurity for free with curated YouTube courses from top creators like IppSec, NetworkChuck, and John Hammond. Earn XP as you learn."
      />
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <Youtube className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Learning Paths</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Master cybersecurity with free YouTube courses from top creators.
              Complete videos to earn XP and track your progress.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm">
              <Youtube className="h-5 w-5 text-red-500" />
              <span>{paths?.length || 0} learning paths</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-5 w-5 text-primary" />
              <span>{totalXpAvailable} XP available</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-5 w-5 text-green-500" />
              <span>{completedPaths} paths completed</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search paths or channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {difficulties.map((diff) => (
              <Badge
                key={diff.value}
                variant={selectedDifficulty === diff.value ? "secondary" : "outline"}
                className={cn(
                  "cursor-pointer",
                  diff.value === "beginner" && selectedDifficulty === diff.value && "bg-green-500/20 text-green-500",
                  diff.value === "intermediate" && selectedDifficulty === diff.value && "bg-yellow-500/20 text-yellow-500",
                  diff.value === "advanced" && selectedDifficulty === diff.value && "bg-red-500/20 text-red-500"
                )}
                onClick={() => setSelectedDifficulty(diff.value)}
              >
                {diff.label}
              </Badge>
            ))}
          </div>

          {/* Paths Grid */}
          {filteredPaths && filteredPaths.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPaths.map((path) => (
                <LearningPathCard
                  key={path.id}
                  id={path.id}
                  title={path.title}
                  description={path.description || undefined}
                  channelName={path.channel_name}
                  channelUrl={path.channel_url || undefined}
                  difficulty={path.difficulty || "beginner"}
                  category={path.category || "general"}
                  totalXp={path.total_xp || 0}
                  videoCount={videoCounts?.[path.id] || 0}
                  completedCount={userCompletions?.[path.id] || 0}
                  onClick={() => setSelectedPathId(path.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No learning paths found</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
