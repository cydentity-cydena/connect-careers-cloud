import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link, Upload, Loader2 } from 'lucide-react';

interface JobDetails {
  title: string;
  description: string;
  location?: string | null;
  jobType: 'full-time' | 'part-time' | 'contract' | 'freelance';
  remoteAllowed: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  requiredClearance?: string | null;
  requiredSkills: string;
  requiredCerts: string;
  mustHaves: string;
  niceToHaves: string;
  yearsExpMin?: number | null;
  yearsExpMax?: number | null;
  companyName?: string | null;
}

interface JobAutoPopulateProps {
  onPopulate: (details: JobDetails) => void;
}

export const JobAutoPopulate = ({ onPopulate }: JobAutoPopulateProps) => {
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
      // Extract job details using AI
      const { data: extractedData, error } = await supabase.functions.invoke('extract-job-details', {
        body: { url, source: 'url' }
      });

      if (error) throw error;

      if (extractedData?.success && extractedData?.data) {
        onPopulate(extractedData.data);
        toast.success('Job details extracted and populated!');
        setUrl('');
      } else {
        throw new Error(extractedData?.error || 'Failed to extract job details');
      }
    } catch (error) {
      console.error('Error extracting from URL:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract job details from URL');
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
      // Read file content
      const text = await file.text();

      // Extract job details using AI
      const { data: extractedData, error } = await supabase.functions.invoke('extract-job-details', {
        body: { content: text, source: 'file' }
      });

      if (error) throw error;

      if (extractedData?.success && extractedData?.data) {
        onPopulate(extractedData.data);
        toast.success('Job details extracted and populated!');
        setFile(null);
      } else {
        throw new Error(extractedData?.error || 'Failed to extract job details');
      }
    } catch (error) {
      console.error('Error extracting from file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract job details from file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Populate Job Details</CardTitle>
        <CardDescription>
          Extract job details from a URL or upload a job specification document
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="file">From File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-url">Job Posting URL</Label>
              <div className="flex gap-2">
                <Input
                  id="job-url"
                  type="url"
                  placeholder="https://example.com/job-posting"
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
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-file">Job Specification Document</Label>
              <div className="flex gap-2">
                <Input
                  id="job-file"
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
        </Tabs>
      </CardContent>
    </Card>
  );
};
