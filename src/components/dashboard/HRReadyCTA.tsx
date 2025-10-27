import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { VerificationPanel } from "@/components/hrready/VerificationPanel";

interface HRReadyCTAProps {
  userId: string;
}

export function HRReadyCTA({ userId }: HRReadyCTAProps) {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, [userId]);

  const loadStatus = async () => {
    try {
      const { data } = await supabase.functions.invoke(`hrready-get/${userId}`);
      setVerificationStatus(data?.verification || null);
    } catch (e) {
      console.error('Failed to load verification status', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const isHRReady = verificationStatus?.hr_ready;
  const idStatus = verificationStatus?.identity_status;
  const rtwStatus = verificationStatus?.rtw_status;
  const idOk = ['green', 'amber'].includes(idStatus || '');
  const rtwOk = ['green', 'amber'].includes(rtwStatus || '');

  const completedSteps = [idOk, rtwOk].filter(Boolean).length;
  const progress = (completedSteps / 2) * 100;

  if (isHRReady) {
    return (
      <Card className="border-primary bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary rounded-full p-3 flex-shrink-0">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">You are HR-Ready! ✓</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your profile shows priority HR-Ready badges. Employers see you are interview-ready and can start in days, not weeks.
              </p>
              <VerificationPanel 
                verification={verificationStatus} 
                showEditButton={false}
                onEdit={() => {}}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-500/20 rounded-full p-3 flex-shrink-0">
            <Shield className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="mb-3">
              <h3 className="font-bold text-lg mb-1">Complete HR-Ready Verification</h3>
              <p className="text-sm text-muted-foreground">
                Get verified to apply for jobs and stand out to employers
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                {idOk ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={idOk ? "text-foreground" : "text-muted-foreground"}>
                  Identity verification
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {rtwOk ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={rtwOk ? "text-foreground" : "text-muted-foreground"}>
                  Right to work verification
                </span>
              </div>
            </div>

            <Progress value={progress} className="h-2 mb-4" />

            <div className="grid grid-cols-3 gap-2 text-xs mb-4 p-3 bg-background/50 rounded-lg">
              <div className="text-center">
                <CheckCircle className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-semibold">3x visibility</p>
                <p className="text-muted-foreground">to employers</p>
              </div>
              <div className="text-center">
                <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-semibold">Get hired faster</p>
                <p className="text-muted-foreground">skip delays</p>
              </div>
              <div className="text-center">
                <Shield className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-semibold">Verify once</p>
                <p className="text-muted-foreground">apply everywhere</p>
              </div>
            </div>

            <Button onClick={() => navigate('/hr-ready')} className="w-full gap-2" variant="hero">
              Complete Verification <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
