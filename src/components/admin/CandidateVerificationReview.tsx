import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Download, Clock, FileText, Shield, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export function CandidateVerificationReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState<{ urls: string[]; name: string } | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: allRequests, isLoading, refetch } = useQuery({
    queryKey: ['all-candidate-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*, profiles:candidate_id(full_name, email, username)')
        .in('verification_type', ['identity', 'rtw'])
        .is('company_name', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab, pageSize]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('verification-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_requests',
          filter: 'company_name=is.null'
        },
        (payload) => {
          console.log('Verification request changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['all-candidate-verifications'] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New verification request",
              description: "A candidate has submitted documents for review",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

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
      
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_comment: approvalComment || null,
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (request.verification_type === 'identity') {
        updateData.identity_status = 'green';
        updateData.identity_checked_at = new Date().toISOString();
        updateData.identity_expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        updateData.identity_method = 'document_upload';
        updateData.identity_verifier = user?.email || 'staff';
      } else if (request.verification_type === 'rtw') {
        updateData.rtw_status = 'green';
        updateData.rtw_checked_at = new Date().toISOString();
        updateData.rtw_expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        updateData.rtw_verifier = user?.email || 'staff';
      }

      const { error: verifyError } = await supabase
        .from('candidate_verifications')
        .upsert({
          candidate_id: request.candidate_id,
          ...updateData,
        }, {
          onConflict: 'candidate_id',
          ignoreDuplicates: false,
        });

      if (verifyError) throw verifyError;

      const { data: updatedVerification } = await supabase
        .from('candidate_verifications')
        .select('*')
        .eq('candidate_id', request.candidate_id)
        .single();

      if (updatedVerification?.identity_status === 'green' && updatedVerification?.rtw_status === 'green') {
        const { error: hrReadyError } = await supabase
          .from('candidate_verifications')
          .update({ 
            hr_ready: true,
            updated_at: new Date().toISOString(),
          })
          .eq('candidate_id', request.candidate_id);

        if (hrReadyError) throw hrReadyError;
      }

      toast({
        title: "Verification approved",
        description: `${request.verification_type.toUpperCase()} verification approved for ${request.profiles?.full_name}`,
      });

      queryClient.invalidateQueries({ queryKey: ['all-candidate-verifications'] });
      setSelectedRequest(null);
      setShowApprovalDialog(false);
      setApprovalComment("");
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

      queryClient.invalidateQueries({ queryKey: ['all-candidate-verifications'] });
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

  const filteredRequests = allRequests?.filter(r => r.status === activeTab) || [];
  const identityRequests = filteredRequests.filter(r => r.verification_type === 'identity');
  const rtwRequests = filteredRequests.filter(r => r.verification_type === 'rtw');

  const handlePageChange = (newPage: number, totalPages: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };

  const renderRequestCard = (request: any) => (
    <Card key={request.id} className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{request.profiles?.full_name}</CardTitle>
            {request.profiles?.username && (
              <p className="text-xs text-muted-foreground">@{request.profiles.username}</p>
            )}
            <CardDescription>
              {request.profiles?.email}
            </CardDescription>
          </div>
          <Badge 
            variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            {request.status === 'pending' && <Clock className="h-3 w-3" />}
            {request.status === 'pending' ? 'Pending' : request.status === 'approved' ? 'Approved' : 'Rejected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p className="font-medium text-muted-foreground">Submitted</p>
          <p>{format(new Date(request.created_at), "MMM dd, yyyy 'at' HH:mm")}</p>
        </div>
        {request.reviewed_at && (
          <div className="text-sm">
            <p className="font-medium text-muted-foreground">Reviewed</p>
            <p>{format(new Date(request.reviewed_at), "MMM dd, yyyy 'at' HH:mm")}</p>
          </div>
        )}
        {request.notes && (
          <div className="text-sm">
            <p className="font-medium text-muted-foreground">Notes</p>
            <p className="text-sm mt-1">{request.notes}</p>
          </div>
        )}
        {request.rejection_reason && (
          <div className="text-sm p-2 bg-destructive/10 rounded">
            <p className="font-medium text-destructive mb-1">Rejection Reason</p>
            <p className="text-sm">{request.rejection_reason}</p>
          </div>
        )}
        {request.admin_comment && (
          <div className="text-sm p-2 bg-secondary/50 rounded">
            <p className="font-medium mb-1">Admin Comment</p>
            <p className="text-sm">{request.admin_comment}</p>
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
          {request.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  setSelectedRequest(request);
                  setShowApprovalDialog(true);
                }}
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderVerificationTypeTab = (requests: any[], type: 'identity' | 'rtw') => {
    const totalPages = Math.ceil(requests.length / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRequests = requests.slice(startIndex, endIndex);

    return (
      <>
        {requests.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No {activeTab} {type === 'identity' ? 'identity' : 'right-to-work'} requests
          </Card>
        ) : (
          <>
            <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
              <div className="space-y-4">
                {paginatedRequests.map(renderRequestCard)}
              </div>
            </ScrollArea>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, requests.length)} of {requests.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1, totalPages)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum, totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum + 1}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1, totalPages)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Identity & RTW Verification Requests
          </h2>
          <p className="text-muted-foreground">Review candidate document submissions</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({allRequests?.filter(r => r.status === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
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
              {renderVerificationTypeTab(identityRequests, 'identity')}
            </TabsContent>

            <TabsContent value="rtw" className="space-y-4 mt-4">
              {renderVerificationTypeTab(rtwRequests, 'rtw')}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

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

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={(open) => {
        setShowApprovalDialog(open);
        if (!open) {
          setSelectedRequest(null);
          setApprovalComment("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification Request</DialogTitle>
            <DialogDescription>
              Approve {selectedRequest?.profiles?.full_name}'s {selectedRequest?.verification_type} verification. You can optionally add a comment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approval-comment">Comment (Optional)</Label>
              <Textarea
                id="approval-comment"
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="e.g., Documents verified, all information matches..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowApprovalDialog(false);
              setSelectedRequest(null);
              setApprovalComment("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedRequest && handleApprove(selectedRequest)}
              disabled={processing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={!!selectedRequest && !showApprovalDialog} onOpenChange={(open) => {
        if (!open) setSelectedRequest(null);
      }}>
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
    </div>
  );
}
