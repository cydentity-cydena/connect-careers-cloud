import { Award, Calendar, ExternalLink, CheckCircle, AlertTriangle, XCircle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { differenceInDays, parseISO } from "date-fns";

interface CertificationCardProps {
  certification: {
    name: string;
    issuer?: string;
    issue_date?: string;
    expiry_date?: string;
    credential_url?: string;
    credential_id?: string;
    signed_webhook?: boolean;
    webhook_provider?: string;
    webhook_verified_at?: string;
  };
  isUnlocked?: boolean;
  showCredentialUrl?: boolean;
}

export function CertificationCard({ 
  certification, 
  isUnlocked = true, 
  showCredentialUrl = true 
}: CertificationCardProps) {
  
  const getExpiryStatus = () => {
    if (!certification.expiry_date) return null;
    
    const expiryDate = parseISO(certification.expiry_date);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'text-red-600 dark:text-red-400', icon: XCircle };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'expiring', label: 'Expiring Soon', color: 'text-amber-600 dark:text-amber-400', icon: AlertTriangle };
    } else {
      return { status: 'valid', label: 'Valid', color: 'text-green-600 dark:text-green-400', icon: CheckCircle };
    }
  };

  const expiryStatus = getExpiryStatus();
  const isVerified = certification.signed_webhook && certification.webhook_verified_at;
  const isCredly = certification.credential_url?.includes('credly.com');

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base leading-tight">{certification.name}</h4>
              {certification.issuer && (
                <p className="text-sm text-muted-foreground mt-0.5">{certification.issuer}</p>
              )}
            </div>
          </div>
          
          {/* Verification Badges */}
          <div className="flex items-start gap-1.5 flex-shrink-0">
            {isVerified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">Verified</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">
                        {certification.webhook_provider === 'credly' ? 'Credly' : 
                         certification.webhook_provider === 'comptia' ? 'CompTIA' :
                         certification.webhook_provider === 'isc2' ? 'ISC²' :
                         certification.webhook_provider === 'cresta' ? 'Cresta' : 'Vendor'} Verified
                      </p>
                      <p className="text-muted-foreground">
                        Auto-verified via secure webhook
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {isCredly && !isVerified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      <img 
                        src="https://info.credly.com/hubfs/Credly_Logo_Orange.png" 
                        alt="Credly" 
                        className="h-3 w-auto"
                      />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Credly Badge (Self-reported)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          {certification.issue_date && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Issued: {new Date(certification.issue_date).toLocaleDateString()}</span>
            </div>
          )}
          
          {certification.expiry_date && expiryStatus && (
            <div className={`flex items-center gap-1.5 font-medium ${expiryStatus.color}`}>
              <expiryStatus.icon className="h-3.5 w-3.5" />
              <span>
                {expiryStatus.label}: {new Date(certification.expiry_date).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {!certification.expiry_date && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              No Expiry
            </Badge>
          )}
        </div>

        {/* Credential Info */}
        {isUnlocked && showCredentialUrl && (
          <div className="space-y-2">
            {certification.credential_id && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Credential ID:</span> {certification.credential_id}
              </p>
            )}
            
            {certification.credential_url && (
              <a 
                href={certification.credential_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Credential
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
