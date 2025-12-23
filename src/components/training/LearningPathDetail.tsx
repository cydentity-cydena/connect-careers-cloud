import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { YouTubePlayer } from "./YouTubePlayer";
import { ArrowLeft, Youtube, Star, Trophy, ExternalLink, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ShareLearningPathDialog } from "@/components/sharing/ShareLearningPathDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LearningPathDetailProps {
  pathId: string;
  onBack: () => void;
}

interface PathVideo {
  id: string;
  title: string;
  youtube_video_id: string;
  description: string | null;
  duration_minutes: number | null;
  video_order: number;
  xp_reward: number;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function LearningPathDetail({ pathId, onBack }: LearningPathDetailProps) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevCompletedCount, setPrevCompletedCount] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: path } = useQuery({
    queryKey: ["learning-path", pathId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_learning_paths")
        .select("*")
        .eq("id", pathId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: videos } = useQuery({
    queryKey: ["learning-path-videos", pathId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_path_videos")
        .select("*")
        .eq("path_id", pathId)
        .order("video_order");
      if (error) throw error;
      return data as PathVideo[];
    },
  });

  const { data: completions } = useQuery({
    queryKey: ["video-completions", pathId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("youtube_video_completions")
        .select("video_id")
        .eq("path_id", pathId)
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((c) => c.video_id);
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ video, xpToAward }: { video: PathVideo; xpToAward: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert completion
      const { error: completionError } = await supabase
        .from("youtube_video_completions")
        .insert({
          user_id: user.id,
          video_id: video.id,
          path_id: pathId,
          xp_awarded: xpToAward,
        });
      if (completionError) throw completionError;

      // Update XP
      const { data: existingXp } = await supabase
        .from("candidate_xp")
        .select("total_xp")
        .eq("candidate_id", user.id)
        .maybeSingle();

      if (existingXp) {
        const { error: updateError } = await supabase
          .from("candidate_xp")
          .update({ 
            total_xp: existingXp.total_xp + xpToAward,
            last_activity_at: new Date().toISOString()
          })
          .eq("candidate_id", user.id);
        if (updateError) {
          console.error("Failed to update XP:", updateError);
          throw new Error("Failed to update XP");
        }
      } else {
        const { error: insertError } = await supabase
          .from("candidate_xp")
          .insert({
            candidate_id: user.id,
            total_xp: xpToAward,
          });
        if (insertError) {
          console.error("Failed to insert XP:", insertError);
          throw new Error("Failed to award XP");
        }
      }

      return xpToAward;
    },
    onSuccess: (xpAwarded) => {
      queryClient.invalidateQueries({ queryKey: ["video-completions", pathId] });
      queryClient.invalidateQueries({ queryKey: ["learning-paths-progress"] });
      toast({
        title: "Video completed!",
        description: `You earned +${xpAwarded} XP`,
      });
      
      // Move to next video if available
      if (videos && selectedVideoIndex < videos.length - 1) {
        setSelectedVideoIndex(selectedVideoIndex + 1);
      }
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast({
          title: "Already completed",
          description: "You've already completed this video",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const selectedVideo = videos?.[selectedVideoIndex];
  const completedCount = completions?.length || 0;
  const totalVideos = videos?.length || 0;
  const progress = totalVideos > 0 ? (completedCount / totalVideos) * 100 : 0;
  const isPathComplete = completedCount === totalVideos && totalVideos > 0;
  
  // XP based on difficulty: Beginner = 100, Intermediate = 300, Advanced = 500
  const difficultyXpTotals: Record<string, number> = {
    beginner: 100,
    intermediate: 300,
    advanced: 500,
  };
  const pathTotalXp = difficultyXpTotals[path?.difficulty || "beginner"] || 100;
  const xpPerVideo = totalVideos > 0 ? Math.round(pathTotalXp / totalVideos) : 0;

  // Detect path completion to show celebration
  useEffect(() => {
    if (prevCompletedCount !== null && completedCount > prevCompletedCount) {
      if (isPathComplete) {
        setShowCelebration(true);
      }
    }
    setPrevCompletedCount(completedCount);
  }, [completedCount, isPathComplete, prevCompletedCount]);

  if (!path || !videos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Learning Paths
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-red-500/10">
            <Youtube className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{path.title}</h1>
            <a
              href={path.channel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              {path.channel_name}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareLearningPathDialog
            title={path.title}
            channelName={path.channel_name}
            category={path.category || "general"}
            difficulty={path.difficulty || "beginner"}
            totalXp={pathTotalXp}
            videoCount={totalVideos}
            completedCount={completedCount}
            pathId={pathId}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            }
          />
          <Badge
            variant="outline"
            className={cn("capitalize", difficultyColors[path.difficulty || "beginner"])}
          >
            {path.difficulty}
          </Badge>
          {isPathComplete && (
            <Badge className="bg-green-500 gap-1">
              <Trophy className="h-3 w-3" />
              Complete
            </Badge>
          )}
        </div>
      </div>

      {path.description && (
        <p className="text-muted-foreground">{path.description}</p>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalVideos} videos completed
            </span>
            <span className="flex items-center gap-1 text-primary font-medium">
              <Star className="h-4 w-4" />
              {pathTotalXp} XP total
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedVideo && (
            <YouTubePlayer
              videoId={selectedVideo.youtube_video_id}
              title={selectedVideo.title}
              description={selectedVideo.description || undefined}
              durationMinutes={selectedVideo.duration_minutes || undefined}
              xpReward={xpPerVideo}
              isCompleted={completions?.includes(selectedVideo.id) || false}
              onComplete={() => completeMutation.mutate({ video: selectedVideo, xpToAward: xpPerVideo })}
              isLoading={completeMutation.isPending}
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Videos in this path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {videos.map((video, index) => {
              const isCompleted = completions?.includes(video.id);
              const isSelected = index === selectedVideoIndex;
              
              return (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideoIndex(index)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    isCompleted && "bg-green-500/5 border-green-500/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                      isCompleted 
                        ? "bg-green-500 text-white" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? "✓" : index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isCompleted && "text-green-600"
                      )}>
                        {video.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {video.duration_minutes} min • +{xpPerVideo} XP
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Creator Attribution */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Support the Creator</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This learning path features content from <strong>{path.channel_name}</strong>. 
                The videos are freely available on YouTube. Please consider supporting the creator 
                by subscribing to their channel and engaging with their content directly.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <a href={path.channel_url || "#"} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4 text-red-500" />
                    Subscribe on YouTube
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Celebration Dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Congratulations!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-6xl">🎉</div>
            <p className="text-lg">
              You completed <strong>{path.title}</strong>!
            </p>
            <p className="text-muted-foreground">
              You earned <span className="text-primary font-semibold">{pathTotalXp} XP</span> from this learning path.
            </p>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">Share your achievement with others:</p>
              <ShareLearningPathDialog
                title={path.title}
                channelName={path.channel_name}
                category={path.category || "general"}
                difficulty={path.difficulty || "beginner"}
                totalXp={pathTotalXp}
                videoCount={totalVideos}
                completedCount={completedCount}
                pathId={pathId}
                trigger={
                  <Button className="gap-2 w-full">
                    <Share2 className="h-4 w-4" />
                    Share Your Completion
                  </Button>
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
