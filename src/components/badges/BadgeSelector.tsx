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
    queryKey: ['user-badges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user badges:', error);
        return [];
      }
      
      return data || [];
    },
  });

  if (userBadgesError) {
    console.error('User badges query error:', userBadgesError);
  }

  // Fetch all available badges
  const { data: allBadges, error: allBadgesError, isLoading: allBadgesLoading } = useQuery({
    queryKey: ['badge-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badge_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) {
        console.error('Error fetching badge types:', error);
        return [];
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
        return null;
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

    // Certification-based badges
    if (criteria.type === 'certification' && Array.isArray(criteria.certifications)) {
      return `Verify any of: ${criteria.certifications.join(', ')}`;
    }

    // Level-based badges
    const levelMin = criteria.level_min ?? criteria.level;
    if (criteria.type === 'level' && levelMin) {
      return `Reach Level ${levelMin}`;
    }

    // Platform integrations (e.g., TryHackMe, HackTheBox)
    if (criteria.type === 'platform' && criteria.platform) {
      return `Connect and sync ${criteria.platform} account`;
    }

    // HR Ready verification badge
    if (criteria.type === 'hr_ready') {
      return 'Complete identity, right-to-work, and logistics verification';
    }

    return badge.description || 'Complete specific achievements to unlock';
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]';
      case 'epic':
        return 'drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]';
      case 'rare':
        return 'drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]';
      case 'uncommon':
        return 'drop-shadow-[0_0_15px_rgba(34,197,94,0.7)]';
      default:
        return 'drop-shadow-[0_0_10px_rgba(148,163,184,0.5)]';
    }
  };

  const getRarityStrokeColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return '#fbbf24';
      case 'epic':
        return '#a855f7';
      case 'rare':
        return '#3b82f6';
      case 'uncommon':
        return '#22c55e';
      default:
        return '#94a3b8';
    }
  };

  const getRarityBgGradient = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'from-yellow-500/10 via-orange-500/10 to-amber-500/10';
      case 'epic':
        return 'from-purple-500/10 via-pink-500/10 to-fuchsia-500/10';
      case 'rare':
        return 'from-blue-500/10 via-cyan-500/10 to-sky-500/10';
      case 'uncommon':
        return 'from-green-500/10 via-emerald-500/10 to-teal-500/10';
      default:
        return 'from-slate-500/10 via-gray-500/10 to-zinc-500/10';
    }
  };

  return (
    <Card 
      className={`relative transition-all duration-300 group overflow-hidden bg-gradient-to-br ${getRarityBgGradient(badge.rarity)} ${
        isUnlocked 
          ? `hover:scale-105 cursor-pointer ${getRarityBorder(badge.rarity)} ${isSelected ? 'ring-2 ring-primary shadow-[0_0_30px_rgba(79,209,197,0.6)]' : ''}`
          : 'opacity-50'
      }`}
    >
      {/* Animated shine effect */}
      {isUnlocked && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            style={{ transform: 'skewX(-20deg)' }}
          />
        </div>
      )}
      
      {/* Animated background pulse */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityBgGradient(badge.rarity)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Corner accents */}
      {isUnlocked && (
        <>
          <div className="absolute top-0 left-0 w-8 h-8 opacity-50">
            <div className="absolute top-2 left-2 w-1 h-4 bg-gradient-to-b" style={{ 
              backgroundImage: `linear-gradient(to bottom, ${getRarityStrokeColor(badge.rarity)}, transparent)` 
            }} />
            <div className="absolute top-2 left-2 w-4 h-1 bg-gradient-to-r" style={{ 
              backgroundImage: `linear-gradient(to right, ${getRarityStrokeColor(badge.rarity)}, transparent)` 
            }} />
          </div>
          <div className="absolute top-0 right-0 w-8 h-8 opacity-50">
            <div className="absolute top-2 right-2 w-1 h-4 bg-gradient-to-b" style={{ 
              backgroundImage: `linear-gradient(to bottom, ${getRarityStrokeColor(badge.rarity)}, transparent)` 
            }} />
            <div className="absolute top-2 right-2 w-4 h-1 bg-gradient-to-l" style={{ 
              backgroundImage: `linear-gradient(to left, ${getRarityStrokeColor(badge.rarity)}, transparent)` 
            }} />
          </div>
        </>
      )}
      
      <CardContent className="p-4 relative">
        {!isUnlocked && (
          <div className="absolute top-2 right-2 z-10">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 z-10">
            <Check className="h-4 w-4 text-primary drop-shadow-[0_0_10px_rgba(79,209,197,1)]" />
          </div>
        )}
        
        <div className="space-y-3">
          {/* Hexagonal badge with multiple layers */}
          <div className="relative w-24 h-24 mx-auto">
            {/* Outer glow ring */}
            {isUnlocked && (
              <svg viewBox="0 0 100 100" className={`w-full h-full absolute inset-0 ${getRarityGlow(badge.rarity)} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
                <polygon 
                  points="50 2, 93 26, 93 74, 50 98, 7 74, 7 26" 
                  fill="none"
                  stroke={getRarityStrokeColor(badge.rarity)}
                  strokeWidth="1"
                  className="animate-pulse"
                />
              </svg>
            )}
            
            {/* Middle hexagon layer with gradient */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
              <defs>
                <linearGradient id={`grad-outer-${badge.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={getRarityStrokeColor(badge.rarity)} stopOpacity="0.5" />
                  <stop offset="50%" stopColor={getRarityStrokeColor(badge.rarity)} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={getRarityStrokeColor(badge.rarity)} stopOpacity="0.5" />
                </linearGradient>
                <radialGradient id={`rad-${badge.id}`}>
                  <stop offset="0%" stopColor={getRarityStrokeColor(badge.rarity)} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={getRarityStrokeColor(badge.rarity)} stopOpacity="0" />
                </radialGradient>
              </defs>
              
              {/* Background glow circle */}
              <circle cx="50" cy="50" r="45" fill={`url(#rad-${badge.id})`} />
              
              {/* Main hexagon border */}
              <polygon 
                points="50 5, 90 27.5, 90 72.5, 50 95, 10 72.5, 10 27.5" 
                fill="none"
                stroke={`url(#grad-outer-${badge.id})`}
                strokeWidth="3"
                className={isUnlocked ? 'group-hover:animate-pulse' : ''}
              />
            </svg>
            
            {/* Inner hexagon with complex gradient */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
              <defs>
                <linearGradient id={`gradient-${badge.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={getRarityStrokeColor(badge.rarity)} stopOpacity="0.4" />
                  <stop offset="50%" stopColor={getRarityStrokeColor(badge.rarity)} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={getRarityStrokeColor(badge.rarity)} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <polygon 
                points="50 12, 82 30, 82 70, 50 88, 18 70, 18 30" 
                fill={`url(#gradient-${badge.id})`}
                className="group-hover:opacity-80 transition-opacity"
              />
              
              {/* Inner border */}
              <polygon 
                points="50 12, 82 30, 82 70, 50 88, 18 70, 18 30" 
                fill="none"
                stroke={getRarityStrokeColor(badge.rarity)}
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>
            
            {/* Center icon with glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`relative ${isUnlocked ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                {isUnlocked && (
                  <div className="absolute inset-0 blur-xl opacity-50" style={{
                    background: getRarityStrokeColor(badge.rarity)
                  }} />
                )}
                <Award 
                  className={`h-10 w-10 relative z-10 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}
                  style={isUnlocked ? {
                    filter: `drop-shadow(0 0 8px ${getRarityStrokeColor(badge.rarity)})`
                  } : {}}
                />
              </div>
            </div>
            
            {/* Rotating particle effects */}
            {isUnlocked && (
              <>
                <div className="absolute top-[15%] left-[15%] w-1 h-1 rounded-full animate-pulse" style={{
                  background: getRarityStrokeColor(badge.rarity),
                  boxShadow: `0 0 8px ${getRarityStrokeColor(badge.rarity)}`
                }} />
                <div className="absolute top-[15%] right-[15%] w-1 h-1 rounded-full animate-pulse delay-100" style={{
                  background: getRarityStrokeColor(badge.rarity),
                  boxShadow: `0 0 8px ${getRarityStrokeColor(badge.rarity)}`
                }} />
                <div className="absolute bottom-[20%] left-1/2 w-1 h-1 rounded-full animate-pulse delay-200" style={{
                  background: getRarityStrokeColor(badge.rarity),
                  boxShadow: `0 0 8px ${getRarityStrokeColor(badge.rarity)}`
                }} />
              </>
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="font-semibold text-sm">{badge.name}</p>
            <Badge 
              variant="outline" 
              className="text-xs capitalize border-0 font-medium"
              style={{
                background: `linear-gradient(135deg, ${getRarityStrokeColor(badge.rarity)}40, ${getRarityStrokeColor(badge.rarity)}20)`,
                color: getRarityStrokeColor(badge.rarity),
                boxShadow: `0 0 10px ${getRarityStrokeColor(badge.rarity)}20`
              }}
            >
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