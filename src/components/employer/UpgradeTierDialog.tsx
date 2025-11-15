import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradeTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier?: string;
  creditsRemaining: number;
}

const TIER_COMPARISON = {
  "Starter": {
    current: { allocation: 10, price: 99 },
    upgrade: { tier: "Team", allocation: 30, price: 249, perUnlock: 8.30 }
  },
  "Team": {
    current: { allocation: 30, price: 249 },
    upgrade: { tier: "Enterprise", allocation: 999999, price: 499, perUnlock: 0 }
  }
};

export const UpgradeTierDialog = ({ 
  open, 
  onOpenChange, 
  currentTier = "Starter",
  creditsRemaining 
}: UpgradeTierDialogProps) => {
  const comparison = TIER_COMPARISON[currentTier as keyof typeof TIER_COMPARISON];

  if (!comparison) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              You're on the highest tier! Consider purchasing unlock packs for additional capacity.
            </DialogDescription>
          </DialogHeader>
          {/* <div className="text-center py-8">
            <Button asChild>
              <Link to="/pricing">View All Plans</Link>
            </Button>
          </div> */}
        </DialogContent>
      </Dialog>
    );
  }

  const monthlySavings = comparison.upgrade.perUnlock === 0 
    ? (8 * 50) // Enterprise: save £8 per unlock if buying 50 overages
    : (comparison.current.price + (8 * 50)) - comparison.upgrade.price;
  const additionalUnlocks = comparison.upgrade.allocation === 999999 
    ? 'Unlimited' 
    : comparison.upgrade.allocation - comparison.current.allocation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Upgrade to {comparison.upgrade.tier} for Enhanced Access
          </DialogTitle>
          <DialogDescription>
            Get more unlocks and enhanced features with a subscription upgrade
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Current Tier */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current: {currentTier}</CardTitle>
                <Badge variant="outline">£{comparison.current.price}/mo</Badge>
              </div>
              <CardDescription>Your current plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Annual allocation:</span>
                  <span className="font-semibold">{comparison.current.allocation} unlocks</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining:</span>
                  <span className="font-semibold text-yellow-600">{creditsRemaining} unlocks</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-2">If you buy 50 unlock pack:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Monthly subscription:</span>
                    <span>£{comparison.current.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>50 unlock pack:</span>
                    <span>£400</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground pt-2 border-t">
                    <span>Total:</span>
                    <span>£{comparison.current.price + 400}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Tier */}
          <Card className="border-2 border-primary shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary">Recommended</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">{comparison.upgrade.tier}</CardTitle>
                <Badge variant="default">£{comparison.upgrade.price}/mo</Badge>
              </div>
              <CardDescription>Upgrade and save</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {comparison.upgrade.allocation === 999999 ? 'Unlimited' : comparison.upgrade.allocation} annual unlocks
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {typeof additionalUnlocks === 'number' ? `+${additionalUnlocks}` : additionalUnlocks} more than {currentTier}
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {comparison.upgrade.perUnlock === 0 ? 'FREE' : `£${comparison.upgrade.perUnlock.toFixed(2)}`} per unlock
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {comparison.upgrade.perUnlock === 0 ? 'No overage charges' : 'Better value than buying packs'}
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="font-semibold">All {comparison.upgrade.tier} features included</span>
                </li>
              </ul>

              <div className="pt-4 border-t bg-green-50 dark:bg-green-950 -mx-6 px-6 py-3 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Monthly savings:
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    £{Math.round(monthlySavings)}
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  vs subscription + buying 50 unlock pack
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          {/* <Button asChild>
            <Link to="/pricing">
              View Pricing & Upgrade
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
