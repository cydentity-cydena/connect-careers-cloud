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
          glow: 'drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
          innerGlow: 'rgba(251,191,36,0.15)',
          iconColor: 'text-yellow-400'
        };
      case 'epic':
        return {
          stroke: '#a855f7',
          glow: 'drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
          innerGlow: 'rgba(168,85,247,0.15)',
          iconColor: 'text-purple-400'
        };
      case 'rare':
        return {
          stroke: '#3b82f6',
          glow: 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
          innerGlow: 'rgba(59,130,246,0.15)',
          iconColor: 'text-blue-400'
        };
      default:
        return {
          stroke: '#6b7280',
          glow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
          innerGlow: 'rgba(107,114,128,0.15)',
          iconColor: 'text-gray-400'
        };
    }
  };

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const styles = getRarityStyles(profileBadge.rarity);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative ${sizeClasses[size]} cursor-help group`}>
            {/* Background circle for better contrast */}
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-full border border-border" />
            
            {/* Hexagon badge */}
            <svg
              viewBox="0 0 100 100"
              className={`absolute inset-0 w-full h-full ${styles.glow} transition-all duration-300 group-hover:scale-105`}
            >
              <defs>
                <linearGradient id={`hexGradient-${userId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={styles.stroke} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={styles.stroke} stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <polygon
                points="50,8 88,28 88,72 50,92 12,72 12,28"
                fill={`url(#hexGradient-${userId})`}
                stroke={styles.stroke}
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
            </svg>
            
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Award 
                className={`${iconSizes[size]} ${styles.iconColor} z-10 drop-shadow-[0_0_3px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover:scale-110`}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{profileBadge.name}</p>
            <p className="text-sm text-muted-foreground">{profileBadge.description}</p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {profileBadge.rarity}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {profileBadge.category}
              </Badge>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}