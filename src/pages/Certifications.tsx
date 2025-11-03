import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const Certifications = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [proofFiles, setProofFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const uploadProofDocuments = async (certId: string) => {
    if (!proofFiles || proofFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    for (const file of Array.from(proofFiles)) {
      const ext = file.name.split('.').pop();
      const filePath = `${userId}/certifications/${certId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file, { upsert: true });
      
      if (error) {
        console.error('Upload error:', error);
        continue;
      }
      uploadedUrls.push(filePath);
    }
    return uploadedUrls;
  };

  const handleAdd = async () => {
    if (!userId) return;
    if (!name) { toast.error('Certification name is required'); return; }
    if (!proofFiles || proofFiles.length === 0) {
      toast.error('Please upload proof documents (certificate, badge screenshot, etc.)');
      return;
    }
    setLoading(true);
    
    // Insert certification with 'pending' status by default
    const { data: certData, error } = await supabase.from('certifications').insert({
      candidate_id: userId,
      name,
      issuer,
      credential_url: credentialUrl,
      credential_id: credentialId,
      issue_date: issueDate || null,
      expiry_date: expiryDate || null,
      verification_status: 'pending',
      source: 'manual',
    }).select().single();
    
    if (error || !certData) { 
      setLoading(false);
      toast.error(error?.message || 'Failed to add certification'); 
      return; 
    }

    // Upload proof documents
    const documentUrls = await uploadProofDocuments(certData.id);
    
    // Create verification request
    const { error: verificationError } = await supabase
      .from('certification_verification_requests')
      .insert({
        certification_id: certData.id,
        candidate_id: userId,
        document_urls: documentUrls,
        status: 'pending',
      });

    if (verificationError) {
      console.error('Verification request error:', verificationError);
      toast.warning('Certification added but verification request failed');
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    // Trigger AI verification in the background
    try {
      const { data: verificationRequestData } = await supabase
        .from('certification_verification_requests')
        .select('id')
        .eq('certification_id', certData.id)
        .single();

      if (verificationRequestData) {
        // Call AI verification function (non-blocking)
        supabase.functions.invoke('verify-certification-ai', {
          body: { verificationRequestId: verificationRequestData.id }
        }).then(({ data: aiData, error: aiError }) => {
          if (aiError) {
            console.error('AI verification error:', aiError);
          } else if (aiData?.autoApproved) {
            toast.success('🎉 Certification auto-verified by AI!');
          }
        });
      }
    } catch (e) {
      console.error('Failed to trigger AI verification:', e);
    }

    // Award points for manual certification
    try {
      const { data, error: pointsError } = await supabase.functions.invoke('award-points-helper', {
        body: {
          candidateId: userId,
          code: 'CERT_MANUAL_PENDING',
          meta: { name, issuer }
        }
      });

      if (!pointsError && data?.success) {
        toast.success(`✅ Certification submitted for verification! Staff will review within 48 hours.`);
      } else {
        toast.success('Certification submitted for verification');
      }
    } catch (e) {
      toast.success('Certification submitted for verification');
    }
    
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Add Certification | Cydena" description="Add a new certification to your profile." />
      
      {/* Credly Import Banner */}
      <div className="max-w-2xl mx-auto mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg">
        <div className="flex items-start gap-4">
          <img 
            src="/logos/credly-logo.png" 
            alt="Credly" 
            className="h-8 w-auto mt-1"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Got Credly Badges?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Most cybersecurity certifications are on Credly! Just paste your badge URL below and we'll import all the details automatically.
            </p>
            <p className="text-xs text-muted-foreground">
              Works with: CompTIA, ISC², Cisco, AWS, Microsoft, and 1000+ other issuers
            </p>
          </div>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Certification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Credly Import */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
            <Label htmlFor="credlyUrl" className="text-base font-semibold">
              🎖️ Quick Import from Credly
            </Label>
            <Input 
              id="credlyUrl" 
              value={credentialUrl} 
              onChange={(e) => {
                setCredentialUrl(e.target.value);
                // Auto-detect if it's a Credly URL and suggest it
                if (e.target.value.includes('credly.com')) {
                  setIssuer('Credly Badge');
                }
              }}
              placeholder="https://www.credly.com/badges/..." 
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Paste your Credly badge URL here. We'll extract the details automatically!
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or add manually
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., CompTIA Security+" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issuer">Issuer</Label>
            <Input id="issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="e.g., CompTIA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cid">Credential ID (Optional)</Label>
            <Input id="cid" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date (Optional)</Label>
              <Input id="issueDate" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="proofDocs">Proof Documents (Required)</Label>
            <Input 
              id="proofDocs" 
              type="file" 
              multiple 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setProofFiles(e.target.files)} 
            />
            <p className="text-xs text-muted-foreground">
              Upload certificate, badge screenshot, or verification email. Staff will review within 48 hours.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button onClick={handleAdd} disabled={loading}>{loading ? 'Saving...' : 'Add certification'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Certifications;
