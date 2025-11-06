import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Search, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AddCandidateToPipelineProps {
  onSuccess: () => void;
}

interface ExistingCandidate {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  desired_job_title: string | null;
}

export default function AddCandidateToPipeline({ onSuccess }: AddCandidateToPipelineProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingCandidates, setExistingCandidates] = useState<ExistingCandidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    stage: "invited",
    source: "",
    desiredRole: "",
    isPriority: false,
    isFounding20: false,
    staffNotes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchExistingCandidates();
    }
  }, [open]);

  const fetchExistingCandidates = async () => {
    try {
      // Get all profiles with candidate role who are NOT in the pipeline
      const { data: candidateRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "candidate");

      if (!candidateRoles?.length) return;

      const candidateIds = candidateRoles.map(r => r.user_id);

      // Get candidates already in pipeline
      const { data: pipelineCandidates } = await supabase
        .from("candidate_pipeline")
        .select("candidate_id");

      const pipelineIds = pipelineCandidates?.map(p => p.candidate_id) || [];

      // Get profiles that are candidates but not in pipeline
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, desired_job_title")
        .in("id", candidateIds)
        .not("id", "in", `(${pipelineIds.join(",")})`)
        .order("full_name");

      setExistingCandidates(profiles || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if user exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email.toLowerCase())
        .maybeSingle();

      let candidateId = existingProfile?.id;

      // If user doesn't exist, create a profile (admin can create profiles)
      if (!candidateId) {
        // Create a temporary password for the user
        const tempPassword = Math.random().toString(36).slice(-16);
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.toLowerCase(),
          password: tempPassword,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });

        if (authError) throw authError;
        candidateId = authData.user?.id;

        if (!candidateId) throw new Error("Failed to create user");

        // Add candidate role
        await supabase.from("user_roles").insert({
          user_id: candidateId,
          role: "candidate",
        });
      }

      // Add to pipeline
      const { error: pipelineError } = await supabase
        .from("candidate_pipeline")
        .insert({
          candidate_id: candidateId,
          stage: formData.stage,
          source: formData.source || null,
          desired_role: formData.desiredRole || null,
          is_priority: formData.isPriority,
          is_founding_20: formData.isFounding20,
          staff_notes: formData.staffNotes || null,
        });

      if (pipelineError) throw pipelineError;

      toast({
        title: "Candidate added",
        description: "Candidate successfully added to the pipeline",
      });

      setFormData({
        email: "",
        fullName: "",
        stage: "invited",
        source: "",
        desiredRole: "",
        isPriority: false,
        isFounding20: false,
        staffNotes: "",
      });
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error adding candidate",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExistingCandidate = async () => {
    if (!selectedCandidate) return;
    
    setLoading(true);
    try {
      // Add to pipeline
      const { error: pipelineError } = await supabase
        .from("candidate_pipeline")
        .insert({
          candidate_id: selectedCandidate,
          stage: formData.stage,
          source: formData.source || null,
          desired_role: formData.desiredRole || null,
          is_priority: formData.isPriority,
          is_founding_20: formData.isFounding20,
          staff_notes: formData.staffNotes || null,
        });

      if (pipelineError) throw pipelineError;

      toast({
        title: "Candidate added",
        description: "Candidate successfully added to the pipeline",
      });

      setSelectedCandidate(null);
      setFormData({
        email: "",
        fullName: "",
        stage: "invited",
        source: "",
        desiredRole: "",
        isPriority: false,
        isFounding20: false,
        staffNotes: "",
      });
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error adding candidate",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = existingCandidates.filter(c => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.desired_job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Candidate to Pipeline</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="existing" className="w-full flex-1 flex flex-col overflow-hidden min-h-0">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="existing">From Platform</TabsTrigger>
            <TabsTrigger value="new">Create New</TabsTrigger>
          </TabsList>

          {/* Existing Candidates Tab */}
          <TabsContent value="existing" className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Candidates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-2">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {existingCandidates.length === 0 
                    ? "No candidates available to add" 
                    : "No candidates match your search"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedCandidate === candidate.id
                          ? "bg-primary text-primary-foreground shadow-lg border-2 border-primary ring-2 ring-primary/20"
                          : "bg-card hover:bg-muted/80 border-2 border-border"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className={selectedCandidate === candidate.id ? "ring-2 ring-primary-foreground" : ""}>
                          <AvatarImage src={candidate.avatar_url || undefined} />
                          <AvatarFallback>
                            {candidate.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        {selectedCandidate === candidate.id && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${selectedCandidate === candidate.id ? "text-primary-foreground" : ""}`}>
                          {candidate.full_name || "Unknown"}
                        </div>
                        <div className={`text-sm truncate ${selectedCandidate === candidate.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {candidate.email}
                        </div>
                        {candidate.desired_job_title && (
                          <div className={`text-xs truncate ${selectedCandidate === candidate.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {candidate.desired_job_title}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {!selectedCandidate && (
              <div className="text-center py-4 text-sm text-muted-foreground bg-muted/50 rounded-md border border-dashed">
                Select a candidate above to continue
              </div>
            )}

            {selectedCandidate && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4 bg-muted/30 p-4 rounded-lg border"  >
                <div className="space-y-2">
                  <Label htmlFor="stage-existing">Initial Stage</Label>
                  <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                    <SelectTrigger id="stage-existing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invited">Invited</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="needs_info">Needs Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source-existing">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger id="source-existing">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Academy">Academy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredRole-existing">Desired Role</Label>
                  <Select value={formData.desiredRole} onValueChange={(value) => setFormData({ ...formData, desiredRole: value })}>
                    <SelectTrigger id="desiredRole-existing">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOC / DFIR">SOC / DFIR</SelectItem>
                      <SelectItem value="GRC / ISO">GRC / ISO</SelectItem>
                      <SelectItem value="Cloud Sec">Cloud Sec</SelectItem>
                      <SelectItem value="AppSec">AppSec</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffNotes-existing">Staff Notes</Label>
                  <Textarea
                    id="staffNotes-existing"
                    value={formData.staffNotes}
                    onChange={(e) => setFormData({ ...formData, staffNotes: e.target.value })}
                    placeholder="Internal notes about this candidate..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPriority-existing"
                      checked={formData.isPriority}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPriority: checked as boolean })}
                    />
                    <Label htmlFor="isPriority-existing" className="cursor-pointer">Priority</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFounding20-existing"
                      checked={formData.isFounding20}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFounding20: checked as boolean })}
                    />
                    <Label htmlFor="isFounding20-existing" className="cursor-pointer">Chosen</Label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddExistingCandidate} 
                    disabled={loading || !selectedCandidate} 
                    className="flex-1"
                  >
                    {loading ? "Adding..." : "Add to Pipeline"}
                  </Button>
                </div>
                </div>
              </>
            )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* New Candidate Tab */}
          <TabsContent value="new" className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="pb-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="candidate@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage">Initial Stage</Label>
                    <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invited">Invited</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="needs_info">Needs Info</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Community">Community</SelectItem>
                        <SelectItem value="Academy">Academy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desiredRole">Desired Role</Label>
                    <Select value={formData.desiredRole} onValueChange={(value) => setFormData({ ...formData, desiredRole: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOC / DFIR">SOC / DFIR</SelectItem>
                        <SelectItem value="GRC / ISO">GRC / ISO</SelectItem>
                        <SelectItem value="Cloud Sec">Cloud Sec</SelectItem>
                        <SelectItem value="AppSec">AppSec</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staffNotes">Staff Notes</Label>
                    <Textarea
                      id="staffNotes"
                      value={formData.staffNotes}
                      onChange={(e) => setFormData({ ...formData, staffNotes: e.target.value })}
                      placeholder="Internal notes about this candidate..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPriority"
                        checked={formData.isPriority}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPriority: checked as boolean })}
                      />
                      <Label htmlFor="isPriority" className="cursor-pointer">Priority</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isFounding20"
                        checked={formData.isFounding20}
                        onCheckedChange={(checked) => setFormData({ ...formData, isFounding20: checked as boolean })}
                      />
                      <Label htmlFor="isFounding20" className="cursor-pointer">Chosen</Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Adding..." : "Create & Add"}
                    </Button>
                  </div>
                </form>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
