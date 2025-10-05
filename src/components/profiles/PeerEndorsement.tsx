import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Heart, Star, Award } from "lucide-react";
import { toast } from "sonner";

interface PeerEndorsementProps {
  candidateId: string;
  currentUserId: string | null;
}

const ENDORSEMENT_TYPES = [
  { value: "helpful", label: "Helpful", icon: ThumbsUp },
  { value: "mentor", label: "Great Mentor", icon: Award },
  { value: "knowledgeable", label: "Knowledgeable", icon: Star },
  { value: "supportive", label: "Supportive", icon: Heart },
];

export function PeerEndorsement({ candidateId, currentUserId }: PeerEndorsementProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [endorsements, setEndorsements] = useState<any[]>([]);

  const handleEndorse = async () => {
    if (!currentUserId) {
      toast.error("Please log in to endorse");
      return;
    }

    if (!selectedType) {
      toast.error("Please select an endorsement type");
      return;
    }

    setSubmitting(true);
    try {
      const { error: endorseError } = await supabase
        .from("peer_endorsements")
        .insert({
          from_user_id: currentUserId,
          to_user_id: candidateId,
          endorsement_type: selectedType,
          comment: comment.trim() || null,
        });

      if (endorseError) {
        if (endorseError.code === "23505") {
          toast.error("You've already given this type of endorsement");
        } else {
          throw endorseError;
        }
        return;
      }

      // Award community points
      await supabase.rpc("award_community_points", {
        p_candidate_id: candidateId,
        p_code: "PEER_ENDORSEMENT",
        p_meta: {
          endorsed_by: currentUserId,
          type: selectedType,
        },
      });

      toast.success("Endorsement sent! They earned 50 community points.");
      setSelectedType(null);
      setComment("");
      loadEndorsements();
    } catch (error: any) {
      console.error("Error submitting endorsement:", error);
      toast.error("Failed to submit endorsement");
    } finally {
      setSubmitting(false);
    }
  };

  const loadEndorsements = async () => {
    const { data } = await supabase
      .from("peer_endorsements")
      .select("*")
      .eq("to_user_id", candidateId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      const enriched = await Promise.all(
        data.map(async (row) => {
          const { data: prof } = await supabase.rpc('get_public_profile', { profile_id: row.from_user_id });
          const p = Array.isArray(prof) ? prof?.[0] : prof;
          return { ...row, from_user_name: p?.full_name || null };
        })
      );
      setEndorsements(enriched);
    }
  };
  useEffect(() => {
    loadEndorsements();
  }, [candidateId]);

  if (currentUserId === candidateId) {
    return null; // Don't show endorsement section on own profile
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Endorsements</CardTitle>
        <CardDescription>
          Recognize this professional's contributions to the community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentUserId && (
          <div className="space-y-4">
            <div>
              <Label>Select Endorsement Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ENDORSEMENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant={selectedType === type.value ? "default" : "outline"}
                      onClick={() => setSelectedType(type.value)}
                      className="justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share why you're endorsing this person..."
                className="mt-2"
                maxLength={500}
              />
            </div>

            <Button
              onClick={handleEndorse}
              disabled={!selectedType || submitting}
              className="w-full"
            >
              {submitting ? "Sending..." : "Send Endorsement (+50 points)"}
            </Button>
          </div>
        )}

        {!currentUserId && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Log in to endorse this professional
          </p>
        )}

        {/* Show recent endorsements */}
        {endorsements.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-sm">Recent Endorsements</h4>
            {endorsements.map((endorsement) => (
              <div key={endorsement.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {endorsement.from_user_name || "Anonymous"}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {ENDORSEMENT_TYPES.find((t) => t.value === endorsement.endorsement_type)?.label}
                  </Badge>
                </div>
                {endorsement.comment && (
                  <p className="text-sm text-muted-foreground">{endorsement.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(endorsement.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
