import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Certification name is required');
      return;
    }

    setLoading(true);

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

    setLoading(false);

    if (error) {
      toast.error('Failed to update certification');
      console.error(error);
    } else {
      toast.success('Certification updated');
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Certification</DialogTitle>
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
            <Label htmlFor="edit-url">Credly Badge URL</Label>
            <Input 
              id="edit-url" 
              value={credentialUrl} 
              onChange={(e) => setCredentialUrl(e.target.value)} 
              placeholder="https://www.credly.com/badges/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cid">Credential ID</Label>
            <Input 
              id="edit-cid" 
              value={credentialId} 
              onChange={(e) => setCredentialId(e.target.value)} 
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

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
