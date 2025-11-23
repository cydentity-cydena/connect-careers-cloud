import { Badge } from "@/components/ui/badge";
import { Shield, Award, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HighValueBadgesProps {
  clearanceLevel?: string;
  pciQsaStatus?: string;
  certifications?: string[];
}

const HIGH_VALUE_CERTS = ['ccrts', 'ccsas', 'crto', 'crtp', 'osep', 'osed'];

export const HighValueBadges = ({ clearanceLevel, pciQsaStatus, certifications = [] }: HighValueBadgesProps) => {
  const hasHighValueCert = certifications.some(cert =>
    HIGH_VALUE_CERTS.some(hvc => cert.toLowerCase().includes(hvc))
  );

  if (!clearanceLevel && pciQsaStatus !== 'active' && !hasHighValueCert) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {clearanceLevel && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
                <Shield className="h-3 w-3" />
                {clearanceLevel}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Security Clearance: {clearanceLevel}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {pciQsaStatus === 'active' && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                <Award className="h-3 w-3" />
                PCI QSA
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Active PCI QSA Qualified Security Assessor</p>
            </TooltipContent>
          </Tooltip>
        )}

        {hasHighValueCert && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                <Star className="h-3 w-3" />
                Elite Cert
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Holds high-value red team certifications (CCRTS/CCSAS/CRTO)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};