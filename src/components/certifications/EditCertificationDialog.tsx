import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  credential_url: string | null;
  credential_id: string | null;
  issue_date: string | null;
  expiry_date: string | null;
}

interface EditCertificationDialogProps {
  certification: Certification;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditCertificationDialog = ({ 
  certification, 
  open, 
  onOpenChange,
  onSuccess 
}: EditCertificationDialogProps) => {
  const [name, setName] = useState(certification.name);
  const [issuer, setIssuer] = useState(certification.issuer);
  const [credentialUrl, setCredentialUrl] = useState(certification.credential_url || '');
  const [credentialId, setCredentialId] = useState(certification.credential_id || '');
  const [issueDate, setIssueDate] = useState(certification.issue_date || '');
  const [expiryDate, setExpiryDate] = useState(certification.expiry_date || '');
  const [proofFiles, setProofFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const hasCredlyLink = credentialUrl.trim().length > 0 && credentialUrl.toLowerCase().includes('credly.com');
  const hasCredentialId = credentialId.trim().length > 0;
  const hasNewProofDocs = proofFiles && proofFiles.length > 0;
  const hasEvidence = hasCredlyLink || hasCredentialId || hasNewProofDocs;

  const uploadProofDocuments = async () => {
    if (!proofFiles || proofFiles.length === 0) return [];
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const uploadedUrls: string[] = [];
    for (const file of Array.from(proofFiles)) {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/certifications/${certification.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
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

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Certification name is required');
      return;
    }

    // Validate evidence requirement
    if (!hasEvidence) {
      toast.error('You must provide at least one form of evidence: Credly badge URL, Credential ID, or proof documents');
      return;
    }

    setLoading(true);

    try {
      // Upload any new proof documents
      const documentUrls = await uploadProofDocuments();

      const { error } = await supabase
        .from('certifications')
        .update({
          name,
          issuer,
          credential_url: credentialUrl || null,
          credential_id: credentialId || null,
          issue_date: issueDate || null,
          expiry_date: expiryDate || null,
        })
        .eq('id', certification.id);

      if (error) throw error;

      // If new proof documents were uploaded, update the verification request
      if (documentUrls.length > 0) {
        const { data: existingRequest } = await supabase
          .from('certification_verification_requests')
          .select('id, document_urls')
          .eq('certification_id', certification.id)
          .single();

        if (existingRequest) {
          const existingUrls = (existingRequest.document_urls as string[]) || [];
          await supabase
            .from('certification_verification_requests')
            .update({
              document_urls: [...existingUrls, ...documentUrls],
              status: 'pending',
            })
            .eq('id', existingRequest.id);
        }
      }

      toast.success('Certification updated');
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to update certification');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Certification</DialogTitle>
          <DialogDescription>
            Update your certification details. At least one form of evidence is required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input 
              id="edit-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., CompTIA Security+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-issuer">Issuer</Label>
            <Input 
              id="edit-issuer" 
              value={issuer} 
              onChange={(e) => setIssuer(e.target.value)} 
              placeholder="e.g., CompTIA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-url">
              Credly Badge URL {!hasCredentialId && !hasNewProofDocs && <span className="text-destructive">*</span>}
            </Label>
            <Input 
              id="edit-url" 
              value={credentialUrl} 
              onChange={(e) => setCredentialUrl(e.target.value)} 
              placeholder="https://www.credly.com/badges/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cid">
              Credential ID {!hasCredlyLink && !hasNewProofDocs && <span className="text-destructive">*</span>}
            </Label>
            <Input 
              id="edit-cid" 
              value={credentialId} 
              onChange={(e) => setCredentialId(e.target.value)} 
              placeholder="Your certification credential ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-issue">Issue Date</Label>
              <Input 
                id="edit-issue" 
                type="date" 
                value={issueDate} 
                onChange={(e) => setIssueDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiry">Expiry Date</Label>
              <Input 
                id="edit-expiry" 
                type="date" 
                value={expiryDate} 
                onChange={(e) => setExpiryDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-proof">
              Upload Proof Documents {!hasCredlyLink && !hasCredentialId && <span className="text-destructive">*</span>}
            </Label>
            <Input 
              id="edit-proof" 
              type="file" 
              multiple 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setProofFiles(e.target.files)} 
            />
            <p className="text-xs text-muted-foreground">
              Upload certificate screenshot, badge image, or verification email
            </p>
          </div>

          {!hasEvidence && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>You must provide at least one: Credly URL, Credential ID, or proof documents</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !hasEvidence}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
