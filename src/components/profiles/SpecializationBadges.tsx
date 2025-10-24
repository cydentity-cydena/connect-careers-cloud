import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SPECIALIZATIONS, type Specialization, getSpecializationBadge } from "@/lib/specializations";

interface SpecializationBadgesProps {
  specializations: Specialization[];
  showAll?: boolean;
}

export const SpecializationBadges = ({ specializations, showAll = false }: SpecializationBadgesProps) => {
  if (!specializations || specializations.length === 0) return null;

  const displayedSpecs = showAll ? specializations : specializations.slice(0, 3);
  const remainingCount = specializations.length - displayedSpecs.length;

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {displayedSpecs.map((specId) => {
          const spec = getSpecializationBadge(specId);
          if (!spec) return null;

          return (
            <Tooltip key={spec.id}>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className={`${spec.color} border font-medium`}
                >
                  <span className="mr-1">{spec.icon}</span>
                  {spec.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Specialization in {spec.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
      {!showAll && remainingCount > 0 && (
        <Badge variant="outline" className="text-muted-foreground">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};
