import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const CompanyCreate = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const handleCreate = async () => {
    if (!userId) return;
    if (!name) { toast.error('Company name is required'); return; }

    setLoading(true);
    const { error } = await supabase.from('companies').insert({
      created_by: userId,
      name,
      description,
      website,
      location,
      industry,
      size,
      logo_url: logoUrl,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Company profile created');
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Create Company Profile | Cydent" description="Create your company profile to start posting jobs." />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Cybersecurity" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="10-50 employees" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Tell candidates about your company, culture, and mission..." 
              rows={5}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Company Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyCreate;
