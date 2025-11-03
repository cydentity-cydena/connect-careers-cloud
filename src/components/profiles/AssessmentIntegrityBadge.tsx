import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, AlertTriangle } from "lucide-react";

interface AssessmentIntegrityBadgeProps {
  integrityScore?: number;
}

export const AssessmentIntegrityBadge = ({ integrityScore }: AssessmentIntegrityBadgeProps) => {
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