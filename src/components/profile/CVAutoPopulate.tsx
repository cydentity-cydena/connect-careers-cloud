import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link, Upload, Loader2 } from 'lucide-react';

interface CVDetails {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  title: string;
  professionalStatement: string;
  yearsExperience?: number | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  securityClearance?: string | null;
  workModePreference?: string | null;
  willingToRelocate?: boolean | null;
  skills: string[];
  certifications: Array<{
    name: string;
    issuer?: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
    credentialId?: string | null;
  }>;
  workHistory: Array<{
    company: string;
    title: string;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    gpa?: string | null;
  }>;
}

interface CVAutoPopulateProps {
  onPopulate: (details: CVDetails) => void;
}

export const CVAutoPopulate = ({ onPopulate }: CVAutoPopulateProps) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlExtract = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      const { data: extractedData, error } = await supabase.functions.invoke('extract-cv-details', {
        body: { url, source: 'url' }
      });

      if (error) throw error;

      if (extractedData?.success && extractedData?.data) {
        onPopulate(extractedData.data);
        toast.success('CV details extracted and ready to populate!');
        setUrl('');
      } else {
        throw new Error(extractedData?.error || 'Failed to extract CV details');
      }
    } catch (error) {
      console.error('Error extracting from URL:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract CV details from URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileExtract = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();

      const { data: extractedData, error } = await supabase.functions.invoke('extract-cv-details', {
        body: { content: text, source: 'file' }
      });

      if (error) throw error;

      if (extractedData?.success && extractedData?.data) {
        onPopulate(extractedData.data);
        toast.success('CV details extracted and ready to populate!');
        setFile(null);
      } else {
        throw new Error(extractedData?.error || 'Failed to extract CV details');
      }
    } catch (error) {
      console.error('Error extracting from file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract CV details from file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Populate from CV/Resume</CardTitle>
        <CardDescription>
          Extract your profile information from a CV/resume URL or upload your document
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv-file">CV/Resume Document</Label>
              <div className="flex gap-2">
                <Input
                  id="cv-file"
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleFileExtract} 
                  disabled={isLoading || !file}
                  className="whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="ml-2">Extract</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: TXT, PDF, DOC, DOCX
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv-url">CV/Resume URL</Label>
              <div className="flex gap-2">
                <Input
                  id="cv-url"
                  type="url"
                  placeholder="https://example.com/my-resume.pdf"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleUrlExtract} 
                  disabled={isLoading || !url.trim()}
                  className="whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                  <span className="ml-2">Extract</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
