import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, Briefcase, MapPin, Edit } from "lucide-react";
import { format } from "date-fns";

interface VerificationPanelProps {
  verification: any;
  onEdit: () => void;
  showEditButton?: boolean;
}

const statusColors: Record<string, string> = {
  green: 'bg-green-500/20 text-green-700 dark:text-green-400',
  amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
  red: 'bg-red-500/20 text-red-700 dark:text-red-400',
  grey: 'bg-muted text-muted-foreground',
};

export function VerificationPanel({ verification, onEdit, showEditButton = false }: VerificationPanelProps) {
  if (!verification) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No verification data available</p>
          {showEditButton && (
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Add Verification
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pre-Verification Status</h3>
        {showEditButton && (
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {verification.hr_ready && (
        <Card className="p-4 bg-primary/10 border-primary">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary">✓ HR-Ready</Badge>
            <span className="text-sm text-muted-foreground">
              This candidate has passed all pre-verification checks
            </span>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Identity */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">Identity</h4>
                <Badge className={statusColors[verification.identity_status || 'grey']}>
                  {verification.identity_status || 'Not checked'}
                </Badge>
              </div>
              {verification.identity_method && (
                <p className="text-sm text-muted-foreground">Method: {verification.identity_method}</p>
              )}
              {verification.identity_verifier && (
                <p className="text-sm text-muted-foreground">By: {verification.identity_verifier}</p>
              )}
              {verification.identity_checked_at && (
                <p className="text-sm text-muted-foreground">
                  Checked: {format(new Date(verification.identity_checked_at), 'MMM dd, yyyy')}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Certifications */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <FileCheck className="h-5 w-5 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">Certifications</h4>
                {verification.certifications_count > 0 && (
                  <Badge variant="secondary">
                    {verification.verified_certifications_count || 0}/{verification.certifications_count}
                  </Badge>
                )}
              </div>
              {(() => {
                const certs = typeof verification.certifications === 'string' 
                  ? JSON.parse(verification.certifications) 
                  : verification.certifications;
                return certs && Array.isArray(certs) && certs.length > 0 ? (
                  <div className="space-y-2">
                    {certs.map((cert: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[cert.status || 'grey']} variant="outline">
                            {cert.status === 'green' ? '✓' : cert.status === 'amber' ? '⏳' : '○'} {cert.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-1">
                          {cert.issuer && <span>by {cert.issuer}</span>}
                          {cert.source && (
                            <Badge variant="outline" className="text-xs py-0 h-5">
                              {cert.source === 'credly' ? '🎖️ Credly' : '📄 Upload'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No certifications recorded</p>
                );
              })()}
            </div>
          </div>
        </Card>

        {/* Right to Work */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">Right to Work</h4>
                <Badge className={statusColors[verification.rtw_status || 'grey']}>
                  {verification.rtw_status || 'Not checked'}
                </Badge>
              </div>
              {verification.rtw_country && (
                <p className="text-sm text-muted-foreground">Country: {verification.rtw_country}</p>
              )}
              {verification.rtw_restriction_notes && (
                <p className="text-sm text-muted-foreground">Notes: {verification.rtw_restriction_notes}</p>
              )}
              {verification.rtw_checked_at && (
                <p className="text-sm text-muted-foreground">
                  Checked: {format(new Date(verification.rtw_checked_at), 'MMM dd, yyyy')}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Logistics */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">Logistics</h4>
                <Badge className={statusColors[verification.logistics_status || 'grey']}>
                  {verification.logistics_status || 'Not checked'}
                </Badge>
              </div>
              {verification.logistics_location && (
                <p className="text-sm text-muted-foreground">Location: {verification.logistics_location}</p>
              )}
              {verification.logistics_work_mode && (
                <p className="text-sm text-muted-foreground">Work Mode: {verification.logistics_work_mode}</p>
              )}
              {verification.logistics_notice_days && (
                <p className="text-sm text-muted-foreground">Notice: {verification.logistics_notice_days} days</p>
              )}
              {verification.logistics_salary_band && (
                <p className="text-sm text-muted-foreground">Salary: {verification.logistics_salary_band}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {verification.compliance_score !== undefined && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Compliance Score</span>
            <Badge variant="secondary">{verification.compliance_score}/20</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}