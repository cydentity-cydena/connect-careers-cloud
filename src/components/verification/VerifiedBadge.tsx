import { CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function VerifiedBadge({ size = "md", showText = false }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5">
            <CheckCircle className={`${sizeClasses[size]} text-primary fill-primary/20`} />
            {showText && (
              <span className={`${textSizeClasses[size]} font-medium text-primary`}>
                Verified
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Business - This employer has been verified by Cydena</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
