import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VerificationPanel } from "@/components/hrready/VerificationPanel";
import { EditVerificationDrawer } from "@/components/hrready/EditVerificationDrawer";

const HRReady = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<any | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Upload form state
  const [idFiles, setIdFiles] = useState<FileList | null>(null);
  const [idNotes, setIdNotes] = useState("");
  const [rtwFiles, setRtwFiles] = useState<FileList | null>(null);
  const [rtwNotes, setRtwNotes] = useState("");

  // Logistics form state
  const [workMode, setWorkMode] = useState("Remote");
  const [noticeDays, setNoticeDays] = useState(30);
  const [location, setLocation] = useState("");
  const [salaryBand, setSalaryBand] = useState("");
  const [commuteRadius, setCommuteRadius] = useState(20);
  const [savingLogistics, setSavingLogistics] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);

      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);
      
      const adminRole = roleData?.some(r => r.role === 'admin');
      setIsAdmin(adminRole || false);

      // Load current verification snapshot
      try {
        const { data, error } = await supabase.functions.invoke(`hrready-get/${session.user.id}`);
        if (error) throw error;
        const verif = data?.verification || null;
        setVerification(verif);
        
        // Pre-fill logistics form if data exists
        if (verif) {
          setWorkMode(verif.logistics_work_mode || "Remote");
          setNoticeDays(verif.logistics_notice_days || 30);
          setLocation(verif.logistics_location || "");
          setSalaryBand(verif.logistics_salary_band || "");
          setCommuteRadius(verif.logistics_commute_radius_km || 20);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const refreshVerification = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase.functions.invoke(`hrready-get/${userId}`);
      if (error) throw error;
      setVerification(data?.verification || null);
    } catch (e) {
      console.error(e);
    }
  };

  const uploadFiles = async (files: FileList, folder: string) => {
    if (!userId) throw new Error("Not authenticated");
    const paths: string[] = [];
    for (const file of Array.from(files)) {
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

  const submitRequest = async (type: "identity" | "rtw", files: FileList | null, notes: string) => {
    if (!userId) return;
    if (!files || files.length === 0) {
      toast({ title: "Please attach document(s)", variant: "destructive" });
      return;
    }
    try {
      const paths = await uploadFiles(files, type);
      const { error } = await supabase
        .from("verification_requests")
        .insert({
          candidate_id: userId,
          verification_type: type,
          status: "pending",
          document_urls: paths,
          notes: notes || null,
        });
      if (error) throw error;
      toast({ title: `${type.toUpperCase()} submitted`, description: "We'll review shortly." });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    }
  };

  const saveLogistics = async () => {
    if (!userId) return;
    
    // Validate inputs
    if (noticeDays < 0 || noticeDays > 365) {
      toast({ 
        title: "Invalid notice period", 
        description: "Notice period must be between 0 and 365 days",
        variant: "destructive" 
      });
      return;
    }
    
    if (commuteRadius < 0 || commuteRadius > 500) {
      toast({ 
        title: "Invalid commute radius", 
        description: "Commute radius must be between 0 and 500 km",
        variant: "destructive" 
      });
      return;
    }
    
    if (location.length > 200) {
      toast({ 
        title: "Location too long", 
        description: "Please enter a shorter location",
        variant: "destructive" 
      });
      return;
    }
    
    if (salaryBand.length > 100) {
      toast({ 
        title: "Salary expectations too long", 
        description: "Please enter a shorter description",
        variant: "destructive" 
      });
      return;
    }
    
    setSavingLogistics(true);
    try {
      const { data, error } = await supabase.functions.invoke(`hrready-upsert/${userId}`, {
        body: {
          logistics: {
            status: "green",
            workMode: workMode.trim(),
            noticeDays,
            location: location.trim(),
            salaryBand: salaryBand.trim(),
            commuteRadiusKm: commuteRadius,
            confirmedAt: new Date().toISOString(),
          }
        }
      });
      
      if (error) throw error;
      
      toast({ 
        title: "Logistics preferences saved",
        description: "Your work preferences have been updated"
      });
      
      await refreshVerification();
    } catch (e: any) {
      toast({ 
        title: "Failed to save preferences", 
        description: e.message, 
        variant: "destructive" 
      });
    } finally {
      setSavingLogistics(false);
    }
  };

  return (
    <div>
      <SEO title="HR-Ready Verification | Cydena" description="Submit identity and right-to-work to become HR-Ready." />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">HR-Ready Verification</h1>
          <p className="text-muted-foreground">Prove identity and right to work to apply for jobs faster and earn badges on your profile.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section>
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-2">Your Current Status</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <VerificationPanel 
                  verification={verification} 
                  onEdit={() => setEditDrawerOpen(true)}
                  showEditButton={isAdmin}
                />
              )}
            </Card>
          </section>

          <section className="space-y-6">
            <Card className="p-4 space-y-3">
              <h3 className="font-medium">Submit Identity</h3>
              <Label>Document(s)</Label>
              <Input type="file" multiple onChange={(e) => setIdFiles(e.target.files)} />
              <Label>Notes (optional)</Label>
              <Textarea rows={3} value={idNotes} onChange={(e) => setIdNotes(e.target.value)} placeholder="Passport, driving licence, etc." />
              <Button onClick={() => submitRequest("identity", idFiles, idNotes)}>Submit Identity</Button>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="font-medium">Submit Right to Work</h3>
              <Label>Document(s)</Label>
              <Input type="file" multiple onChange={(e) => setRtwFiles(e.target.files)} />
              <Label>Notes (optional)</Label>
              <Textarea rows={3} value={rtwNotes} onChange={(e) => setRtwNotes(e.target.value)} placeholder="Visa type, country, permit details" />
              <Button onClick={() => submitRequest("rtw", rtwFiles, rtwNotes)}>Submit RTW</Button>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="font-medium">Add Certifications</h3>
              <p className="text-sm text-muted-foreground">Add your professional certifications to boost your HR-Ready score</p>
              <Button onClick={() => navigate('/certifications')} className="w-full">
                Add Certification
              </Button>
            </Card>

            <Card className="p-4 space-y-4">
              <h3 className="font-medium">Your Logistics Preferences</h3>
              <p className="text-sm text-muted-foreground">Help employers understand your availability and requirements</p>
              
              <div className="space-y-2">
                <Label>Work Mode Preference</Label>
                <Select value={workMode} onValueChange={setWorkMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notice Period (days)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="365"
                  value={noticeDays}
                  onChange={(e) => setNoticeDays(Math.min(365, Math.max(0, parseInt(e.target.value) || 0)))}
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground">How many days notice do you need to give?</p>
              </div>

              <div className="space-y-2">
                <Label>Preferred Location</Label>
                <Input 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="London, UK"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label>Salary Expectations</Label>
                <Input 
                  value={salaryBand}
                  onChange={(e) => setSalaryBand(e.target.value)}
                  placeholder="£50k - £70k"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label>Commute Radius (km)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="500"
                  value={commuteRadius}
                  onChange={(e) => setCommuteRadius(Math.min(500, Math.max(0, parseInt(e.target.value) || 0)))}
                  placeholder="20"
                />
                <p className="text-xs text-muted-foreground">Maximum distance willing to commute</p>
              </div>

              <Button 
                onClick={saveLogistics} 
                disabled={savingLogistics}
                className="w-full"
              >
                {savingLogistics ? "Saving..." : "Save Logistics Preferences"}
              </Button>
            </Card>
          </section>
        </div>

        <Separator className="my-8" />
        <div className="text-sm text-muted-foreground">
          Files are stored securely. Our team validates submissions promptly. Once approved, your profile shows HR-Ready badges and you can apply to jobs.
        </div>
      </main>

      {userId && (
        <EditVerificationDrawer
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          candidateId={userId}
          verification={verification}
          onSuccess={refreshVerification}
        />
      )}
    </div>
  );
};

export default HRReady;
