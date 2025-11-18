import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface XPGain {
  id: string;
  amount: number;
  type: string;
  timestamp: number;
}

export const XPNotification = () => {
  const [xpGains, setXpGains] = useState<XPGain[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Subscribe to community activities for real-time XP notifications
      const channel = supabase
        .channel('xp-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'community_activities',
            filter: `user_id=eq.${user.id}`,
          },
        (payload) => {
          const activity = payload.new;
          if (activity.points_awarded > 0) {
            const newGain: XPGain = {
              id: activity.id,
              amount: activity.points_awarded,
              type: activity.activity_type,
              timestamp: Date.now(),
            };
            
            setXpGains(prev => [...prev, newGain]);
            
            // Show toast for achievement unlocks
            if (activity.activity_type === 'achievement_earned') {
              toast({
                title: '🏆 Achievement Unlocked!',
                description: `You earned: ${activity.metadata?.achievement_name || 'New Achievement'}`,
                duration: 5000,
              });
            }
            
            // Remove after animation
            setTimeout(() => {
              setXpGains(prev => prev.filter(g => g.id !== newGain.id));
            }, 3000);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [toast]);

  const getXPIcon = (type: string) => {
    if (type.includes('achievement')) return Trophy;
    if (type.includes('post')) return Star;
    return Sparkles;
  };

  const getXPMessage = (type: string, amount: number) => {
    const messages: Record<string, string> = {
      post_created: `+${amount} XP for creating a post!`,
      comment_created: `+${amount} XP for commenting!`,
      reaction_added: `+${amount} XP for reacting!`,
      popular_post: `+${amount} XP! Your post is popular!`,
      viral_post: `+${amount} XP! Your post went viral!`,
      achievement_earned: `+${amount} XP from achievement!`,
    };
    return messages[type] || `+${amount} XP earned!`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {xpGains.map((gain) => {
          const Icon = getXPIcon(gain.type);
          return (
            <motion.div
              key={gain.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[200px]"
            >
              <Icon className="w-5 h-5 animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {getXPMessage(gain.type, gain.amount)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
