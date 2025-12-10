import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Assessment {
  id: string;
  assessment_name: string;
  assessment_type: string;
  description: string | null;
}

interface SendAssessmentDialogProps {
  assessment: Assessment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SendAssessmentDialog = ({ assessment, open, onOpenChange }: SendAssessmentDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates-for-assessment', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          username
        `)
        .limit(20);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      // Get candidates only
      const { data: candidateRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'candidate');

      const candidateIds = candidateRoles?.map(r => r.user_id) || [];

      if (candidateIds.length > 0) {
        query = query.in('id', candidateIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const handleSend = async () => {
    if (!selectedCandidate || !assessment) {
      toast.error("Please select a candidate");
      return;
    }

    setIsSending(true);
    try {
      // Create a notification for the candidate
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedCandidate,
          type: 'system',
          title: 'New Assessment Assigned',
          message: `You have been assigned the assessment: ${assessment.assessment_name}`,
          link: '/skills-assessment'
        });

      if (notifError) throw notifError;

      // Update times_used counter
      await supabase
        .from('custom_assessments')
        .update({ times_used: (await supabase.from('custom_assessments').select('times_used').eq('id', assessment.id).single()).data?.times_used + 1 || 1 })
        .eq('id', assessment.id);

      toast.success("Assessment sent successfully!");
      onOpenChange(false);
      setSelectedCandidate(null);
      setSearchQuery("");
    } catch (error) {
      console.error('Error sending assessment:', error);
      toast.error("Failed to send assessment");
    } finally {
      setIsSending(false);
    }
  };

  if (!assessment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Assessment
          </DialogTitle>
          <DialogDescription>
            Send "{assessment.assessment_name}" to a candidate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Search Candidates</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[250px] border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : candidates && candidates.length > 0 ? (
              <div className="p-2 space-y-1">
                {candidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedCandidate === candidate.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={candidate.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {candidate.full_name || candidate.username || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {candidate.email}
                      </p>
                    </div>
                    {selectedCandidate === candidate.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <User className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No candidates found</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!selectedCandidate || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Assessment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
