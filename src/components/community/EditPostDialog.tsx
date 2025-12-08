import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Activity = {
  id: string;
  title: string;
  description: string | null;
};

type EditPostDialogProps = {
  activity: Activity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export const EditPostDialog = ({ activity, open, onOpenChange, onSuccess }: EditPostDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description || '');
  const { toast } = useToast();

  // Update state when activity changes
  useEffect(() => {
    setTitle(activity.title);
    setDescription(activity.description || '');
  }, [activity.id, activity.title, activity.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: "Missing title",
        description: "Please provide a title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check admin status for moderation
      let userIsAdmin = false;
      if (user) {
        const { data: adminCheck } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        userIsAdmin = !!adminCheck;
      }

      // Moderate content before updating (admins allowed to post links)
      const contentToModerate = `${title}\n${description}`;
      const { data: moderationResult, error: moderationError } = await supabase.functions.invoke('moderate-content', {
        body: { content: contentToModerate, isAdmin: userIsAdmin }
      });

      if (moderationError) {
        console.error('Moderation error:', moderationError);
      } else if (moderationResult && !moderationResult.appropriate) {
        toast({
          title: "Content not allowed",
          description: moderationResult.reason || "Your post contains inappropriate content for our professional community. Please revise and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('activity_feed')
        .update({
          title,
          description: description || null,
        })
        .eq('id', activity.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your post has been updated",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your update?"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
