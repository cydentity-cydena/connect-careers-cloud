import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: string;
  rarity: string;
}

interface UserBadge {
  badge_id: string;
  unlocked_at: string;
}

export function BadgeSelector() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user's unlocked badges
  const { data: userBadges } = useQuery({
    queryKey: ['user-badges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at')
        .eq('user_id', user.id);
      
      return data || [];
    },
  });

  // Fetch all available badges
  const { data: allBadges } = useQuery({
    queryKey: ['badge-types'],
    queryFn: async () => {
      const { data } = await supabase
        .from('badge_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      return data || [];
    },
  });

  // Fetch current profile
  const { data: profile } = useQuery({
    queryKey: ['profile-badge'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('selected_badge_id, selected_avatar_frame')
        .eq('id', user.id)
        .single();
      
      return data;
    },
  });

  const selectBadgeMutation = useMutation({
    mutationFn: async (badgeId: string | null) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ selected_badge_id: badgeId })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-badge'] });
      toast.success('Badge updated successfully!');
      setOpen(false);
    },
    onError: () => {
      toast.error('Failed to update badge');
    },
  });

  const unlockedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];
  const unlockedBadges = allBadges?.filter(b => unlockedBadgeIds.includes(b.id)) || [];
  const lockedBadges = allBadges?.filter(b => !unlockedBadgeIds.includes(b.id)) || [];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500/50 shadow-lg shadow-yellow-500/20';
      case 'epic': return 'border-purple-500/50 shadow-lg shadow-purple-500/20';
      case 'rare': return 'border-blue-500/50 shadow-lg shadow-blue-500/20';
      default: return 'border-border';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Award className="h-4 w-4 mr-2" />
          Manage Badges
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Your Achievement Badges
          </DialogTitle>
          <DialogDescription>
            Select a badge to display on your profile. Badges are unlocked by earning certifications, reaching levels, and completing achievements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Currently Selected */}
          {profile?.selected_badge_id && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Currently Displayed</h3>
              <div className="flex items-center justify-between">
                {allBadges?.find(b => b.id === profile.selected_badge_id) && (
                  <BadgeCard
                    badge={allBadges.find(b => b.id === profile.selected_badge_id)!}
                    isSelected={true}
                    isUnlocked={true}
                    getRarityColor={getRarityColor}
                    getRarityBorder={getRarityBorder}
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectBadgeMutation.mutate(null)}
                >
                  Remove Badge
                </Button>
              </div>
            </div>
          )}

          {/* Unlocked Badges */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Unlocked Badges ({unlockedBadges.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {unlockedBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => selectBadgeMutation.mutate(badge.id)}
                  className="text-left"
                  disabled={selectBadgeMutation.isPending}
                >
                  <BadgeCard
                    badge={badge}
                    isSelected={profile?.selected_badge_id === badge.id}
                    isUnlocked={true}
                    getRarityColor={getRarityColor}
                    getRarityBorder={getRarityBorder}
                  />
                </button>
              ))}
            </div>
            {unlockedBadges.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No badges unlocked yet. Verify certifications and level up to unlock badges!
              </p>
            )}
          </div>

          {/* Locked Badges */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Locked Badges ({lockedBadges.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {lockedBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isSelected={false}
                  isUnlocked={false}
                  getRarityColor={getRarityColor}
                  getRarityBorder={getRarityBorder}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BadgeCard({ 
  badge, 
  isSelected, 
  isUnlocked,
  getRarityColor,
  getRarityBorder
}: { 
  badge: BadgeType;
  isSelected: boolean;
  isUnlocked: boolean;
  getRarityColor: (rarity: string) => string;
  getRarityBorder: (rarity: string) => string;
}) {
  return (
    <Card 
      className={`relative transition-all ${
        isUnlocked 
          ? `hover:scale-105 cursor-pointer ${getRarityBorder(badge.rarity)} ${isSelected ? 'ring-2 ring-primary' : ''}`
          : 'opacity-50 grayscale'
      }`}
    >
      <CardContent className="p-3">
        {!isUnlocked && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <Check className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="space-y-2">
          <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center mx-auto`}>
            <Award className="h-6 w-6 text-white" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-sm line-clamp-1">{badge.name}</p>
            <Badge variant="secondary" className="text-xs capitalize">
              {badge.rarity}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}