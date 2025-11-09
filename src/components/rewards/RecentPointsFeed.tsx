import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RewardPoint {
  id: string;
  type: string;
  amount: number;
  meta: any;
  created_at: string;
}

interface RecentPointsFeedProps {
  userId: string;
  limit?: number;
}

export const RecentPointsFeed = ({ userId, limit = 5 }: RecentPointsFeedProps) => {
  const [points, setPoints] = useState<RewardPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentPoints();
  }, [userId]);

  const loadRecentPoints = async () => {
    try {
      const { data } = await supabase
        .from('reward_points')
        .select('*')
        .eq('candidate_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      setPoints(data || []);
    } catch (error) {
      console.error('Error loading recent points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (points.length === 0) return null;

  const getXPTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CERT_OPENBADGE_VERIFIED': '🏅 Certification Verified',
      'CERT_MANUAL_PENDING': '📝 Certification Added',
      'CERT_VENDOR_WEBHOOK_VERIFIED': '✓ Vendor Verified Cert',
      'CERT_ADMIN_VERIFIED': '✓ Admin Verified',
      'PROFILE_COMPLETE': '🎯 Profile Complete',
      'FIRST_JOB_APPLICATION': '💼 First Application',
      'SKILL_ADDED': '⚡ Skill Added',
    };
    return labels[type] || type;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Recent XP Earned
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {points.map((point) => (
            <div key={point.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium">{getXPTypeLabel(point.type)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(point.created_at), { addSuffix: true })}
                </p>
                {point.meta?.name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {point.meta.name}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                <Award className="h-3 w-3 mr-1" />
                +{point.amount} XP
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
