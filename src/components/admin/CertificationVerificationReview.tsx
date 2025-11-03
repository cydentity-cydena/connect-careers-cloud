import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, ExternalLink, FileText, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CertVerificationRequest {
  id: string;
  certification_id: string;
  candidate_id: string;
  status: string;
  document_urls: any;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  certifications: {
    name: string;
    issuer: string;
    credential_id: string | null;
    issue_date: string | null;
    expiry_date: string | null;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

export function CertificationVerificationReview() {
  const [requests, setRequests] = useState<CertVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('certification_verification_requests')
      .select(`
        *,
        certifications (name, issuer, credential_id, issue_date, expiry_date)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load verification requests');
      console.error(error);
      setLoading(false);
      return;
    }

    // Fetch profile data separately
    const requestsWithProfiles = await Promise.all(
      (data || []).map(async (request) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', request.candidate_id)
          .single();

        return {
          ...request,
          profiles: profile || { full_name: 'Unknown', email: 'unknown@example.com' }
        };
      })
    );

    setRequests(requestsWithProfiles as any);
    setLoading(false);
  };

  const handleApprove = async (requestId: string, certId: string) => {
    const { error: updateCertError } = await supabase
      .from('certifications')
      .update({ verification_status: 'verified' })
      .eq('id', certId);

    if (updateCertError) {
      toast.error('Failed to verify certification');
      return;
    }

    const { error: updateRequestError } = await supabase
      .from('certification_verification_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', requestId);

    if (updateRequestError) {
      toast.error('Failed to update request status');
      return;
    }

    toast.success('Certification approved!');
    loadRequests();
  };

  const handleReject = async (requestId: string, certId: string) => {
    const reason = rejectionReasons[requestId];
    if (!reason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const { error: updateRequestError } = await supabase
      .from('certification_verification_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', requestId);

    if (updateRequestError) {
      toast.error('Failed to reject request');
      return;
    }

    // Optionally delete the certification or mark it as rejected
    await supabase
      .from('certifications')
      .update({ verification_status: 'rejected' })
      .eq('id', certId);

    toast.success('Certification rejected');
    loadRequests();
  };

  const getDocumentUrl = (path: string) => {
    const { data } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredRequests = requests.filter(r => r.status === activeTab);

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
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({requests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredRequests.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No {activeTab} requests
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {request.certifications.name}
                        </h3>
                        <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Issuer: {request.certifications.issuer}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Submitted {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{request.profiles.full_name}</span>
                    <span className="text-muted-foreground">({request.profiles.email})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {request.certifications.credential_id && (
                      <div>
                        <span className="text-muted-foreground">Credential ID:</span>{' '}
                        <span className="font-mono">{request.certifications.credential_id}</span>
                      </div>
                    )}
                    {request.certifications.issue_date && (
                      <div>
                        <span className="text-muted-foreground">Issued:</span>{' '}
                        {new Date(request.certifications.issue_date).toLocaleDateString()}
                      </div>
                    )}
                    {request.certifications.expiry_date && (
                      <div>
                        <span className="text-muted-foreground">Expires:</span>{' '}
                        {new Date(request.certifications.expiry_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {request.document_urls && Array.isArray(request.document_urls) && request.document_urls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Proof Documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {request.document_urls.map((url: string, idx: number) => (
                          <a
                            key={idx}
                            href={getDocumentUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            Document {idx + 1}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {request.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Notes:</span> {request.notes}
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="p-3 bg-destructive/10 rounded text-sm">
                      <span className="font-medium">Rejection Reason:</span> {request.rejection_reason}
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="space-y-3 pt-4 border-t">
                      <Textarea
                        placeholder="Rejection reason (optional, only needed if rejecting)"
                        value={rejectionReasons[request.id] || ''}
                        onChange={(e) => setRejectionReasons(prev => ({
                          ...prev,
                          [request.id]: e.target.value
                        }))}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request.id, request.certification_id)}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(request.id, request.certification_id)}
                          className="gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
