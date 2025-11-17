import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ProfileBadgeDisplayProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfileBadgeDisplay({ userId, size = 'md' }: ProfileBadgeDisplayProps) {
  const { data: profileBadge } = useQuery({
    queryKey: ['profile-badge-display', userId],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_badge_id')
        .eq('id', userId)
        .single();

      if (!profile?.selected_badge_id) return null;

      const { data: badge } = await supabase
        .from('badge_types')
        .select('*')
        .eq('id', profile.selected_badge_id)
        .single();

      return badge;
    },
  });

  if (!profileBadge) return null;

  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          stroke: '#fbbf24',
          glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]',
          bg: 'from-yellow-500/20 to-orange-500/20'
        };
      case 'epic':
        return {
          stroke: '#a855f7',
          glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
          bg: 'from-purple-500/20 to-pink-500/20'
        };
      case 'rare':
        return {
          stroke: '#3b82f6',
          glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
          bg: 'from-blue-500/20 to-cyan-500/20'
        };
      default:
        return {
          stroke: '#6b7280',
          glow: 'drop-shadow-[0_0_4px_rgba(107,114,128,0.4)]',
          bg: 'from-gray-500/20 to-gray-600/20'
        };
    }
  };

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9'
  };

  const styles = getRarityStyles(profileBadge.rarity);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative ${sizeClasses[size]} cursor-help group`}>
            <svg
              viewBox="0 0 100 100"
              className={`absolute inset-0 w-full h-full ${styles.glow} transition-all duration-300 group-hover:scale-110`}
            >
              <polygon
                points="50,5 90,25 90,75 50,95 10,75 10,25"
                fill="url(#hexGradient)"
                stroke={styles.stroke}
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={styles.stroke} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={styles.stroke} stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className={`${iconSizes[size]} text-white z-10`} style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{profileBadge.name}</p>
            <p className="text-sm text-muted-foreground">{profileBadge.description}</p>
            <Badge variant="secondary" className="text-xs capitalize">
              {profileBadge.rarity}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize ml-2">
              {profileBadge.category}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}