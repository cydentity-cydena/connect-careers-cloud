import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { Crown, Calendar, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const TIER_DETAILS = {
  employer_starter: { name: "Starter", color: "bg-blue-500" },
  employer_growth: { name: "Growth", color: "bg-purple-500" },
  employer_scale: { name: "Scale", color: "bg-green-500" },
  recruiter_pro: { name: "Recruiter Pro", color: "bg-orange-500" },
};

export const SubscriptionStatus = () => {
  const { subscribed, tier, subscription_end, loading, openCustomerPortal } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!subscribed || !tier) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            No Active Subscription
          </CardTitle>
          <CardDescription>
            Unlock premium features with a subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/pricing">
            <Button className="w-full">View Pricing Plans</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const tierInfo = TIER_DETAILS[tier];
  const endDate = subscription_end ? new Date(subscription_end) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Active Subscription
            </CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </div>
          <Badge className={tierInfo.color}>{tierInfo.name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {endDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Renews on {format(endDate, 'PPP')}</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={openCustomerPortal}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
          <Link to="/pricing" className="flex-1">
            <Button variant="outline" className="w-full">
              Change Plan
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};