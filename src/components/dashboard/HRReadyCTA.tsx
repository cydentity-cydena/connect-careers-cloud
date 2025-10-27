import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, CheckCircle, Upload, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VerificationPanel } from "@/components/hrready/VerificationPanel";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HRReadyCTAProps {
  userId: string;
}

export function HRReadyCTA({ userId }: HRReadyCTAProps) {
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitType, setSubmitType] = useState<'identity' | 'rtw'>('identity');
  const [files, setFiles] = useState<FileList | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadVerificationStatus();
  }, [userId]);

  const loadVerificationStatus = async () => {
    try {
      const { data } = await supabase.functions.invoke(`hrready-get/${userId}`);
      setVerificationStatus(data?.verification);
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (fileList: FileList, folder: string) => {
    const paths: string[] = [];
    for (const file of Array.from(fileList)) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("verification-documents")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      paths.push(path);
    }
    return paths;
  };

  const handleSubmit = async () => {
    if (!files || files.length === 0) {
      toast({ title: "Please attach document(s)", variant: "destructive" });
      return;
    }

    try {
      const paths = await uploadFiles(files, submitType);
      const { error } = await supabase
        .from("verification_requests")
        .insert({
          candidate_id: userId,
          verification_type: submitType,
          status: "pending",
          document_urls: paths,
          notes: notes || null,
        });
      
      if (error) throw error;
      
      toast({ 
        title: `${submitType === 'identity' ? 'Identity' : 'Right to Work'} submitted`, 
        description: "We'll review your documents shortly." 
      });
      
      setShowSubmitDialog(false);
      setFiles(null);
      setNotes("");
      loadVerificationStatus();
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    }
  };

  const openSubmitDialog = (type: 'identity' | 'rtw') => {
    setSubmitType(type);
    setShowSubmitDialog(true);
  };

  if (loading) {
    return null;
  }

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
    <>
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
                  Submit your documents to apply for jobs and stand out to employers
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

              {/* Submit Documents */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => openSubmitDialog('identity')} 
                  variant="outline" 
                  className="gap-2"
                  disabled={idOk}
                >
                  <Upload className="h-4 w-4" />
                  Submit Identity
                </Button>
                <Button 
                  onClick={() => openSubmitDialog('rtw')} 
                  variant="outline" 
                  className="gap-2"
                  disabled={rtwOk}
                >
                  <Upload className="h-4 w-4" />
                  Submit RTW
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Submit {submitType === 'identity' ? 'Identity' : 'Right to Work'} Documents
            </DialogTitle>
            <DialogDescription>
              Upload your {submitType === 'identity' ? 'identity documents (passport, driving licence, etc.)' : 'right to work documents (visa, work permit, etc.)'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Document(s) *</Label>
              <Input 
                type="file" 
                multiple 
                onChange={(e) => setFiles(e.target.files)}
                accept="image/*,.pdf"
              />
              <p className="text-xs text-muted-foreground">
                You can upload multiple files (images or PDFs)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea 
                rows={3} 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder={submitType === 'identity' ? 'E.g., Passport pages 1-2' : 'E.g., UK work visa valid until 2026'}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!files || files.length === 0}>
              <FileText className="h-4 w-4 mr-2" />
              Submit Documents
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
