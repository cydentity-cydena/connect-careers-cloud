import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const GenerateContentButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateContent = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate content",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-daily-content', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Content generated!",
          description: data.title || "New post created successfully"
        });
      } else {
        throw new Error(data?.error || "Failed to generate content");
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
    <Button
      onClick={generateContent}
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      <Sparkles className="h-4 w-4" />
      {loading ? 'Generating...' : 'Generate AI Content'}
    </Button>
  );
};