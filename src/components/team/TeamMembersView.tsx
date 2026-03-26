import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, UserX, Mail, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { InviteTeamMemberDialog } from "./InviteTeamMemberDialog";

interface TeamMembersViewProps {
  role: 'employer' | 'recruiter';
}

export function TeamMembersView({ role }: TeamMembersViewProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const { data: teamMembers, isLoading: loadingMembers, refetch: refetchMembers } = useQuery({
    queryKey: ["team-members", role],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('team_members' as any)
        .select(`
          *,
          member:profiles!member_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('team_owner_id', user.id)
        .eq('role', role)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const { data: invitations, isLoading: loadingInvitations, refetch: refetchInvitations } = useQuery({
    queryKey: ["team-invitations", role],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('team_invitations' as any)
        .select('*')
        .eq('inviter_id', user.id)
        .eq('role', role)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const { data: seatInfo } = useQuery({
    queryKey: ["seat-info", role],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get subscription tier
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!subscription) return { limit: 1, used: 1 };

      // Get seat limit from function
      const { data: limit } = await supabase.rpc('get_tier_seat_limit' as any, {
        tier_name: subscription.tier
      });

      // Get current usage
      const { data: usage } = await supabase.rpc('get_seat_usage' as any, {
        owner_id: user.id,
        role_type: role
      });

      const usageNum = typeof usage === 'number' ? usage : 0;
      return { limit: limit || 1, used: usageNum + 1 }; // +1 for owner
    },
  });

  const handleResendInvite = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-team-invitation', {
        body: { invitee_email: email, role, resend: true }
      });
      if (error) throw error;
      toast({
        title: "Invitation resent",
        description: `Invitation resent to ${email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members' as any)
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "Team member has been removed successfully",
      });

      refetchMembers();
      refetchInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  const pendingInvitations = invitations?.filter(inv => inv.status === 'pending') || [];
  const seatsRemaining = (seatInfo?.limit || 1) - (seatInfo?.used || 1);

  if (loadingMembers || loadingInvitations) {
    return <div className="p-8 text-center text-muted-foreground">Loading team...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your team and subscription seats
              </CardDescription>
            </div>
            <Button onClick={() => setShowInviteDialog(true)} disabled={seatsRemaining <= 0}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Seat Usage</span>
              <span className="font-medium">{seatInfo?.used || 1} / {seatInfo?.limit || 1}</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${((seatInfo?.used || 1) / (seatInfo?.limit || 1)) * 100}%` }}
              />
            </div>
            {seatsRemaining <= 0 && (
              <p className="text-xs text-orange-600 mt-2">
                You've reached your seat limit. Upgrade your plan to invite more members.
              </p>
            )}
          </div>

          {/* Active Team Members */}
          <div className="space-y-3">
            <h3 className="font-semibold">Active Members</h3>
            {teamMembers && teamMembers.length > 0 ? (
              teamMembers.filter(m => m.is_active).map((member: any) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.member?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.member?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{member.member?.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No team members yet. Invite someone to get started!
              </p>
            )}
          </div>

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold">Pending Invitations</h3>
              {pendingInvitations.map((invitation) => (
                <Card key={invitation.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invitation.invitee_email}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendInvite(invitation.invitee_email)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Resend
                      </Button>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <InviteTeamMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        role={role}
        onInviteSent={() => {
          refetchMembers();
          refetchInvitations();
        }}
      />
    </div>
  );
}
