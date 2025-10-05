import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PurchaseUnlockPackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UNLOCK_PACKS = [
  {
    size: "10",
    credits: 10,
    price: 59,
    perUnlock: 5.90,
    savings: null
  },
  {
    size: "25",
    credits: 25,
    price: 129,
    perUnlock: 5.16,
    savings: "Save £18 vs 10-pack"
  },
  {
    size: "50",
    credits: 50,
    price: 249,
    perUnlock: 4.98,
    savings: "Save £46 vs 10-pack",
    popular: true
  }
];

export const PurchaseUnlockPackDialog = ({ open, onOpenChange }: PurchaseUnlockPackDialogProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packSize: string) => {
    try {
      setLoading(packSize);
      console.log("[UNLOCK-PACK] Initiating purchase for pack size:", packSize);

      const { data, error } = await supabase.functions.invoke('purchase-unlock-pack', {
        body: { pack_size: packSize }
      });

      if (error) {
        console.error("[UNLOCK-PACK] Error:", error);
        throw error;
      }

      if (data?.url) {
        console.log("[UNLOCK-PACK] Redirecting to checkout:", data.url);
        window.open(data.url, '_blank');
        toast.success("Opening checkout in new tab...");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("[UNLOCK-PACK] Purchase error:", error);
      toast.error("Failed to initiate purchase. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Purchase Unlock Packs</DialogTitle>
          <DialogDescription>
            One-time purchases to instantly add unlocks to your account
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 py-4">
          {UNLOCK_PACKS.map((pack) => (
            <Card 
              key={pack.size}
              className={`relative ${pack.popular ? 'border-2 border-primary shadow-lg' : ''}`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Best Value</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {pack.credits} Unlocks
                  {pack.popular && <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                </CardTitle>
                <CardDescription>
                  £{pack.perUnlock.toFixed(2)} per unlock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold">£{pack.price}</div>
                  {pack.savings && (
                    <div className="text-sm text-green-600 mt-2 font-semibold">
                      {pack.savings}
                    </div>
                  )}
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>One-time payment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Credits added instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Never expires</span>
                  </li>
                </ul>

                <Button 
                  className="w-full"
                  variant={pack.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(pack.size)}
                  disabled={loading !== null}
                >
                  {loading === pack.size ? "Processing..." : "Purchase Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground pt-2 border-t">
          Need more? Consider upgrading your subscription plan for better value and additional features.
        </div>
      </DialogContent>
    </Dialog>
  );
};
