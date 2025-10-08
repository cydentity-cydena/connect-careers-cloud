import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const EMOJIS = ['👍', '❤️', '😊', '🎉', '🚀'];

type Reaction = {
  id: string;
  emoji: string;
  user_id: string;
};

type ReactionCount = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

export const CommentReactions = ({ commentId }: { commentId: string }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    loadReactions();

    const channel = supabase
      .channel(`comment-reactions-${commentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_reactions',
          filter: `comment_id=eq.${commentId}`
        },
        () => {
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [commentId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', commentId);

    if (error) {
      console.error('Error loading reactions:', error);
      return;
    }

    setReactions(data || []);
  };

  const getReactionCounts = (): ReactionCount[] => {
    const counts = EMOJIS.map(emoji => ({
      emoji,
      count: reactions.filter(r => r.emoji === emoji).length,
      userReacted: reactions.some(r => r.emoji === emoji && r.user_id === currentUserId)
    }));
    return counts.filter(c => c.count > 0);
  };

  const toggleReaction = async (emoji: string) => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to react to comments",
        variant: "destructive"
      });
      return;
    }

    const existingReaction = reactions.find(
      r => r.emoji === emoji && r.user_id === currentUserId
    );

    if (existingReaction) {
      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (error) {
        console.error('Error removing reaction:', error);
        toast({
          title: "Error",
          description: "Failed to remove reaction",
          variant: "destructive"
        });
      }
    } else {
      const { error } = await supabase
        .from('comment_reactions')
        .insert({
          comment_id: commentId,
          user_id: currentUserId,
          emoji
        });

      if (error) {
        console.error('Error adding reaction:', error);
        toast({
          title: "Error",
          description: "Failed to add reaction",
          variant: "destructive"
        });
      }
    }
  };

  const reactionCounts = getReactionCounts();

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {EMOJIS.map(emoji => {
        const reactionData = reactionCounts.find(r => r.emoji === emoji);
        const count = reactionData?.count || 0;
        const userReacted = reactionData?.userReacted || false;

        return (
          <Button
            key={emoji}
            variant={userReacted ? "default" : "outline"}
            size="sm"
            onClick={() => toggleReaction(emoji)}
            className={`h-7 px-2 text-xs ${
              userReacted 
                ? 'bg-primary/20 hover:bg-primary/30 border-primary' 
                : 'hover:bg-accent'
            }`}
          >
            <span className="text-sm">{emoji}</span>
            {count > 0 && (
              <span className="ml-1 text-xs font-medium">{count}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
};
