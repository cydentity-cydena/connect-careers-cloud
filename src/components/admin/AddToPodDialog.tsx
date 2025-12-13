import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2 } from "lucide-react";

interface Pod {
  id: string;
  name: string;
  description: string | null;
}

interface AddToPodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  candidateName: string;
  onSuccess?: () => void;
}

export const AddToPodDialog = ({ 
  open, 
  onOpenChange, 
  candidateId, 
  candidateName,
  onSuccess 
}: AddToPodDialogProps) => {
  const [pods, setPods] = useState<Pod[]>([]);
  const [selectedPodId, setSelectedPodId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingPods, setExistingPods] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPodsAndMembership();
    }
  }, [open, candidateId]);

  const loadPodsAndMembership = async () => {
    setLoading(true);
    try {
      // Fetch all active pods
      const { data: podsData, error: podsError } = await supabase
        .from("candidate_pods")
        .select("id, name, description")
        .eq("is_active", true)
        .order("name");

      if (podsError) throw podsError;

      // Fetch pods the candidate is already in
      const { data: membershipData, error: memberError } = await supabase
        .from("pod_members")
        .select("pod_id")
        .eq("candidate_id", candidateId);

      if (memberError) throw memberError;

      setPods(podsData || []);
      setExistingPods(membershipData?.map(m => m.pod_id) || []);
    } catch (error: any) {
      toast({
        title: "Error loading pods",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPodId) {
      toast({
        title: "Please select a pod",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("pod_members")
        .insert({
          pod_id: selectedPodId,
          candidate_id: candidateId,
          added_by: user?.id,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Candidate added to pod",
        description: `${candidateName} has been added to the pod.`,
      });

      setSelectedPodId("");
      setNotes("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already in pod",
          description: "This candidate is already in the selected pod.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error adding to pod",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const availablePods = pods.filter(pod => !existingPods.includes(pod.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add to Pod
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Adding <span className="font-medium text-foreground">{candidateName}</span> to a pod
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availablePods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">
                {pods.length === 0 
                  ? "No pods available. Create a pod first." 
                  : "This candidate is already in all available pods."
                }
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="pod">Select Pod</Label>
                <Select value={selectedPodId} onValueChange={setSelectedPodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pod..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePods.map((pod) => (
                      <SelectItem key={pod.id} value={pod.id}>
                        <div>
                          <div>{pod.name}</div>
                          {pod.description && (
                            <div className="text-xs text-muted-foreground">{pod.description}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this candidate..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {existingPods.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Already in {existingPods.length} pod{existingPods.length > 1 ? 's' : ''}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={!selectedPodId || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Pod"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
