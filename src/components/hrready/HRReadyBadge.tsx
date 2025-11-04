import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Clock } from "lucide-react";

interface HRReadyBadgeProps {
  isReady: boolean;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  expiryDate?: string | null;
}

export function HRReadyBadge({ isReady, size = "md", showIcon = true, expiryDate }: HRReadyBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-3 py-1"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4"
  };

  if (!isReady) return null;

  const daysUntilExpiry = expiryDate 
    ? Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry < 30;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="default" 
            className={`${sizeClasses[size]} bg-primary hover:bg-primary/90 font-semibold whitespace-nowrap gap-1 cursor-help`}
          >
            {showIcon && <Shield className={iconSizes[size]} />}
            ✓ HR-Ready
            {isExpiringSoon && <Clock className={`${iconSizes[size]} text-amber-300`} />}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">Interview-Ready Candidate</p>
            <p className="text-xs">Identity, right-to-work, and logistics verified</p>
            <p className="text-xs text-muted-foreground">
              • Start interviews in 48 hours
            </p>
            <p className="text-xs text-muted-foreground">
              • Zero verification hassle
            </p>
            {expiryDate && (
              <p className={`text-xs ${isExpiringSoon ? 'text-amber-300 font-medium' : 'text-muted-foreground'}`}>
                {isExpiringSoon ? `⚠️ Expires in ${daysUntilExpiry} days` : `Valid until ${new Date(expiryDate).toLocaleDateString()}`}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
