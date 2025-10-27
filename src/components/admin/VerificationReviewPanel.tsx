import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, ExternalLink, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function VerificationReviewPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['pending-verification-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(r => r.user_id || r.candidate_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        // Merge profile data
        return data.map(request => ({
          ...request,
          profile: profiles?.find(p => p.id === (request.user_id || request.candidate_id))
        }));
      }
      
      return data;
    },
  });

  const handleApprove = async (requestId: string, userId: string | undefined) => {
    if (!userId) {
      toast({ title: "Error", description: "User ID missing", variant: "destructive" });
      return;
    }
    setProcessing(true);
    try {
      // Update verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update profile to mark as verified
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast({
        title: "Verification approved",
        description: "The employer has been verified successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ['pending-verification-requests'] });
      setSelectedRequest(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Verification rejected",
        description: "The employer has been notified of the rejection.",
      });

      queryClient.invalidateQueries({ queryKey: ['pending-verification-requests'] });
      setSelectedRequest(null);
      setRejectionReason("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return <div>Loading verification requests...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Verification Requests
          </CardTitle>
          <CardDescription>
            {pendingRequests?.length || 0} businesses waiting for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingRequests || pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No pending verification requests
            </p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request: any) => (
                <Card key={request.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.company_name}</CardTitle>
                        <CardDescription className="mt-1">
                          {request.profile?.email || 'No email'}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Website</p>
                        <a
                          href={request.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {request.company_website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {request.business_registration_number && (
                        <div>
                          <p className="font-medium text-muted-foreground">Registration #</p>
                          <p>{request.business_registration_number}</p>
                        </div>
                      )}
                    </div>
                    {request.additional_info && (
                      <div>
                        <p className="font-medium text-muted-foreground text-sm">Additional Info</p>
                        <p className="text-sm mt-1">{request.additional_info}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(request.id, request.user_id || request.candidate_id)}
                        disabled={processing}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setSelectedRequest(request)}
                        disabled={processing}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedRequest?.company_name}'s verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Website doesn't match email domain, insufficient business information..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReject(selectedRequest?.id)}
              disabled={processing || !rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
