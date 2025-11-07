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
  candidate_id: string;
  name: string;
  issuer: string;
  credential_id: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  verification_status: string;
  proof_document_urls: string[];
  source: string;
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

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // 1) Load manual certifications without joins (avoid FK/view issues)
      const { data: certs, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('source', 'manual')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = (certs as any[]) || [];

      // 2) Enrich with profile data in a separate query if available
      const candidateIds = Array.from(new Set(items.map((c) => c.candidate_id).filter(Boolean)));
      if (candidateIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username, email')
          .in('id', candidateIds);

        if (!profilesError && profilesData) {
          const profilesById = Object.fromEntries(profilesData.map((p: any) => [p.id, p]));
          const enriched = items.map((c: any) => ({
            ...c,
            profiles: profilesById[c.candidate_id] ?? null,
          }));
          setRequests(enriched);
        } else {
          setRequests(items as any);
        }
      } else {
        setRequests(items as any);
      }
    } catch (err) {
      console.error('Failed to load certifications', err);
      toast.error('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (certId: string, candidateId: string) => {
    const { error: updateCertError } = await supabase
      .from('certifications')
      .update({ verification_status: 'verified' })
      .eq('id', certId);

    if (updateCertError) {
      toast.error('Failed to verify certification');
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
    loadRequests();
  };

  const handleReject = async (certId: string) => {
    const reason = rejectionReasons[certId];
    if (!reason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const { error } = await supabase
      .from('certifications')
      .update({ verification_status: 'rejected' })
      .eq('id', certId);

    if (error) {
      toast.error('Failed to reject certification');
      return;
    }

    toast.success('Certification rejected');
    loadRequests();
  };

  const getDocumentUrl = (path: string) => {
    const { data } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredRequests = requests.filter(r => (r.verification_status ?? 'pending') === activeTab);

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
            Pending ({requests.filter(r => (r.verification_status ?? 'pending') === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
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
                          {request.name}
                        </h3>
                        <Badge variant={request.verification_status === 'pending' ? 'secondary' : request.verification_status === 'verified' ? 'default' : 'destructive'}>
                          {request.verification_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Issuer: {request.issuer}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Submitted {new Date(request.created_at).toLocaleDateString()}
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

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {request.credential_id && (
                      <div>
                        <span className="text-muted-foreground">Credential ID:</span>{' '}
                        <span className="font-mono text-xs">{request.credential_id}</span>
                      </div>
                    )}
                    {request.issue_date && (
                      <div>
                        <span className="text-muted-foreground">Issued:</span>{' '}
                        {new Date(request.issue_date).toLocaleDateString()}
                      </div>
                    )}
                    {request.expiry_date && (
                      <div>
                        <span className="text-muted-foreground">Expires:</span>{' '}
                        {new Date(request.expiry_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {request.proof_document_urls && Array.isArray(request.proof_document_urls) && request.proof_document_urls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Proof Documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {request.proof_document_urls.map((url: string, idx: number) => (
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

                  {request.verification_status === 'pending' && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="p-3 bg-amber-500/10 rounded text-sm">
                        <p className="font-medium mb-1">⚠️ Manual Review Required</p>
                        <p className="text-muted-foreground text-xs">
                          This certification couldn't be auto-verified via Credly or issuer API. Please verify the credential ID and check the issuer's website.
                        </p>
                      </div>
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
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
