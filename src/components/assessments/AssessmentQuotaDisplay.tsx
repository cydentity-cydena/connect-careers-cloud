import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp } from "lucide-react";

export const AssessmentQuotaDisplay = () => {
  const { data: quotaInfo, isLoading } = useQuery({
    queryKey: ['assessment-quota'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get subscription tier
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const tier = subscription?.tier || 'employer_starter';

      // Get quota for tier
      const { data: quota } = await supabase
        .rpc('get_assessment_quota', { p_tier: tier }) as any;

      // Count this month's assessments
      const { data: count } = await supabase
        .rpc('count_monthly_assessments', { p_user_id: user.id }) as any;

      return {
        tier,
        quota: quota || 0,
        used: count || 0,
      };
    },
  });

  if (isLoading || !quotaInfo) {
    return null;
  }

  const remaining = quotaInfo.quota - quotaInfo.used;
  const percentUsed = (quotaInfo.used / quotaInfo.quota) * 100;
  const isOverQuota = quotaInfo.used >= quotaInfo.quota;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Custom Assessment Quota</CardTitle>
        </div>
        <CardDescription>
          Monthly allowance for creating custom assessments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {quotaInfo.used} of {quotaInfo.quota} used this month
            </span>
            <span className="text-sm text-muted-foreground">
              {isOverQuota ? (
                <span className="text-amber-600">Over quota</span>
              ) : (
                `${remaining} remaining`
              )}
            </span>
          </div>
          <Progress value={Math.min(percentUsed, 100)} className="h-2" />
        </div>

        {isOverQuota && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <TrendingUp className="inline h-4 w-4 mr-1" />
              You've used all free assessments. Additional assessments cost <strong>10 credits</strong> each.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Quota resets monthly on your billing date</p>
          <p>• Upgrade your tier for more monthly assessments</p>
          <p>• Purchase credits for unlimited assessments</p>
        </div>
      </CardContent>
    </Card>
  );
};
