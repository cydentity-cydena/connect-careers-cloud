import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

export const CreatePostDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activityType, setActivityType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !activityType) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to post",
          variant: "destructive",
        });
        return;
      }

      // Moderate content before posting
      const contentToModerate = `${title}\n${description}`;
      const { data: moderationResult, error: moderationError } = await supabase.functions.invoke('moderate-content', {
        body: { content: contentToModerate }
      });

      if (moderationError) {
        console.error('Moderation error:', moderationError);
        // Continue with posting if moderation service fails
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
        .insert({
          user_id: user.id,
          activity_type: activityType,
          title,
          description: description || null,
          is_public: true,
          metadata: {}
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your post has been shared with the community",
      });

      setOpen(false);
      setTitle('');
      setDescription('');
      setActivityType('');
      
      window.location.reload();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Share Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity-type">Activity Type *</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id="activity-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certification">Earned Certification</SelectItem>
                <SelectItem value="achievement">Achievement Unlocked</SelectItem>
                <SelectItem value="skill">New Skill Learned</SelectItem>
                <SelectItem value="project">Project Completed</SelectItem>
                <SelectItem value="milestone">Career Milestone</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                {isAdmin && (
                  <>
                    <SelectItem value="release">Version Release</SelectItem>
                    <SelectItem value="bug_fix">Bug Fix</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Title *</Label>
              <span className={`text-xs ${title.length > 180 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {title.length}/200
              </span>
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Completed CISSP Certification"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description (Optional)</Label>
              <span className={`text-xs ${description.length > (isAdmin ? 2700 : 900) ? 'text-destructive' : 'text-muted-foreground'}`}>
                {description.length}/{isAdmin ? 3000 : 1000}
              </span>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAdmin ? "Share detailed information about this update or announcement..." : "Share more details about your achievement..."}
              rows={isAdmin ? 8 : 4}
              maxLength={isAdmin ? 3000 : 1000}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Share'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
