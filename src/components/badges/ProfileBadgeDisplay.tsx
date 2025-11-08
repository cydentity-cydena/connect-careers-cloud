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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getRarityColor(profileBadge.rarity)} flex items-center justify-center shadow-lg cursor-help`}
          >
            <Award className={`${iconSizes[size]} text-white`} />
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