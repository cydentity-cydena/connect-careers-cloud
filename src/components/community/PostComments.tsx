import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
};

const commentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Comment cannot be empty" })
    .max(500, { message: "Comment must be less than 500 characters" })
});

export const PostComments = ({ postId }: { postId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    loadCommentCount();
    
    if (showComments) {
      loadComments();
    }
  }, [showComments, postId]);

  useEffect(() => {
    // Always subscribe to new comments for real-time updates
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('New comment received:', payload);
          loadCommentCount();
          // Always reload comments if section is open
          loadComments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          console.log('Comment deleted');
          loadCommentCount();
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadCommentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      setCommentCount(count || 0);
    } catch (error) {
      console.error('Error loading comment count:', error);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          profiles!post_comments_user_id_fkey (
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as any || []);
      setCommentCount(data?.length || 0);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = commentSchema.parse({ content: newComment });
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to comment",
          variant: "destructive"
        });
        return;
      }

      // Moderate comment content before posting
      const { data: moderationResult, error: moderationError } = await supabase.functions.invoke('moderate-content', {
        body: { content: validated.content }
      });

      if (moderationError) {
        console.error('Moderation error:', moderationError);
        // Continue with posting if moderation service fails
      } else if (moderationResult && !moderationResult.appropriate) {
        toast({
          title: "Comment not allowed",
          description: moderationResult.reason || "Your comment contains inappropriate content. Please revise and try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Get current user profile for optimistic update
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url, full_name')
        .eq('id', user.id)
        .single();

      // Ensure comments section is open
      if (!showComments) {
        setShowComments(true);
      }

      // Optimistic update - add comment immediately to UI
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        post_id: postId,
        user_id: user.id,
        content: validated.content,
        created_at: new Date().toISOString(),
        profiles: profile || { username: 'You', avatar_url: null, full_name: null }
      };

      setComments(prev => [...prev, optimisticComment]);
      setCommentCount(prev => prev + 1);
      setNewComment('');

      // Insert to database - real-time subscription will update with actual data
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: validated.content
        });

      if (error) {
        // Remove optimistic comment on error
        setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
        setCommentCount(prev => prev - 1);
        throw error;
      }

      toast({
        title: "Comment posted",
        description: "Your comment has been added"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        console.error('Error posting comment:', error);
        toast({
          title: "Error",
          description: "Failed to post comment",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed"
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4" />
        {commentCount > 0 ? `${commentCount} ${commentCount === 1 ? 'Comment' : 'Comments'}` : 'Comment'}
      </Button>

      {showComments && (
        <div className="mt-3 space-y-3">
          {/* Comments list */}
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 text-sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-xs">
                      @{comment.profiles?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm break-words">{comment.content}</p>
                </div>
                {currentUserId === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    className="mt-1 h-6 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* New comment form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-[60px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${newComment.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {newComment.length}/500
                </span>
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={loading || !newComment.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};