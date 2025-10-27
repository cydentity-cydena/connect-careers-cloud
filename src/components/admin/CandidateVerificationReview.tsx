import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Download, Clock, FileText, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export function CandidateVerificationReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState<{ urls: string[]; name: string } | null>(null);

  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['pending-candidate-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*, profiles:candidate_id(full_name, email)')
        .in('verification_type', ['identity', 'rtw'])
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const getSignedUrls = async (paths: string[]) => {
    const urls = await Promise.all(
      paths.map(async (path) => {
        const { data, error } = await supabase.storage
          .from('verification-documents')
          .createSignedUrl(path, 3600);
        if (error) throw error;
        return data.signedUrl;
      })
    );
    return urls;
  };

  const handleViewDocuments = async (request: any) => {
    try {
      const urls = await getSignedUrls(request.document_urls || []);
      setViewingDocuments({
        urls,
        name: `${request.profiles?.full_name} - ${request.verification_type.toUpperCase()}`
      });
    } catch (error: any) {
      toast({
        title: "Error loading documents",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (request: any) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update verification request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      // Update or create candidate_verifications record
      const updateData: any = {};
      
      if (request.verification_type === 'identity') {
        updateData.identity_status = 'green';
        updateData.identity_checked_at = new Date().toISOString();
        updateData.identity_expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year
        updateData.identity_method = 'document_upload';
        updateData.identity_verifier = user?.email || 'staff';
      } else if (request.verification_type === 'rtw') {
        updateData.rtw_status = 'green';
        updateData.rtw_checked_at = new Date().toISOString();
        updateData.rtw_expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year
        updateData.rtw_verifier = user?.email || 'staff';
      }

      // Check if verification record exists
      const { data: existingVerification } = await supabase
        .from('candidate_verifications')
        .select('*')
        .eq('candidate_id', request.candidate_id)
        .maybeSingle();

      if (existingVerification) {
        // Update existing record
        const { error: verifyError } = await supabase
          .from('candidate_verifications')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq('candidate_id', request.candidate_id);

        if (verifyError) throw verifyError;
      } else {
        // Create new record
        const { error: verifyError } = await supabase
          .from('candidate_verifications')
          .insert({
            candidate_id: request.candidate_id,
            ...updateData,
          });

        if (verifyError) throw verifyError;
      }

      // Check if both identity and RTW are now green to set hr_ready
      const { data: updatedVerification } = await supabase
        .from('candidate_verifications')
        .select('*')
        .eq('candidate_id', request.candidate_id)
        .single();

      if (updatedVerification?.identity_status === 'green' && updatedVerification?.rtw_status === 'green') {
        await supabase
          .from('candidate_verifications')
          .update({ hr_ready: true })
          .eq('candidate_id', request.candidate_id);
      }

      toast({
        title: "Verification approved",
        description: `${request.verification_type.toUpperCase()} verification approved for ${request.profiles?.full_name}`,
      });

      queryClient.invalidateQueries({ queryKey: ['pending-candidate-verifications'] });
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

  const handleReject = async (request: any) => {
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
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Verification rejected",
        description: `${request.verification_type.toUpperCase()} verification rejected`,
      });

      queryClient.invalidateQueries({ queryKey: ['pending-candidate-verifications'] });
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

  const identityRequests = pendingRequests?.filter(r => r.verification_type === 'identity') || [];
  const rtwRequests = pendingRequests?.filter(r => r.verification_type === 'rtw') || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Candidate Verification Requests
          </CardTitle>
          <CardDescription>
            Review identity and right-to-work document submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="identity">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="identity">
                Identity ({identityRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rtw">
                Right to Work ({rtwRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4 mt-4">
              {identityRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No pending identity verifications
                </p>
              ) : (
                identityRequests.map((request: any) => (
                  <Card key={request.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{request.profiles?.full_name}</CardTitle>
                          <CardDescription className="mt-1">
                            {request.profiles?.email}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium text-muted-foreground">Submitted</p>
                        <p>{format(new Date(request.created_at), "MMM dd, yyyy 'at' HH:mm")}</p>
                      </div>
                      {request.notes && (
                        <div className="text-sm">
                          <p className="font-medium text-muted-foreground">Notes</p>
                          <p className="text-sm mt-1">{request.notes}</p>
                        </div>
                      )}
                      <div className="text-sm">
                        <p className="font-medium text-muted-foreground">Documents</p>
                        <p className="text-sm">{request.document_urls?.length || 0} file(s) attached</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDocuments(request)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Documents
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(request)}
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
                ))
              )}
            </TabsContent>

            <TabsContent value="rtw" className="space-y-4 mt-4">
              {rtwRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No pending right-to-work verifications
                </p>
              ) : (
                rtwRequests.map((request: any) => (
                  <Card key={request.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{request.profiles?.full_name}</CardTitle>
                          <CardDescription className="mt-1">
                            {request.profiles?.email}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium text-muted-foreground">Submitted</p>
                        <p>{format(new Date(request.created_at), "MMM dd, yyyy 'at' HH:mm")}</p>
                      </div>
                      {request.notes && (
                        <div className="text-sm">
                          <p className="font-medium text-muted-foreground">Notes</p>
                          <p className="text-sm mt-1">{request.notes}</p>
                        </div>
                      )}
                      <div className="text-sm">
                        <p className="font-medium text-muted-foreground">Documents</p>
                        <p className="text-sm">{request.document_urls?.length || 0} file(s) attached</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDocuments(request)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Documents
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(request)}
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
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={!!viewingDocuments} onOpenChange={() => setViewingDocuments(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingDocuments?.name}</DialogTitle>
            <DialogDescription>
              Review the submitted documents below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewingDocuments?.urls.map((url, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="p-2 bg-muted flex items-center justify-between">
                  <span className="text-sm font-medium">Document {index + 1}</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
                <iframe
                  src={url}
                  className="w-full h-[500px]"
                  title={`Document ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedRequest?.profiles?.full_name}'s {selectedRequest?.verification_type} verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Document not clear, information doesn't match, expired document..."
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
              onClick={() => selectedRequest && handleReject(selectedRequest)}
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
