import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Youtube, Play, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareLearningPathDialog } from "@/components/sharing/ShareLearningPathDialog";

interface LearningPathCardProps {
  id: string;
  title: string;
  description?: string;
  channelName: string;
  channelUrl?: string;
  difficulty: string;
  category: string;
  totalXp: number;
  videoCount: number;
  completedCount: number;
  onClick: () => void;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

const categoryLabels: Record<string, string> = {
  "penetration-testing": "Penetration Testing",
  networking: "Networking",
  "bug-bounty": "Bug Bounty",
  "malware-analysis": "Malware Analysis",
  "web-security": "Web Security",
  general: "General",
};

export function LearningPathCard({
  id,
  title,
  description,
  channelName,
  channelUrl,
  difficulty,
  category,
  totalXp,
  videoCount,
  completedCount,
  onClick,
}: LearningPathCardProps) {
  const progress = videoCount > 0 ? (completedCount / videoCount) * 100 : 0;
  const isComplete = completedCount === videoCount && videoCount > 0;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
        isComplete && "border-green-500/50 bg-green-500/5"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Youtube className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold line-clamp-1">{title}</h3>
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                {channelName}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareLearningPathDialog
              title={title}
              channelName={channelName}
              category={category}
              difficulty={difficulty}
              totalXp={totalXp}
              videoCount={videoCount}
              completedCount={completedCount}
              pathId={id}
            />
            <Badge
              variant="outline"
              className={cn("capitalize", difficultyColors[difficulty])}
            >
              {difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <Badge variant="secondary" className="capitalize">
            {categoryLabels[category] || category}
          </Badge>
          <span className="flex items-center gap-1 text-primary font-medium">
            <Star className="h-4 w-4" />
            {totalXp} XP
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Play className="h-4 w-4" />
              {completedCount}/{videoCount} videos
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
