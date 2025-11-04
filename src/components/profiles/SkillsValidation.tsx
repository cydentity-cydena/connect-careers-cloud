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
}

export const SkillsValidation = ({
  candidateId,
  isOwnProfile,
  tryHackMeUsername,
  hackTheBoxUsername,
  tryHackMeRank,
  hackTheBoxRank
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
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium flex items-center gap-2">
                  TryHackMe
                  {tryHackMeRank && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </p>
                <p className="text-sm text-muted-foreground">@{tryHackMeUsername}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tryHackMeRank && tryHackMeRank !== 'Unranked' && (
                <Badge variant="secondary">{tryHackMeRank}</Badge>
              )}
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncPlatformStats('tryhackme', tryHackMeUsername)}
                  disabled={syncing === 'tryhackme'}
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
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {hackTheBoxUsername && (
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium flex items-center gap-2">
                  HackTheBox
                  {hackTheBoxRank && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </p>
                <p className="text-sm text-muted-foreground">@{hackTheBoxUsername}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hackTheBoxRank && hackTheBoxRank !== 'Connected' && (
                <Badge variant="secondary">{hackTheBoxRank}</Badge>
              )}
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncPlatformStats('hackthebox', hackTheBoxUsername)}
                  disabled={syncing === 'hackthebox'}
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
