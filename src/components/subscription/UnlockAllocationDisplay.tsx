import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UnlockAllocationDisplayProps {
  annualUsed: number;
  remainingCredits: number;
}

const TIER_LIMITS: Record<string, { allocation: number; overageCharge: number; isUnlimited?: boolean }> = {
  'employer_starter': { allocation: 10, overageCharge: 8 },
  'employer_growth': { allocation: 30, overageCharge: 8 },
  'employer_scale': { allocation: 999999, overageCharge: 0, isUnlimited: true },
  'recruiter_pro': { allocation: 75, overageCharge: 8 },
};

export const UnlockAllocationDisplay = ({ 
  annualUsed, 
  remainingCredits 
}: UnlockAllocationDisplayProps) => {
  const { tier } = useSubscription();

  if (!tier || !(tier in TIER_LIMITS)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            No Active Subscription
          </CardTitle>
          <CardDescription>Subscribe to get annual unlock allocations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You're using pay-as-you-go credits. <strong>{remainingCredits} credits remaining</strong>.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Contact support for subscription options.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierConfig = TIER_LIMITS[tier];
  const usagePercentage = tierConfig.isUnlimited ? 0 : (annualUsed / tierConfig.allocation) * 100;
  const remaining = tierConfig.isUnlimited ? Infinity : Math.max(0, tierConfig.allocation - annualUsed);
  const overage = tierConfig.isUnlimited ? 0 : Math.max(0, annualUsed - tierConfig.allocation);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Annual Unlock Allocation</CardTitle>
        <CardDescription>Track your unlock usage for the year</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Annual Usage</span>
            <span className="font-medium">
              {annualUsed} / {tierConfig.isUnlimited ? '∞' : tierConfig.allocation} unlocks
            </span>
          </div>
          {!tierConfig.isUnlimited && <Progress value={usagePercentage} className="h-2" />}
        </div>

        {!tierConfig.isUnlimited && remaining > 0 && remaining <= 5 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only {remaining} unlocks remaining. Overage unlocks cost £{tierConfig.overageCharge} each.
            </AlertDescription>
          </Alert>
        )}

        {!tierConfig.isUnlimited && overage > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've used {overage} unlocks beyond your allocation. Additional unlocks cost £{tierConfig.overageCharge} each.
              {remainingCredits > 0 && ` You have ${remainingCredits} purchased credits remaining.`}
            </AlertDescription>
          </Alert>
        )}

        {tierConfig.isUnlimited && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have unlimited unlocks with your Enterprise plan. No overage charges apply.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
