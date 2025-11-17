import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ExternalLink, Shield, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditCertificationDialog } from './EditCertificationDialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  credential_url: string | null;
  credential_id: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  verification_status: string;
  created_at: string;
}

export const CertificationManager = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCert, setEditCert] = useState<Certification | null>(null);

  const loadCertifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load certifications');
      console.error(error);
    } else {
      setCertifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast.error('Failed to delete certification');
      console.error(error);
    } else {
      toast.success('Certification deleted');
      setCertifications(prev => prev.filter(c => c.id !== deleteId));
    }
    setDeleteId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><Shield className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading certifications...</div>;
  }

  if (certifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No certifications yet</p>
          <Button onClick={() => window.location.href = '/certifications'}>
            Add Your First Certification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-4 pr-4">
          {certifications.map((cert) => (
          <Card key={cert.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{cert.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{cert.issuer}</p>
                </div>
                {getStatusBadge(cert.verification_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {cert.credential_id && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Credential ID:</span> {cert.credential_id}
                </div>
              )}
              
              <div className="flex gap-4 text-sm">
                {cert.issue_date && (
                  <div>
                    <span className="text-muted-foreground">Issued:</span> {new Date(cert.issue_date).toLocaleDateString()}
                  </div>
                )}
                {cert.expiry_date && (
                  <div>
                    <span className="text-muted-foreground">Expires:</span> {new Date(cert.expiry_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {cert.credential_url && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(cert.credential_url!, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Badge
                  </Button>
                )}
                
                {cert.verification_status === 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditCert(cert)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(cert.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>

              {cert.verification_status === 'verified' && (
                <p className="text-xs text-muted-foreground italic">
                  ✓ Verified certifications cannot be edited to maintain integrity
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        </div>
      </ScrollArea>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this certification from your profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editCert && (
        <EditCertificationDialog
          certification={editCert}
          open={!!editCert}
          onOpenChange={(open) => !open && setEditCert(null)}
          onSuccess={() => {
            loadCertifications();
            setEditCert(null);
          }}
        />
      )}
    </>
  );
};
