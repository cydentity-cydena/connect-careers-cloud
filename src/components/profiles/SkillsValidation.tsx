import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Trophy, ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SkillsValidationProps {
  candidateId: string;
  isOwnProfile: boolean;
  tryHackMeUsername?: string | null;
  hackTheBoxUsername?: string | null;
  tryHackMeRank?: string | null;
  hackTheBoxRank?: string | null;
  tryHackMeLevel?: number | null;
  tryHackMePoints?: number | null;
  tryHackMeBadges?: number | null;
  hackTheBoxPoints?: number | null;
  hackTheBoxRankText?: string | null;
  hackTheBoxUserOwns?: number | null;
}

export const SkillsValidation = ({
  candidateId,
  isOwnProfile,
  tryHackMeUsername,
  hackTheBoxUsername,
  tryHackMeRank,
  hackTheBoxRank,
  tryHackMeLevel,
  tryHackMePoints,
  tryHackMeBadges,
  hackTheBoxPoints,
  hackTheBoxRankText,
  hackTheBoxUserOwns
}: SkillsValidationProps) => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  const syncPlatformStats = async (platform: 'tryhackme' | 'hackthebox', username: string) => {
    if (!username) return;
    
    setSyncing(platform);
    try {
      const { error } = await supabase.functions.invoke('sync-platform-stats', {
        body: { 
          platform, 
          username,
          userId: candidateId 
        }
      });

      if (error) throw error;

      toast({
        title: "Stats Synced",
        description: `${platform === 'tryhackme' ? 'TryHackMe' : 'HackTheBox'} stats updated successfully`,
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message || "Failed to sync platform stats",
      });
    } finally {
      setSyncing(null);
    }
  };

  // Don't show if no usernames
  if (!tryHackMeUsername && !hackTheBoxUsername) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Practical Skills Validation
        </CardTitle>
        <CardDescription>
          Verified hands-on cybersecurity skills from training platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tryHackMeUsername && (
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 flex-1">
              <Trophy className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-base">TryHackMe</p>
                  {tryHackMeRank && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-sm text-muted-foreground mb-2">@{tryHackMeUsername}</p>
                <div className="flex flex-wrap gap-2">
                  {tryHackMeLevel && (
                    <Badge variant="default" className="text-xs">
                      Level {tryHackMeLevel}
                    </Badge>
                  )}
                  {tryHackMePoints !== null && tryHackMePoints !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {tryHackMePoints.toLocaleString()} Points
                    </Badge>
                  )}
                  {tryHackMeBadges !== null && tryHackMeBadges !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {tryHackMeBadges} Badges
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncPlatformStats('tryhackme', tryHackMeUsername)}
                  disabled={syncing === 'tryhackme'}
                  title="Refresh stats"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing === 'tryhackme' ? 'animate-spin' : ''}`} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a
                  href={`https://tryhackme.com/p/${tryHackMeUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on TryHackMe"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {hackTheBoxUsername && (
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 flex-1">
              <Trophy className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-base">HackTheBox</p>
                  {hackTheBoxRank && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-sm text-muted-foreground mb-2">@{hackTheBoxUsername}</p>
                <div className="flex flex-wrap gap-2">
                  {hackTheBoxRankText && hackTheBoxRankText !== 'Connected' && (
                    <Badge variant="default" className="text-xs">
                      {hackTheBoxRankText}
                    </Badge>
                  )}
                  {hackTheBoxPoints !== null && hackTheBoxPoints !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {hackTheBoxPoints.toLocaleString()} Points
                    </Badge>
                  )}
                  {hackTheBoxUserOwns !== null && hackTheBoxUserOwns !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {hackTheBoxUserOwns} User Owns
                    </Badge>
                  )}
                  {hackTheBoxRank === 'Connected' && !hackTheBoxRankText && (
                    <Badge variant="outline" className="text-xs">
                      Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncPlatformStats('hackthebox', hackTheBoxUsername)}
                  disabled={syncing === 'hackthebox'}
                  title="Refresh stats"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing === 'hackthebox' ? 'animate-spin' : ''}`} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a
                  href={`https://app.hackthebox.com/profile/${hackTheBoxUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on HackTheBox"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
