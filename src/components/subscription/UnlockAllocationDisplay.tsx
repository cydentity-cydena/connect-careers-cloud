import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UnlockAllocationDisplayProps {
  annualUsed: number;
  remainingCredits: number;
}

const TIER_LIMITS = {
  employer_starter: { limit: 10, overage: 15 },
  employer_growth: { limit: 25, overage: 12 },
  employer_scale: { limit: 75, overage: 10 },
  recruiter_pro: { limit: 50, overage: 10 },
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
            <Link to="/pricing">
              <Button className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Subscription Plans
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierConfig = TIER_LIMITS[tier];
  const percentUsed = (annualUsed / tierConfig.limit) * 100;
  const remaining = Math.max(0, tierConfig.limit - annualUsed);
  const isOverage = annualUsed > tierConfig.limit;

  return (
    <Card className={isOverage ? "border-yellow-500" : ""}>
      <CardHeader>
        <CardTitle>Annual Unlock Allocation</CardTitle>
        <CardDescription>
          {annualUsed} of {tierConfig.limit} unlocks used this year
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Usage</span>
            <span className="font-medium">{Math.round(percentUsed)}%</span>
          </div>
          <Progress value={Math.min(percentUsed, 100)} />
        </div>

        {remaining > 0 && remaining <= 5 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only {remaining} unlocks remaining in your allocation. Additional unlocks will be charged at £{tierConfig.overage} each.
            </AlertDescription>
          </Alert>
        )}

        {isOverage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've exceeded your allocation by {annualUsed - tierConfig.limit} unlocks. 
              Using purchased credits at £{tierConfig.overage}/unlock.
              <div className="mt-2">
                <strong>{remainingCredits} purchased credits remaining</strong>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Link to="/pricing" className="flex-1">
            <Button variant="outline" className="w-full">Upgrade Plan</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};