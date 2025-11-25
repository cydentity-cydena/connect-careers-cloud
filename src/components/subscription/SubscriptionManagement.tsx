import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Settings, ShoppingCart, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SubscriptionManagementProps {
  creditsAvailable: number;
  annualAllocation?: number;
  annualUnlocksUsed?: number;
  onPurchaseComplete: () => void;
}

export const SubscriptionManagement = ({ 
  creditsAvailable, 
  annualAllocation,
  annualUnlocksUsed = 0,
  onPurchaseComplete 
}: SubscriptionManagementProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const UNLOCK_PRICE = 75; // £75 per unlock

  const handlePurchaseUnlocks = async () => {
    if (quantity < 1 || quantity > 100) {
      toast.error("Quantity must be between 1 and 100");
      return;
    }

    setIsLoading(true);
    try {
      const { data: sessionData, error } = await supabase.functions.invoke(
        "purchase-additional-unlock",
        { body: { quantity } }
      );

      if (error) throw error;

      if (sessionData?.url) {
        window.open(sessionData.url, '_blank');
        setDialogOpen(false);
        toast.success("Redirecting to checkout...");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to create checkout session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data: portalData, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (portalData?.url) {
        window.open(portalData.url, '_blank');
        toast.success("Opening subscription management...");
      }
    } catch (error: any) {
      console.error("Portal error:", error);
      toast.error(error.message || "Failed to open customer portal");
    } finally {
      setIsLoading(false);
    }
  };

  const totalCost = quantity * UNLOCK_PRICE;
  const remaining = annualAllocation ? Math.max(0, annualAllocation - annualUnlocksUsed) : 0;
  const isLowOnUnlocks = creditsAvailable < 5;

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Unlock Management
        </CardTitle>
        <CardDescription>
          Manage your profile unlocks and subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Available Unlocks</span>
            <span className="text-2xl font-bold text-primary">{creditsAvailable}</span>
          </div>
          {annualAllocation && (
            <div className="text-xs text-muted-foreground">
              Annual allocation: {annualUnlocksUsed} / {annualAllocation} used
              {remaining > 0 && ` (${remaining} remaining)`}
            </div>
          )}
        </div>

        {/* Low Balance Alert */}
        {isLowOnUnlocks && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Running low on unlocks! Purchase more to continue accessing candidates.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full gap-2">
                <ShoppingCart className="h-4 w-4" />
                Buy Unlocks
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Purchase Additional Unlocks</DialogTitle>
                <DialogDescription>
                  Additional unlocks are £{UNLOCK_PRICE} each. Choose how many you need.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum 100 unlocks per purchase
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Total Cost:</span>
                    <span className="text-2xl font-bold text-primary">
                      £{totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {quantity} unlock{quantity !== 1 ? 's' : ''} × £{UNLOCK_PRICE} each
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Purchased unlocks never expire and can be used anytime to access candidate profiles.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePurchaseUnlocks} disabled={isLoading}>
                  {isLoading ? "Processing..." : `Purchase for £${totalCost}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={handleManageSubscription}
            disabled={isLoading}
          >
            <Settings className="h-4 w-4" />
            Manage Plan
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Manage your subscription, update payment methods, or view invoices
        </div>
      </CardContent>
    </Card>
  );
};
