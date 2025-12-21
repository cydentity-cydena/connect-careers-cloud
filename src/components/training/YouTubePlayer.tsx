import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, Clock, Star } from "lucide-react";
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
  const [hasWatched, setHasWatched] = useState(false);

  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onLoad={() => setHasWatched(true)}
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
          <Button
            onClick={onComplete}
            disabled={isLoading}
            className={cn(!hasWatched && "opacity-50")}
          >
            {isLoading ? "Saving..." : "Mark Complete"}
          </Button>
        )}
      </div>
    </div>
  );
}
