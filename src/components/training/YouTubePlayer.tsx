import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Star, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  xpReward: number;
  isCompleted: boolean;
  onComplete: () => void;
  isLoading?: boolean;
}

// Minimum watch percentage required (70% of video or at least 2 minutes)
const MIN_WATCH_PERCENTAGE = 0.7;
const MIN_WATCH_SECONDS = 120; // 2 minutes minimum
const MAX_WATCH_SECONDS = 600; // 10 minutes cap

export function YouTubePlayer({
  videoId,
  title,
  description,
  durationMinutes,
  xpReward,
  isCompleted,
  onComplete,
  isLoading,
}: YouTubePlayerProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [canComplete, setCanComplete] = useState(false);

  // Calculate required watch time
  const videoDurationSeconds = (durationMinutes || 5) * 60;
  const calculatedRequirement = Math.floor(videoDurationSeconds * MIN_WATCH_PERCENTAGE);
  const requiredSeconds = Math.min(
    MAX_WATCH_SECONDS,
    Math.max(MIN_WATCH_SECONDS, calculatedRequirement)
  );

  // Timer effect - only runs when video is loaded and not completed
  useEffect(() => {
    if (!videoLoaded || isCompleted || canComplete) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= requiredSeconds) {
          setCanComplete(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [videoLoaded, isCompleted, canComplete, requiredSeconds]);

  // Reset timer when video changes
  useEffect(() => {
    setElapsedSeconds(0);
    setCanComplete(false);
    setVideoLoaded(false);
  }, [videoId]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const progressPercent = Math.min(100, (elapsedSeconds / requiredSeconds) * 100);
  const remainingSeconds = Math.max(0, requiredSeconds - elapsedSeconds);

  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onLoad={() => setVideoLoaded(true)}
        />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {durationMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {durationMinutes} min
              </span>
            )}
            <span className="flex items-center gap-1 text-primary">
              <Star className="h-4 w-4" />
              +{xpReward} XP
            </span>
          </div>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {!canComplete && videoLoaded && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Timer className="h-4 w-4" />
                  <span>Watch {formatTime(remainingSeconds)} more</span>
                </div>
                <Progress value={progressPercent} className="w-32 h-2" />
              </div>
            )}
            <Button
              onClick={onComplete}
              disabled={isLoading || !canComplete}
              className={cn(!canComplete && "opacity-50 cursor-not-allowed")}
            >
              {isLoading ? "Saving..." : canComplete ? "Claim XP" : "Keep Watching"}
            </Button>
          </div>
        )}
      </div>

      {!isCompleted && !videoLoaded && (
        <p className="text-xs text-muted-foreground text-center">
          Loading video...
        </p>
      )}
    </div>
  );
}
