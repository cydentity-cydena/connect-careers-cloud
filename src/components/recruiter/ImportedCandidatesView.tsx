import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Mail, UserCheck, UserX, Clock, FileText, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { Link } from "react-router-dom";

interface ImportedCandidate {
  id: string;
  candidate_id: string;
  activation_status: string;
  invitation_sent_at: string | null;
  activated_at: string | null;
  recruiter_notes: string | null;
  profile: {
    full_name: string;
    email: string;
    username: string | null;
    avatar_url: string | null;
    location: string | null;
    profile_claimed: boolean;
  };
  candidate_profile: {
    title: string | null;
    years_experience: number | null;
  } | null;
  import_batch: {
    batch_name: string;
  } | null;
}

export function ImportedCandidatesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [messageDialog, setMessageDialog] = useState<{ open: boolean; recipientId: string; recipientName: string } | null>(null);

  const { data: importedCandidates, isLoading, refetch } = useQuery({
    queryKey: ["imported-candidates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First get relationships
      const { data: relationships, error: relError } = await supabase
        .from('recruiter_candidate_relationships')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      if (relError) throw relError;
      if (!relationships || relationships.length === 0) return [];

      // Get all candidate IDs
      const candidateIds = relationships.map(r => r.candidate_id);

      // Fetch profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, username, avatar_url, location, profile_claimed')
        .in('id', candidateIds);

      if (profileError) throw profileError;

      // Fetch candidate profiles
      const { data: candidateProfiles, error: cpError } = await supabase
        .from('candidate_profiles')
        .select('user_id, title, years_experience')
        .in('user_id', candidateIds);

      if (cpError) throw cpError;

      // Fetch import batches
      const batchIds = relationships.map(r => r.import_batch_id).filter(Boolean);
      const { data: batches, error: batchError } = await supabase
        .from('recruiter_candidate_imports')
        .select('id, batch_name')
        .in('id', batchIds);

      if (batchError) throw batchError;

      // Combine the data
      const combined: ImportedCandidate[] = relationships.map(rel => {
        const profile = profiles?.find(p => p.id === rel.candidate_id);
        const candidateProfile = candidateProfiles?.find(cp => cp.user_id === rel.candidate_id);
        const batch = batches?.find(b => b.id === rel.import_batch_id);

        return {
          id: rel.id,
          candidate_id: rel.candidate_id,
          activation_status: rel.activation_status,
          invitation_sent_at: rel.invitation_sent_at,
          activated_at: rel.activated_at,
          recruiter_notes: rel.recruiter_notes,
          profile: profile ? {
            full_name: profile.full_name || '',
            email: profile.email || '',
            username: profile.username,
            avatar_url: profile.avatar_url,
            location: profile.location,
            profile_claimed: profile.profile_claimed ?? true,
          } : {
            full_name: '',
            email: '',
            username: null,
            avatar_url: null,
            location: null,
            profile_claimed: true,
          },
          candidate_profile: candidateProfile ? {
            title: candidateProfile.title,
            years_experience: candidateProfile.years_experience,
          } : null,
          import_batch: batch ? {
            batch_name: batch.batch_name,
          } : null,
        };
      });

      return combined;
    },
  });

  const sendInvitation = async (relationshipId: string, candidateEmail: string) => {
    try {
      // Here you would integrate with your email service
      // For now, just update the status
      const { error } = await supabase
        .from('recruiter_candidate_relationships')
        .update({
          activation_status: 'invited',
          invitation_sent_at: new Date().toISOString(),
        })
        .eq('id', relationshipId);

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `Invitation email sent to ${candidateEmail}`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, claimed: boolean) => {
    if (!claimed) {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Unclaimed</Badge>;
    }
    
    switch (status) {
      case 'claimed':
        return <Badge variant="default" className="bg-green-500"><UserCheck className="h-3 w-3 mr-1" />Active</Badge>;
      case 'invited':
        return <Badge variant="outline"><Mail className="h-3 w-3 mr-1" />Invited</Badge>;
      case 'declined':
        return <Badge variant="destructive"><UserX className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredCandidates = importedCandidates?.filter(candidate => {
    const matchesSearch = 
      candidate.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.candidate_profile?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "unclaimed" && !candidate.profile.profile_claimed) ||
      (statusFilter === "claimed" && candidate.profile.profile_claimed) ||
      candidate.activation_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: importedCandidates?.length || 0,
    unclaimed: importedCandidates?.filter(c => !c.profile.profile_claimed).length || 0,
    claimed: importedCandidates?.filter(c => c.profile.profile_claimed).length || 0,
    invited: importedCandidates?.filter(c => c.activation_status === 'invited').length || 0,
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading imported candidates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Imported</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{stats.unclaimed}</div>
            <div className="text-sm text-muted-foreground">Unclaimed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.invited}</div>
            <div className="text-sm text-muted-foreground">Invited</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.claimed}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Imported Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unclaimed">Unclaimed</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="claimed">Active</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredCandidates?.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {candidate.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {candidate.profile.username ? (
                              <Link 
                                to={`/profiles/${candidate.candidate_id}`}
                                className="font-semibold hover:text-primary transition-colors"
                              >
                                {candidate.profile.full_name}
                              </Link>
                            ) : (
                              <h4 className="font-semibold">{candidate.profile.full_name}</h4>
                            )}
                            <p className="text-sm text-muted-foreground">{candidate.profile.email}</p>
                            {candidate.candidate_profile?.title && (
                              <p className="text-sm mt-1">{candidate.candidate_profile.title}</p>
                            )}
                          </div>
                          {getStatusBadge(candidate.activation_status, candidate.profile.profile_claimed)}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {candidate.candidate_profile?.years_experience && (
                            <Badge variant="outline">
                              {candidate.candidate_profile.years_experience} yrs exp
                            </Badge>
                          )}
                          {candidate.profile.location && (
                            <Badge variant="outline">{candidate.profile.location}</Badge>
                          )}
                          {candidate.import_batch?.batch_name && (
                            <Badge variant="secondary">
                              <FileText className="h-3 w-3 mr-1" />
                              {candidate.import_batch.batch_name}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3">
                          {!candidate.profile.profile_claimed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendInvitation(candidate.id, candidate.profile.email)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Invitation
                            </Button>
                          )}
                          {candidate.profile.profile_claimed && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setMessageDialog({
                                  open: true,
                                  recipientId: candidate.candidate_id,
                                  recipientName: candidate.profile.full_name,
                                })}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                              {candidate.profile.username && (
                                <Button size="sm" variant="default" asChild>
                                  <Link to={`/profiles/${candidate.candidate_id}`}>
                                    View Profile
                                  </Link>
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredCandidates?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No candidates found matching your filters
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {messageDialog && (
        <SendMessageDialog
          open={messageDialog.open}
          onOpenChange={(open) => !open && setMessageDialog(null)}
          recipientId={messageDialog.recipientId}
          recipientName={messageDialog.recipientName}
        />
      )}
    </div>
  );
}