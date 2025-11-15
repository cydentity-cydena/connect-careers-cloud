import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, ExternalLink, FileText, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CertVerificationRequest {
  id: string;
  candidate_id: string;
  name: string;
  issuer: string;
  credential_id: string | null;
  credential_url: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  verification_status: string;
  proof_document_urls: string[];
  source: string;
  signed_webhook: boolean | null;
  created_at: string;
  profiles?: {
    id?: string;
    full_name?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;
}

export function CertificationVerificationReview() {
  const [requests, setRequests] = useState<CertVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    setCurrentPage(0); // Reset to first page when changing tabs or page size
  }, [activeTab, pageSize]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('certifications-review-list');
      if (error) throw error;
      const items = (data?.items as any[]) || [];
      setRequests(items);
    } catch (err) {
      console.error('Failed to load certifications', err);
      toast.error(`Failed to load certifications`);
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (certId: string, candidateId: string) => {
    try {
      const { error: updateCertError } = await supabase
        .from('certifications')
        .update({ verification_status: 'verified' })
        .eq('id', certId);

      if (updateCertError) {
        console.error('Failed to verify certification:', updateCertError);
        toast.error(`Failed to verify certification: ${updateCertError.message}`);
        return;
      }

      // Trigger recalculation of HR-Ready status via edge function
      try {
        await supabase.functions.invoke(`hrready-upsert/${candidateId}`, {
          body: {}
        });
      } catch (e) {
        console.error('Failed to update HR-Ready status:', e);
      }

      toast.success('Certification approved!');
      
      // Small delay to ensure database transaction is committed
      setTimeout(() => {
        loadRequests();
      }, 500);
    } catch (error) {
      console.error('Error approving certification:', error);
      toast.error('Failed to approve certification');
    }
  };

  const handleReject = async (certId: string) => {
    const reason = rejectionReasons[certId];
    if (!reason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const { error } = await supabase
        .from('certifications')
        .update({ 
          verification_status: 'rejected',
          // You could store the rejection reason if there's a column for it
        })
        .eq('id', certId);

      if (error) {
        console.error('Failed to reject certification:', error);
        toast.error(`Failed to reject certification: ${error.message}`);
        return;
      }

      toast.success('Certification rejected');
      
      // Small delay to ensure database transaction is committed
      setTimeout(() => {
        loadRequests();
      }, 500);
    } catch (error) {
      console.error('Error rejecting certification:', error);
      toast.error('Failed to reject certification');
    }
  };

  const getDocumentUrl = (path: string) => {
    const { data } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const getVerificationUrl = (issuer: string, credentialId: string | null) => {
    if (!credentialId) return null;
    
    const issuerLower = issuer.toLowerCase();
    
    // Map common issuers to their verification URLs
    if (issuerLower.includes('credly')) {
      return `https://www.credly.com/badges/${credentialId}`;
    } else if (issuerLower.includes('microsoft')) {
      return `https://learn.microsoft.com/api/credentials/share/${credentialId}`;
    } else if (issuerLower.includes('linkedin')) {
      return `https://www.linkedin.com/learning/certificates/${credentialId}`;
    } else if (issuerLower.includes('coursera')) {
      return `https://www.coursera.org/verify/${credentialId}`;
    } else if (issuerLower.includes('comptia')) {
      return `https://www.certmetrics.com/comptia/public/verification.aspx?code=${credentialId}`;
    } else if (issuerLower.includes('cisco')) {
      return `https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/verify.html`;
    } else if (issuerLower.includes('(isc)²') || issuerLower.includes('isc2')) {
      return `https://www.isc2.org/MemberVerification`;
    } else if (issuerLower.includes('offensive security') || issuerLower.includes('offsec')) {
      return `https://www.offensive-security.com/offsec/certification-verification/`;
    }
    
    // Return null if no known verification URL
    return null;
  };

  const filteredRequests = requests.filter(r => (r.verification_status ?? 'pending') === activeTab);
  
  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };

  if (loading) {
    return <div className="text-center py-8">Loading verification requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Certification Verification Requests</h2>
        <p className="text-muted-foreground">Review and approve/reject manual certification submissions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({requests.filter(r => (r.verification_status ?? 'pending') === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
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
          {filteredRequests.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No {activeTab} requests
            </Card>
          ) : (
            <>
              <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                <div className="space-y-4">
                  {paginatedRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold">
                          {request.name}
                        </h3>
                        <Badge variant={request.verification_status === 'pending' ? 'secondary' : request.verification_status === 'verified' ? 'default' : 'destructive'}>
                          {request.verification_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Vendor:</span>
                        <span className="text-sm bg-secondary px-2 py-1 rounded">{request.issuer}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Issued: {request.issue_date ? new Date(request.issue_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    {request.profiles?.full_name ? (
                      <>
                        <span className="font-medium">{request.profiles.full_name}</span>
                        {request.profiles?.username && (
                          <span className="text-muted-foreground">@{request.profiles.username}</span>
                        )}
                        {request.profiles?.email && (
                          <span className="text-muted-foreground">({request.profiles.email})</span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Candidate: {request.candidate_id}</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Credential URL Section - Show for Credly and other sources with URLs */}
                    {request.credential_url && (
                      <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold">Badge URL:</p>
                          {request.source === 'credly' && (
                            <Badge className="bg-primary">Credly Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground break-all">
                              {request.credential_url}
                            </p>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            asChild
                            className="gap-2 shrink-0"
                          >
                            <a
                              href={request.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Badge
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Credential ID Section */}
                    <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                      <p className="text-sm font-semibold mb-2">Credential ID:</p>
                      {request.credential_id ? (
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="font-mono text-sm font-medium bg-background px-3 py-2 rounded border">
                              {request.credential_id}
                            </p>
                          </div>
                          {!request.credential_url && getVerificationUrl(request.issuer, request.credential_id) && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="gap-2"
                            >
                              <a
                                href={getVerificationUrl(request.issuer, request.credential_id)!}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Verify with {request.issuer}
                              </a>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No credential ID provided</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {request.expiry_date && (
                        <div>
                          <span className="text-muted-foreground">Expires:</span>{' '}
                          <span className="font-medium">{new Date(request.expiry_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>{' '}
                        <span className="font-medium">{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Proof Documents Section */}
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Proof Documents:
                    </p>
                    {request.proof_document_urls && Array.isArray(request.proof_document_urls) && request.proof_document_urls.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {request.proof_document_urls.map((url: string, idx: number) => {
                          const fileName = url.split('/').pop() || `Document ${idx + 1}`;
                          return (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              asChild
                              className="gap-2"
                            >
                              <a
                                href={getDocumentUrl(url)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText className="h-4 w-4" />
                                {fileName}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No documents uploaded</p>
                    )}
                  </div>

                  {request.verification_status === 'pending' && (
                    <div className="space-y-3 pt-4 border-t">
                      {request.credential_url && request.source === 'credly' ? (
                        <div className="p-3 bg-green-500/10 rounded text-sm border border-green-500/30">
                          <p className="font-medium mb-1">✓ Credly Badge Detected</p>
                          <p className="text-muted-foreground text-xs">
                            This certification has a valid Credly badge URL. Click "View Badge" above to verify on Credly's website, then approve below.
                          </p>
                        </div>
                      ) : request.credential_url ? (
                        <div className="p-3 bg-blue-500/10 rounded text-sm border border-blue-500/30">
                          <p className="font-medium mb-1">🔗 Badge URL Provided</p>
                          <p className="text-muted-foreground text-xs">
                            This certification includes a badge URL. Click "View Badge" above to verify, then approve below.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-500/10 rounded text-sm">
                          <p className="font-medium mb-1">⚠️ Manual Review Required</p>
                          <p className="text-muted-foreground text-xs">
                            This certification couldn't be auto-verified via Credly or issuer API. Please verify the credential ID and check the issuer's website.
                          </p>
                        </div>
                      )}
                      <Textarea
                        placeholder="Rejection reason (required if rejecting)"
                        value={rejectionReasons[request.id] || ''}
                        onChange={(e) => setRejectionReasons(prev => ({
                          ...prev,
                          [request.id]: e.target.value
                        }))}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request.id, request.candidate_id)}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve & Verify
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                          className="gap-2"
                          disabled={!rejectionReasons[request.id]}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
                </div>
              </ScrollArea>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
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
                            onClick={() => handlePageChange(pageNum)}
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
