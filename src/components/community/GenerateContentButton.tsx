import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const GenerateContentButton = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-content', {
        body: { topic: topic.trim() || undefined }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Content generated!",
          description: `"${data.title}" has been posted to the community feed`
        });
        setOpen(false);
        setTopic('');
      } else {
        throw new Error(data?.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate AI Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generate Community Content</DialogTitle>
          <DialogDescription>
            Enter a specific topic or leave blank for general cybersecurity content
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="topic">
              Topic (Optional)
            </Label>
            <Textarea
              id="topic"
              placeholder="e.g., Today's Cloudflare outage, Recent ransomware attacks, CVE-2024-XXXX vulnerability..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generating...' : 'Generate Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};