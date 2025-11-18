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

  const handleIdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const paths = await uploadFiles(files, "identity");
      setIdFiles(files);
      toast({
        title: "Files uploaded",
        description: `${files.length} ID document(s) uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRtwFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const paths = await uploadFiles(files, "rtw");
      setRtwFiles(files);
      toast({
        title: "Files uploaded",
        description: `${files.length} RTW document(s) uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
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
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">HR-Ready Verification</h1>
          <p className="text-muted-foreground text-lg">Prove identity and right to work to apply for jobs faster and earn badges on your profile.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-5">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Current Status</h2>
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

            <Card className="p-5">
              <h3 className="text-lg font-semibold mb-3">Submit Identity</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="id-docs">Document(s)</Label>
                  <Input id="id-docs" type="file" multiple onChange={handleIdFileChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="id-notes">Notes (optional)</Label>
                  <Textarea 
                    id="id-notes"
                    rows={2} 
                    value={idNotes} 
                    onChange={(e) => setIdNotes(e.target.value)} 
                    placeholder="Passport, driving licence, etc." 
                  />
                </div>
                <Button onClick={() => submitRequest("identity", idFiles, idNotes)} className="w-full">
                  Submit Identity
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-lg font-semibold mb-3">Submit Right to Work</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rtw-docs">Document(s)</Label>
                  <Input id="rtw-docs" type="file" multiple onChange={handleRtwFileChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rtw-notes">Notes (optional)</Label>
                  <Textarea 
                    id="rtw-notes"
                    rows={2} 
                    value={rtwNotes} 
                    onChange={(e) => setRtwNotes(e.target.value)} 
                    placeholder="Visa type, country, permit details" 
                  />
                </div>
                <Button onClick={() => submitRequest("rtw", rtwFiles, rtwNotes)} className="w-full">
                  Submit RTW
                </Button>
              </div>
            </Card>
          </section>

          <section className="space-y-5">
            <Card className="p-5">
              <h3 className="text-lg font-semibold mb-1.5">Add Certifications</h3>
              <p className="text-sm text-muted-foreground mb-3">Add your professional certifications to boost your HR-Ready score</p>
              <Button onClick={() => navigate('/certifications')} className="w-full">
                Add Certification
              </Button>
            </Card>
            <Card className="p-5">
              <h3 className="text-lg font-semibold mb-1.5">Your Logistics Preferences</h3>
              <p className="text-sm text-muted-foreground mb-4">Help employers understand your availability and requirements</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="work-mode">Work Mode Preference</Label>
                  <Select value={workMode} onValueChange={setWorkMode}>
                    <SelectTrigger id="work-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notice-period">Notice Period (days)</Label>
                  <Input 
                    id="notice-period"
                    type="number" 
                    min="0" 
                    max="365"
                    value={noticeDays}
                    onChange={(e) => setNoticeDays(Math.min(365, Math.max(0, parseInt(e.target.value) || 0)))}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">How many days notice do you need to give?</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input 
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="London, UK"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="salary">Salary Expectations</Label>
                  <Input 
                    id="salary"
                    value={salaryBand}
                    onChange={(e) => setSalaryBand(e.target.value)}
                    placeholder="£50k - £70k"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="commute">Commute Radius (km)</Label>
                  <Input 
                    id="commute"
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
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-lg font-semibold mb-3">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">What is HR-Ready verification?</h4>
                  <p className="text-xs text-muted-foreground">HR-Ready is a pre-verification process that confirms your identity, right to work, certifications, and availability. It saves employers time and money, making you a more attractive candidate.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm mb-1">How long does verification take?</h4>
                  <p className="text-xs text-muted-foreground">Most verifications are reviewed within 48 hours. You'll receive an email notification once each component is verified.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm mb-1">What documents do I need?</h4>
                  <p className="text-xs text-muted-foreground">For identity: passport or driving licence. For right to work: work visa, passport, or birth certificate depending on your country. All documents should be clear, legible scans or photos.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm mb-1">How often do I need to update my verification?</h4>
                  <p className="text-xs text-muted-foreground">Identity and right to work verifications typically last 12 months. Certifications should be updated when they expire or when you gain new ones. Logistics preferences can be updated anytime.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm mb-1">Is my data secure?</h4>
                  <p className="text-xs text-muted-foreground">Yes. All documents are encrypted and stored securely. Only verified staff members can access verification documents, and they're never shared with employers without your consent.</p>
                </div>
              </div>
            </Card>
          </section>
        </div>

        <Separator className="my-6" />
        <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto px-4">
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
