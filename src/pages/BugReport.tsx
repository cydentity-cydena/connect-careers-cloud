import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bug, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function BugReport() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bugType: '',
    url: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Please describe the bug');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-bug-report', {
        body: formData
      });

      if (error) throw error;

      toast.success('Bug report submitted successfully! Thank you for helping us improve.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        bugType: '',
        url: '',
        description: ''
      });
    } catch (error: any) {
      console.error('Error submitting bug report:', error);
      toast.error('Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <SEO 
        title="Report a Bug - Cydena"
        description="Help us improve Cydena by reporting bugs, broken links, or issues you encounter on our platform."
      />
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Bug className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Report a Bug</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Found a broken link, course issue, or something not working right? Let us know and we'll fix it!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bug Report Form</CardTitle>
              <CardDescription>
                Please provide as much detail as possible to help us resolve the issue quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bugType">Type of Issue</Label>
                  <Select value={formData.bugType} onValueChange={(value) => handleChange('bugType', value)}>
                    <SelectTrigger id="bugType">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broken-link">Broken Link</SelectItem>
                      <SelectItem value="course-issue">Course/Training Issue</SelectItem>
                      <SelectItem value="certification-issue">Certification Issue</SelectItem>
                      <SelectItem value="profile-bug">Profile Bug</SelectItem>
                      <SelectItem value="job-posting">Job Posting Issue</SelectItem>
                      <SelectItem value="ui-ux">UI/UX Problem</SelectItem>
                      <SelectItem value="performance">Performance Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Page URL (Optional)</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://cydena.com/page-with-issue"
                    value={formData.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If applicable, paste the URL where you encountered the issue
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe the issue in detail. What were you trying to do? What happened instead?"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Be as specific as possible - include steps to reproduce if applicable
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Bug Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Thank you for helping us improve Cydena! We review all bug reports.</p>
          </div>
        </div>
      </div>
    </>
  );
}
