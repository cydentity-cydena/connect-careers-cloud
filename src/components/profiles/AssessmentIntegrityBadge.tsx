import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, AlertTriangle, UserCheck } from "lucide-react";

interface AssessmentIntegrityBadgeProps {
  integrityScore?: number;
  humanReviewStatus?: string | null;
}

export const AssessmentIntegrityBadge = ({ integrityScore, humanReviewStatus }: AssessmentIntegrityBadgeProps) => {
  // Human review takes precedence
  if (humanReviewStatus === 'cleared' || humanReviewStatus === 'verified') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600">
              <UserCheck className="h-3 w-3" />
              Verified
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Human reviewer confirmed authentic responses</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (humanReviewStatus === 'flagged') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 border-red-500/50 text-red-600">
              <AlertTriangle className="h-3 w-3" />
              Flagged
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">Human reviewer confirmed AI-generated content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Fall back to AI-based scoring
  if (!integrityScore || integrityScore >= 80) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600">
              <Shield className="h-3 w-3" />
              Verified
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Answers show authentic human experience</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (integrityScore >= 60) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              Review
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Some answers flagged for employer review</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 border-red-500/50 text-red-600">
            <AlertTriangle className="h-3 w-3" />
            Flagged
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">Multiple answers appear AI-generated. Employers may discount this assessment.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
