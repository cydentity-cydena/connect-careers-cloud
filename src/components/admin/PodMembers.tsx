import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface PodMembersProps {
  podId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PodMemberWithProfile {
  id: string;
  pod_id: string;
  candidate_id: string;
  added_by: string;
  added_at: string;
  notes: string;
  profile?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export const PodMembers = ({ podId, open, onOpenChange }: PodMembersProps) => {
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery<PodMemberWithProfile[]>({
    queryKey: ["pod-members", podId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pod_members")
        .select("*")
        .eq("pod_id", podId)
        .order("added_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const candidateIds = data.map(m => m.candidate_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", candidateIds);

        return data.map(member => ({
          ...member,
          profile: profiles?.find(p => p.id === member.candidate_id)
        }));
      }

      return data;
    },
    enabled: open,
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("pod_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member removed from pod");
      queryClient.invalidateQueries({ queryKey: ["pod-members", podId] });
      queryClient.invalidateQueries({ queryKey: ["candidate-pods"] });
    },
    onError: (error) => {
      toast.error("Failed to remove member: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pod Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : members && members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.profile?.avatar_url || ""} />
                    <AvatarFallback>
                      {member.profile?.full_name?.[0] || member.profile?.username?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.profile?.full_name || member.profile?.username || "Unknown"}
                    </p>
                    {member.notes && (
                      <p className="text-sm text-muted-foreground">{member.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(member.added_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMemberMutation.mutate(member.id)}
                  disabled={removeMemberMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No candidates in this pod yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
