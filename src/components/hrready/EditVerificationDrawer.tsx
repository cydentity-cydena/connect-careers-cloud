import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditVerificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  verification: any;
  onSuccess: () => void;
}

export function EditVerificationDrawer({ 
  open, 
  onOpenChange, 
  candidateId, 
  verification,
  onSuccess 
}: EditVerificationDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Identity state
  const [identityStatus, setIdentityStatus] = useState(verification?.identity_status || 'grey');
  const [identityMethod, setIdentityMethod] = useState(verification?.identity_method || '');
  const [identityVerifier, setIdentityVerifier] = useState(verification?.identity_verifier || '');

  // RTW state
  const [rtwStatus, setRtwStatus] = useState(verification?.rtw_status || 'grey');
  const [rtwCountry, setRtwCountry] = useState(verification?.rtw_country || '');
  const [rtwNotes, setRtwNotes] = useState(verification?.rtw_restriction_notes || '');

  // Logistics state
  const [logisticsStatus, setLogisticsStatus] = useState(verification?.logistics_status || 'grey');
  const [logisticsLocation, setLogisticsLocation] = useState(verification?.logistics_location || '');
  const [logisticsWorkMode, setLogisticsWorkMode] = useState(verification?.logistics_work_mode || '');
  const [logisticsNoticeDays, setLogisticsNoticeDays] = useState(verification?.logistics_notice_days || '');
  const [logisticsSalaryBand, setLogisticsSalaryBand] = useState(verification?.logistics_salary_band || '');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(`hrready-upsert/${candidateId}`, {
        body: {
          identity: {
            status: identityStatus,
            method: identityMethod,
            verifier: identityVerifier,
            checkedAt: new Date().toISOString(),
          },
          rightToWork: {
            status: rtwStatus,
            country: rtwCountry,
            restrictionNotes: rtwNotes,
            checkedAt: new Date().toISOString(),
          },
          logistics: {
            status: logisticsStatus,
            location: logisticsLocation,
            workMode: logisticsWorkMode,
            noticeDays: parseInt(logisticsNoticeDays) || 0,
            salaryBand: logisticsSalaryBand,
            confirmedAt: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Verification updated",
        description: data.hrReady ? "Candidate is now HR-Ready ✓" : "Verification saved successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error updating verification",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit Verification</SheetTitle>
          <SheetDescription>
            Update pre-verification status for this candidate
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="identity" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="rtw">Right to Work</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-4 mt-4">
            <div>
              <Label>Status</Label>
              <Select value={identityStatus} onValueChange={setIdentityStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green - Verified</SelectItem>
                  <SelectItem value="amber">Amber - Needs Review</SelectItem>
                  <SelectItem value="red">Red - Failed</SelectItem>
                  <SelectItem value="grey">Grey - Not Checked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Verification Method</Label>
              <Input 
                value={identityMethod} 
                onChange={(e) => setIdentityMethod(e.target.value)}
                placeholder="e.g., Document verification, Video call"
              />
            </div>
            <div>
              <Label>Verified By</Label>
              <Input 
                value={identityVerifier} 
                onChange={(e) => setIdentityVerifier(e.target.value)}
                placeholder="Staff member name"
              />
            </div>
          </TabsContent>

          <TabsContent value="rtw" className="space-y-4 mt-4">
            <div>
              <Label>Status</Label>
              <Select value={rtwStatus} onValueChange={setRtwStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green - Verified</SelectItem>
                  <SelectItem value="amber">Amber - Conditional</SelectItem>
                  <SelectItem value="red">Red - Not Eligible</SelectItem>
                  <SelectItem value="grey">Grey - Not Checked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Country</Label>
              <Input 
                value={rtwCountry} 
                onChange={(e) => setRtwCountry(e.target.value)}
                placeholder="e.g., UK, US"
              />
            </div>
            <div>
              <Label>Restriction Notes</Label>
              <Textarea 
                value={rtwNotes} 
                onChange={(e) => setRtwNotes(e.target.value)}
                placeholder="Any visa restrictions or conditions"
              />
            </div>
          </TabsContent>

          <TabsContent value="logistics" className="space-y-4 mt-4">
            <div>
              <Label>Status</Label>
              <Select value={logisticsStatus} onValueChange={setLogisticsStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green - Confirmed</SelectItem>
                  <SelectItem value="amber">Amber - Flexible</SelectItem>
                  <SelectItem value="red">Red - Incompatible</SelectItem>
                  <SelectItem value="grey">Grey - Not Checked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input 
                value={logisticsLocation} 
                onChange={(e) => setLogisticsLocation(e.target.value)}
                placeholder="e.g., London, Manchester"
              />
            </div>
            <div>
              <Label>Work Mode</Label>
              <Select value={logisticsWorkMode} onValueChange={setLogisticsWorkMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="On-site">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notice Period (days)</Label>
              <Input 
                type="number"
                value={logisticsNoticeDays} 
                onChange={(e) => setLogisticsNoticeDays(e.target.value)}
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <Label>Salary Band</Label>
              <Input 
                value={logisticsSalaryBand} 
                onChange={(e) => setLogisticsSalaryBand(e.target.value)}
                placeholder="e.g., £40k-£60k"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-2">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Verification"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}