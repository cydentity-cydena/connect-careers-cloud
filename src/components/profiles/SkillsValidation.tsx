import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Trophy, ExternalLink } from "lucide-react";
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
  const [editMode, setEditMode] = useState(false);
  const [thmUsername, setThmUsername] = useState(tryHackMeUsername || "");
  const [htbUsername, setHtbUsername] = useState(hackTheBoxUsername || "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          tryhackme_username: thmUsername || null,
          hackthebox_username: htbUsername || null,
        })
        .eq("id", candidateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Skills platform profiles updated",
      });
      setEditMode(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOwnProfile && !tryHackMeUsername && !hackTheBoxUsername) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Practical Skills Validation</CardTitle>
          </div>
          {isOwnProfile && !editMode && (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              {tryHackMeUsername || hackTheBoxUsername ? "Edit" : "Add Profiles"}
            </Button>
          )}
        </div>
        <CardDescription>
          Verified hands-on cybersecurity skills from training platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {editMode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="thm">TryHackMe Username</Label>
              <Input
                id="thm"
                placeholder="YourUsername"
                value={thmUsername}
                onChange={(e) => setThmUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="htb">HackTheBox Username</Label>
              <Input
                id="htb"
                placeholder="YourUsername"
                value={htbUsername}
                onChange={(e) => setHtbUsername(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tryHackMeUsername && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">TryHackMe</p>
                    <p className="text-sm text-muted-foreground">@{tryHackMeUsername}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {tryHackMeRank && (
                    <Badge variant="secondary">{tryHackMeRank}</Badge>
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
                    <p className="font-medium">HackTheBox</p>
                    <p className="text-sm text-muted-foreground">@{hackTheBoxUsername}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hackTheBoxRank && (
                    <Badge variant="secondary">{hackTheBoxRank}</Badge>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};