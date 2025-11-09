import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const EMOJIS = ['👍', '❤️', '😊', '🎉', '🚀'];

type Reaction = {
  emoji: string;
  count: number;
  hasReacted: boolean;
};

export const CommentReactions = ({ commentId }: { commentId: string }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const isValidUuid = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

  useEffect(() => {
    if (!isValidUuid(commentId)) return; // Skip for optimistic temp IDs

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
        () => loadReactions()
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
    if (!isValidUuid(commentId)) return;
    const { data, error } = await supabase
      .from('comment_reactions')
      .select('emoji, user_id')
      .eq('comment_id', commentId);

    if (error) {
      console.error('Error loading reactions:', error);
      return;
    }

    const reactionMap = EMOJIS.map(emoji => {
      const emojiReactions = data?.filter(r => r.emoji === emoji) || [];
      return {
        emoji,
        count: emojiReactions.length,
        hasReacted: emojiReactions.some(r => r.user_id === currentUserId)
      };
    });

    setReactions(reactionMap);
  };

  const toggleReaction = async (emoji: string) => {
    if (!currentUserId) {
      toast({
        title: "Login required",
        description: "Please login to react to comments",
        variant: "destructive"
      });
      return;
    }

    const reaction = reactions.find(r => r.emoji === emoji);
    if (!reaction) return;

    if (reaction.hasReacted) {
      if (!isValidUuid(commentId)) return; // Do nothing for temp comments
      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', currentUserId)
        .eq('emoji', emoji);

      if (error) {
        console.error('Error removing reaction:', error);
        toast({
          title: "Error",
          description: "Failed to remove reaction",
          variant: "destructive"
        });
      }
    } else {
      if (!isValidUuid(commentId)) return; // Do nothing for temp comments
      const { error } = await supabase
        .from('comment_reactions')
        .insert({ comment_id: commentId, user_id: currentUserId, emoji });

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

  return (
    <div className="flex gap-1 mt-1 flex-wrap">
      {reactions.map(({ emoji, count, hasReacted }) => (
        <Button
          key={emoji}
          variant={hasReacted ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleReaction(emoji)}
          className={`h-7 px-2 gap-1 text-xs ${hasReacted ? 'bg-primary/20 hover:bg-primary/30' : ''}`}
        >
          <span className="text-sm">{emoji}</span>
          {count > 0 && <span className="text-xs">{count}</span>}
        </Button>
      ))}
    </div>
  );
};
