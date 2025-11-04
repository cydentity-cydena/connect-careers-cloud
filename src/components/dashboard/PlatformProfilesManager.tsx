import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, CheckCircle2, ExternalLink, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface PlatformProfilesManagerProps {
  userId: string;
}

interface PlatformStats {
  thmLevel?: number;
  thmPoints?: number;
  thmBadges?: number;
  htbRankText?: string;
  htbPoints?: number;
  htbUserOwns?: number;
}

export const PlatformProfilesManager = ({ userId }: PlatformProfilesManagerProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editStatsMode, setEditStatsMode] = useState(false);
  const [thmUsername, setThmUsername] = useState("");
  const [htbUsername, setHtbUsername] = useState("");
  const [stats, setStats] = useState<PlatformStats>({});
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch current profile data
  const { data: profileData, refetch } = useQuery({
    queryKey: ['platform-profiles', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('tryhackme_username, hackthebox_username, tryhackme_rank, hackthebox_rank, tryhackme_level, tryhackme_points, tryhackme_badges, hackthebox_points, hackthebox_rank_text, hackthebox_user_owns')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profileData) {
      setThmUsername(profileData.tryhackme_username || "");
      setHtbUsername(profileData.hackthebox_username || "");
      setStats({
        thmLevel: profileData.tryhackme_level || undefined,
        thmPoints: profileData.tryhackme_points || undefined,
        thmBadges: profileData.tryhackme_badges || undefined,
        htbRankText: profileData.hackthebox_rank_text || undefined,
        htbPoints: profileData.hackthebox_points || undefined,
        htbUserOwns: profileData.hackthebox_user_owns || undefined,
      });
    }
  }, [profileData]);

  const syncPlatformStats = async (platform: 'tryhackme' | 'hackthebox', username: string) => {
    if (!username) return;

    setSyncing(platform);
    try {
      const { error } = await supabase.functions.invoke('sync-platform-stats', {
        body: { platform, username, userId }
      });

      if (error) throw error;

      toast({
        title: "Stats synced",
        description: `${platform === 'tryhackme' ? 'TryHackMe' : 'HackTheBox'} stats updated successfully`,
      });

      refetch();
    } catch (error) {
      console.error('Error syncing stats:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync platform stats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          tryhackme_username: thmUsername || null,
          hackthebox_username: htbUsername || null,
        })
        .eq('id', userId);

      if (error) throw error;

      // Sync stats after saving usernames
      if (thmUsername) await syncPlatformStats('tryhackme', thmUsername);
      if (htbUsername) await syncPlatformStats('hackthebox', htbUsername);

      toast({
        title: "Profiles updated",
        description: "Your platform profiles have been saved and synced.",
      });
      
      setEditMode(false);
      refetch();
    } catch (error) {
      console.error('Error updating profiles:', error);
      toast({
        title: "Update failed",
        description: "Failed to update platform profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStats = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          tryhackme_level: stats.thmLevel || null,
          tryhackme_points: stats.thmPoints || null,
          tryhackme_badges: stats.thmBadges || null,
          hackthebox_rank_text: stats.htbRankText || null,
          hackthebox_points: stats.htbPoints || null,
          hackthebox_user_owns: stats.htbUserOwns || null,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Stats updated",
        description: "Your platform stats have been updated.",
      });
      
      setEditStatsMode(false);
      refetch();
    } catch (error) {
      console.error('Error updating stats:', error);
      toast({
        title: "Update failed",
        description: "Failed to update platform stats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (editMode || (!profileData?.tryhackme_username && !profileData?.hackthebox_username)) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="thm">TryHackMe Username</Label>
          <Input
            id="thm"
            value={thmUsername}
            onChange={(e) => setThmUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="htb">HackTheBox Username</Label>
          <Input
            id="htb"
            value={htbUsername}
            onChange={(e) => setHtbUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          {(profileData?.tryhackme_username || profileData?.hackthebox_username) && (
            <Button variant="outline" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (editStatsMode) {
    return (
      <div className="space-y-4">
        {profileData?.tryhackme_username && (
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-semibold">TryHackMe Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="thm-level">Level</Label>
                <Input
                  id="thm-level"
                  type="number"
                  value={stats.thmLevel || ""}
                  onChange={(e) => setStats({ ...stats, thmLevel: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Level"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thm-points">Points</Label>
                <Input
                  id="thm-points"
                  type="number"
                  value={stats.thmPoints || ""}
                  onChange={(e) => setStats({ ...stats, thmPoints: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Points"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thm-badges">Badges</Label>
                <Input
                  id="thm-badges"
                  type="number"
                  value={stats.thmBadges || ""}
                  onChange={(e) => setStats({ ...stats, thmBadges: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Badges"
                />
              </div>
            </div>
          </div>
        )}
        
        {profileData?.hackthebox_username && (
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-semibold">HackTheBox Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="htb-rank">Rank</Label>
                <Input
                  id="htb-rank"
                  value={stats.htbRankText || ""}
                  onChange={(e) => setStats({ ...stats, htbRankText: e.target.value })}
                  placeholder="e.g., Hacker"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="htb-points">Points</Label>
                <Input
                  id="htb-points"
                  type="number"
                  value={stats.htbPoints || ""}
                  onChange={(e) => setStats({ ...stats, htbPoints: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Points"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="htb-owns">User Owns</Label>
                <Input
                  id="htb-owns"
                  type="number"
                  value={stats.htbUserOwns || ""}
                  onChange={(e) => setStats({ ...stats, htbUserOwns: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="User Owns"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button onClick={handleSaveStats} disabled={saving}>
            {saving ? "Saving..." : "Save Stats"}
          </Button>
          <Button variant="outline" onClick={() => setEditStatsMode(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {profileData?.tryhackme_username && (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3 flex-1">
            <Trophy className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">TryHackMe</p>
                {profileData?.tryhackme_rank && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              <p className="text-sm text-muted-foreground">@{profileData.tryhackme_username}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {profileData?.tryhackme_rank === 'Connected' || (!profileData?.tryhackme_level && !profileData?.tryhackme_points && !profileData?.tryhackme_badges) ? (
                  <Badge variant="outline" className="text-xs">
                    Connected
                  </Badge>
                ) : (
                  <>
                    {profileData?.tryhackme_level && (
                      <Badge variant="secondary" className="text-xs">
                        Level {profileData.tryhackme_level}
                      </Badge>
                    )}
                    {profileData?.tryhackme_points !== null && profileData?.tryhackme_points !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {profileData.tryhackme_points.toLocaleString()} pts
                      </Badge>
                    )}
                    {profileData?.tryhackme_badges !== null && profileData?.tryhackme_badges !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {profileData.tryhackme_badges} badges
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={`https://tryhackme.com/p/${profileData.tryhackme_username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => syncPlatformStats('tryhackme', profileData.tryhackme_username!)}
              disabled={syncing === 'tryhackme'}
            >
              <RefreshCw className={`h-4 w-4 ${syncing === 'tryhackme' ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      )}
      
      {profileData?.hackthebox_username && (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3 flex-1">
            <Trophy className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">HackTheBox</p>
                {profileData?.hackthebox_rank && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              <p className="text-sm text-muted-foreground">@{profileData.hackthebox_username}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {profileData?.hackthebox_rank_text && profileData.hackthebox_rank_text !== 'Connected' && (
                  <Badge variant="secondary" className="text-xs">
                    {profileData.hackthebox_rank_text}
                  </Badge>
                )}
                {profileData?.hackthebox_points !== null && profileData?.hackthebox_points !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {profileData.hackthebox_points.toLocaleString()} pts
                  </Badge>
                )}
                {profileData?.hackthebox_user_owns !== null && profileData?.hackthebox_user_owns !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {profileData.hackthebox_user_owns} owns
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={`https://app.hackthebox.com/profile/${profileData.hackthebox_username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => syncPlatformStats('hackthebox', profileData.hackthebox_username!)}
              disabled={syncing === 'hackthebox'}
            >
              <RefreshCw className={`h-4 w-4 ${syncing === 'hackthebox' ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={() => setEditMode(true)} variant="outline" className="flex-1">
          Edit Usernames
        </Button>
        <Button onClick={() => setEditStatsMode(true)} variant="outline" className="flex-1">
          Edit Stats
        </Button>
      </div>
    </div>
  );
};
