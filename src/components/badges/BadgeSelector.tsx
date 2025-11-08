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
  unlock_criteria: any;
}

interface UserBadge {
  badge_id: string;
  unlocked_at: string;
}

export function BadgeSelector() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user's unlocked badges
  const { data: userBadges, error: userBadgesError, isLoading: userBadgesLoading } = useQuery({
    queryKey: ['user-badges', open],
    enabled: open,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user badges:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  if (userBadgesError) {
    console.error('User badges query error:', userBadgesError);
  }

  // Fetch all available badges
  const { data: allBadges, error: allBadgesError, isLoading: allBadgesLoading } = useQuery({
    queryKey: ['badge-types', open],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badge_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) {
        console.error('Error fetching badge types:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  if (allBadgesError) {
    console.error('Badge types query error:', allBadgesError);
  }

  // Fetch current profile
  const { data: profile, error: profileError, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-badge'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('selected_badge_id, selected_avatar_frame')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    },
  });

  if (profileError) {
    console.error('Profile query error:', profileError);
  }

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

  const isLoading = userBadgesLoading || allBadgesLoading || profileLoading;
  const hasError = userBadgesError || allBadgesError || profileError;

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

        <div className="p-4 bg-muted/50 border rounded">
          <p>Debug Info:</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Has Error: {hasError ? 'Yes' : 'No'}</p>
          <p>All Badges Count: {allBadges?.length ?? 'undefined'}</p>
          <p>User Badges Count: {userBadges?.length ?? 'undefined'}</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading your badges...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load badges. Please try again.</p>
            {userBadgesError && <p className="text-xs mt-2">{String(userBadgesError)}</p>}
            {allBadgesError && <p className="text-xs mt-2">{String(allBadgesError)}</p>}
            {profileError && <p className="text-xs mt-2">{String(profileError)}</p>}
          </div>
        )}

        {!isLoading && !hasError && (
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
        )}
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
  const getUnlockHint = () => {
    if (!badge.unlock_criteria) return badge.description;
    
    const criteria = badge.unlock_criteria as any;
    
    if (criteria.certification) {
      return `Verify ${criteria.certification} certification`;
    }
    if (criteria.level) {
      return `Reach Level ${criteria.level}`;
    }
    if (criteria.certifications?.includes) {
      return `Verify any certification from: ${criteria.certifications.includes.join(', ')}`;
    }
    if (criteria.platform_integration) {
      return `Connect and sync ${criteria.platform_integration} account`;
    }
    
    return badge.description || 'Complete specific achievements to unlock';
  };

  return (
    <Card 
      className={`relative transition-all ${
        isUnlocked 
          ? `hover:scale-105 cursor-pointer ${getRarityBorder(badge.rarity)} ${isSelected ? 'ring-2 ring-primary' : ''}`
          : 'opacity-60'
      }`}
    >
      <CardContent className="p-4">
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
        <div className="space-y-3">
          <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center mx-auto ${!isUnlocked ? 'opacity-40' : ''}`}>
            <Award className="h-8 w-8 text-white" />
          </div>
          <div className="text-center space-y-2">
            <p className="font-semibold text-sm">{badge.name}</p>
            <Badge variant="secondary" className="text-xs capitalize">
              {badge.rarity}
            </Badge>
            {badge.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                {badge.description}
              </p>
            )}
            {!isUnlocked && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs font-medium text-primary flex items-center gap-1 justify-center">
                  <Lock className="h-3 w-3" />
                  How to unlock
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getUnlockHint()}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}