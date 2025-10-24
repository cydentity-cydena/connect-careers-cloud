import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface AddCandidatesToPodProps {
  podId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddCandidatesToPod = ({ podId, open, onOpenChange }: AddCandidatesToPodProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["available-candidates", podId, searchTerm],
    queryFn: async () => {
      // Get candidates who are not already in this pod
      const { data: existingMembers } = await supabase
        .from("pod_members")
        .select("candidate_id")
        .eq("pod_id", podId);

      const existingIds = existingMembers?.map(m => m.candidate_id) || [];

      let query = supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          user_roles!inner(role)
        `)
        .eq("user_roles.role", "candidate");

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Filter out existing members
      return data?.filter(c => !existingIds.includes(c.id)) || [];
    },
    enabled: open,
  });

  const addCandidatesMutation = useMutation({
    mutationFn: async () => {
      const inserts = Array.from(selectedCandidates).map(candidateId => ({
        pod_id: podId,
        candidate_id: candidateId,
      }));

      const { error } = await supabase
        .from("pod_members")
        .insert(inserts);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Added ${selectedCandidates.size} candidate(s) to pod`);
      setSelectedCandidates(new Set());
      queryClient.invalidateQueries({ queryKey: ["pod-members", podId] });
      queryClient.invalidateQueries({ queryKey: ["available-candidates", podId] });
      queryClient.invalidateQueries({ queryKey: ["candidate-pods"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to add candidates: " + error.message);
    },
  });

  const toggleCandidate = (candidateId: string) => {
    const newSet = new Set(selectedCandidates);
    if (newSet.has(candidateId)) {
      newSet.delete(candidateId);
    } else {
      newSet.add(candidateId);
    }
    setSelectedCandidates(newSet);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Candidates to Pod</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search Candidates</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-lg p-4">
            {isLoading ? (
              <div className="text-center py-8">Loading candidates...</div>
            ) : candidates && candidates.length > 0 ? (
              candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer"
                  onClick={() => toggleCandidate(candidate.id)}
                >
                  <Checkbox
                    checked={selectedCandidates.has(candidate.id)}
                    onCheckedChange={() => toggleCandidate(candidate.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={candidate.avatar_url || ""} />
                    <AvatarFallback>
                      {candidate.full_name?.[0] || candidate.username?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {candidate.full_name || candidate.username || "Unknown"}
                    </p>
                    {candidate.username && candidate.full_name && (
                      <p className="text-sm text-muted-foreground">@{candidate.username}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No candidates found" : "All candidates are already in this pod"}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {selectedCandidates.size} candidate(s) selected
            </p>
            <Button
              onClick={() => addCandidatesMutation.mutate()}
              disabled={selectedCandidates.size === 0 || addCandidatesMutation.isPending}
            >
              {addCandidatesMutation.isPending ? "Adding..." : "Add to Pod"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
