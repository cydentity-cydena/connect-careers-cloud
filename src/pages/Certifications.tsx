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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const handleAdd = async () => {
    if (!userId) return;
    if (!name) { toast.error('Certification name is required'); return; }
    setLoading(true);
    
    const { error } = await supabase.from('certifications').insert({
      candidate_id: userId,
      name,
      issuer,
      credential_url: credentialUrl,
      credential_id: credentialId,
    });
    
    if (error) { 
      setLoading(false);
      toast.error(error.message); 
      return; 
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
        toast.success(`✅ Certification added — +${data.amount} points! (Pending verification)`);
      } else {
        toast.success('Certification added (points will be awarded after verification)');
      }
    } catch (e) {
      toast.success('Certification added');
    }
    
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Add Certification | Cydena" description="Add a new certification to your profile." />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Certification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., CompTIA Security+" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issuer">Issuer</Label>
            <Input id="issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="e.g., CompTIA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cid">Credential ID</Label>
            <Input id="cid" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="curl">Credential URL</Label>
            <Input id="curl" value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={loading}>{loading ? 'Saving...' : 'Add certification'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Certifications;
