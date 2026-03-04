import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { VerificationPanel } from "@/components/hrready/VerificationPanel";

interface HRReadyCTAProps {
  userId: string;
}

export function HRReadyCTA({ userId }: HRReadyCTAProps) {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [accountTooNew, setAccountTooNew] = useState(false);

  useEffect(() => {
    // Check if dismissed this session
    if (sessionStorage.getItem('hrready-cta-dismissed') === 'true') {
      setDismissed(true);
    }
    loadStatus();
  }, [userId]);

  const loadStatus = async () => {
    try {
      // Check account age — only show after 3 days
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

      if (profile?.created_at) {
        const createdAt = new Date(profile.created_at);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        if (createdAt > threeDaysAgo) {
          setAccountTooNew(true);
          setLoading(false);
          return;
        }
      }

      const { data } = await supabase.functions.invoke(`hrready-get/${userId}`);
      setVerificationStatus(data?.verification || null);
    } catch (e) {
      console.error('Failed to load verification status', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('hrready-cta-dismissed', 'true');
  };

  if (loading || accountTooNew || dismissed) return null;

  const isHRReady = verificationStatus?.hr_ready;
  const idStatus = verificationStatus?.identity_status;
  const rtwStatus = verificationStatus?.rtw_status;
  const idOk = ['green', 'amber'].includes(idStatus || '');
  const rtwOk = ['green', 'amber'].includes(rtwStatus || '');

  // Already HR-Ready — show compact success badge
  if (isHRReady) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-sm">HR-Ready Verified ✓</p>
                <p className="text-xs text-muted-foreground">Employers see you as hire-ready</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/hr-ready')} 
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Manage <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not yet HR-Ready — show soft, dismissible suggestion
  return (
    <Card className="border-muted bg-muted/30">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">Optional: Get HR-Ready verified</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verified candidates get 3× more visibility to employers. Completely optional — your profile works without it.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {(idOk || rtwOk) && (
              <div className="flex gap-3 mt-2 text-xs">
                {idOk && (
                  <span className="flex items-center gap-1 text-primary">
                    <CheckCircle className="h-3 w-3" /> ID verified
                  </span>
                )}
                {rtwOk && (
                  <span className="flex items-center gap-1 text-primary">
                    <CheckCircle className="h-3 w-3" /> RTW verified
                  </span>
                )}
              </div>
            )}
            <Button 
              onClick={() => navigate('/hr-ready')} 
              variant="outline"
              size="sm"
              className="mt-3 text-xs h-7"
            >
              Learn more <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
