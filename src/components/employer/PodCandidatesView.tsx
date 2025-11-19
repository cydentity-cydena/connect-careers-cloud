import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Briefcase, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PodCandidatesViewProps {
  podId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PodCandidatesView = ({ podId, open, onOpenChange }: PodCandidatesViewProps) => {
  const navigate = useNavigate();

  const { data: pod, isLoading: loadingPod } = useQuery({
    queryKey: ["pod-details", podId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_pods")
        .select("*")
        .eq("id", podId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: candidates, isLoading: loadingCandidates } = useQuery({
    queryKey: ["pod-candidates", podId],
    queryFn: async () => {
      // Get pod members
      const { data: members, error: membersError } = await supabase
        .from("pod_members")
        .select("candidate_id")
        .eq("pod_id", podId);

      if (membersError) throw membersError;

      const candidateIds = members?.map(m => m.candidate_id) || [];
      
      if (candidateIds.length === 0) return [];

      // Get candidate profiles and related data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          location,
          desired_job_title,
          bio
        `)
        .in("id", candidateIds);

      if (profilesError) throw profilesError;

      // Get candidate profiles data (years of experience, etc)
      const { data: candidateProfiles } = await supabase
        .from("candidate_profiles")
        .select("user_id, years_experience, specializations")
        .in("user_id", candidateIds);

      // Get certifications count
      const { data: certs } = await supabase
        .from("certifications")
        .select("candidate_id")
        .in("candidate_id", candidateIds);

      // Combine data
      return profiles?.map(profile => {
        const candidateProfile = candidateProfiles?.find(cp => cp.user_id === profile.id);
        const certCount = certs?.filter(c => c.candidate_id === profile.id).length || 0;

        return {
          ...profile,
          years_experience: candidateProfile?.years_experience,
          specializations: candidateProfile?.specializations || [],
          cert_count: certCount,
        };
      }) || [];
    },
    enabled: open,
  });

  const handleViewProfile = (candidateId: string) => {
    navigate(`/profile/${candidateId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {loadingPod ? "Loading..." : pod?.name}
          </DialogTitle>
          {pod?.description && (
            <p className="text-muted-foreground">{pod.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loadingCandidates ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading candidates...</p>
            </div>
          ) : candidates && candidates.length > 0 ? (
            <div className="grid gap-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={candidate.avatar_url || ""} />
                      <AvatarFallback>
                        {candidate.full_name?.[0] || candidate.username?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {candidate.full_name || candidate.username || "Anonymous"}
                        </h3>
                        {candidate.desired_job_title && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {candidate.desired_job_title}
                          </p>
                        )}
                      </div>

                      {candidate.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {candidate.bio}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {candidate.location && (
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {candidate.location}
                          </Badge>
                        )}
                        {candidate.years_experience !== null && candidate.years_experience !== undefined && (
                          <Badge variant="secondary">
                            {candidate.years_experience} years exp
                          </Badge>
                        )}
                        {candidate.cert_count > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Award className="h-3 w-3" />
                            {candidate.cert_count} cert{candidate.cert_count !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        {candidate.specializations?.slice(0, 3).map((spec: string) => (
                          <Badge key={spec} variant="outline">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleViewProfile(candidate.id)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No candidates in this pod yet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
