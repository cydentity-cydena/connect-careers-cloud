import { Shield, FileCheck, Briefcase, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export type BadgeStatus = 'green' | 'amber' | 'red' | 'grey';

export interface BadgeItem {
  label: string;
  status: BadgeStatus;
  tooltip?: string;
}

interface BadgesRowProps {
  items: BadgeItem[];
  showHrReady?: boolean;
}

const statusColors: Record<BadgeStatus, string> = {
  green: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50',
  amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/50',
  red: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50',
  grey: 'bg-muted text-muted-foreground border-border',
};

const icons = {
  ID: Shield,
  Cert: FileCheck,
  RTW: Briefcase,
  Logistics: MapPin,
};

export function BadgesRow({ items, showHrReady }: BadgesRowProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <TooltipProvider>
        {items.map((item, index) => {
          const Icon = icons[item.label as keyof typeof icons] || Shield;
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`${statusColors[item.status]} text-[11px] px-2 py-0.5 gap-1 font-medium whitespace-nowrap`}
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </Badge>
              </TooltipTrigger>
              {item.tooltip && (
                <TooltipContent>
                  <p className="text-xs">{item.tooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </TooltipProvider>
      {showHrReady && (
        <Badge variant="default" className="text-[11px] px-2 py-0.5 bg-primary font-medium whitespace-nowrap">
          ✓ HR-Ready
        </Badge>
      )}
    </div>
  );
}