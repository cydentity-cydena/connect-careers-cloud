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

export const PostReactions = ({ postId }: { postId: string }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    loadReactions();

    const channel = supabase
      .channel(`post-reactions-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_reactions',
          filter: `post_id=eq.${postId}`
        },
        () => loadReactions()
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

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('emoji, user_id')
      .eq('post_id', postId);

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
        description: "Please login to react to posts",
        variant: "destructive"
      });
      return;
    }

    const reaction = reactions.find(r => r.emoji === emoji);
    if (!reaction) return;

    if (reaction.hasReacted) {
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
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
      const { error } = await supabase
        .from('post_reactions')
        .insert({ post_id: postId, user_id: currentUserId, emoji });

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
    <div className="flex gap-1 mt-2 flex-wrap">
      {reactions.map(({ emoji, count, hasReacted }) => (
        <Button
          key={emoji}
          variant={hasReacted ? "default" : "outline"}
          size="sm"
          onClick={() => toggleReaction(emoji)}
          className={`h-8 px-2 gap-1 ${hasReacted ? 'bg-primary/20 hover:bg-primary/30' : ''}`}
        >
          <span className="text-base">{emoji}</span>
          {count > 0 && <span className="text-xs">{count}</span>}
        </Button>
      ))}
    </div>
  );
};
