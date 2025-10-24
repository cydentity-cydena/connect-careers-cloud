import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

interface AddCandidateToPipelineProps {
  onSuccess: () => void;
}

export default function AddCandidateToPipeline({ onSuccess }: AddCandidateToPipelineProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Candidate to Pipeline</DialogTitle>
        </DialogHeader>
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
              {loading ? "Adding..." : "Add Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
