import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, ShoppingCart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { PurchaseUnlockPackDialog } from "./PurchaseUnlockPackDialog";
import { UpgradeTierDialog } from "./UpgradeTierDialog";

interface UnlockUsageTrackerProps {
  creditsAvailable: number;
  creditsUsed: number;
  annualAllocation?: number;
  currentTier?: string;
}

export const UnlockUsageTracker = ({
  creditsAvailable,
  creditsUsed,
  annualAllocation,
  currentTier
}: UnlockUsageTrackerProps) => {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Total allocated should be all available credits plus what's been used
  const totalAllocated = creditsUsed + creditsAvailable;
  const usagePercentage = totalAllocated > 0 ? (creditsUsed / totalAllocated) * 100 : 0;
  const isLowBalance = creditsAvailable <= 10;
  const isOutOfCredits = creditsAvailable === 0;

  return (
    <>
      <Card className={isOutOfCredits ? "border-destructive" : isLowBalance ? "border-yellow-500" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Unlock Usage</CardTitle>
              <CardDescription>
                {annualAllocation 
                  ? `Annual allocation: ${annualAllocation} unlocks` 
                  : "Pay-as-you-go plan"}
              </CardDescription>
            </div>
            {currentTier && (
              <Badge variant="secondary">{currentTier}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="font-semibold">{creditsUsed} / {totalAllocated}</span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={isLowBalance ? "bg-yellow-100" : ""}
            />
            <div className="text-right text-sm font-semibold text-primary">
              {creditsAvailable} unlocks remaining
            </div>
          </div>

          {/* Low Balance Alert */}
          {isLowBalance && !isOutOfCredits && (
            <Alert variant="default" className="border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Low Balance Warning</AlertTitle>
              <AlertDescription className="text-yellow-700">
                You have {creditsAvailable} unlock{creditsAvailable === 1 ? '' : 's'} remaining. 
                Consider purchasing more or upgrading your plan.
              </AlertDescription>
            </Alert>
          )}

          {/* Out of Credits Alert */}
          {isOutOfCredits && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Out of Unlocks</AlertTitle>
              <AlertDescription>
                You've used all your unlocks. Purchase more to continue viewing candidate profiles.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {(isLowBalance || isOutOfCredits) && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPurchaseDialog(true)}
                className="w-full"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Unlocks
              </Button>
              <Button 
                onClick={() => setShowUpgradeDialog(true)}
                className="w-full"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PurchaseUnlockPackDialog 
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
      />

      <UpgradeTierDialog 
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        currentTier={currentTier}
        creditsRemaining={creditsAvailable}
      />
    </>
  );
};
