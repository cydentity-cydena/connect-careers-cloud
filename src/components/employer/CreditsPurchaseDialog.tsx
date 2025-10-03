import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface CreditsPurchaseDialogProps {
  currentCredits: number;
  onPurchaseComplete: () => void;
}

export const CreditsPurchaseDialog = ({ currentCredits, onPurchaseComplete }: CreditsPurchaseDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const packages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 5,
      price: 49.99,
      perCredit: 9.99,
      description: 'Perfect for trying out the platform',
      features: ['5 Profile Unlocks', 'Full Contact Details', '30 Days Validity'],
    },
    {
      id: 'professional',
      name: 'Professional',
      credits: 20,
      price: 149.99,
      perCredit: 7.50,
      popular: true,
      description: 'Best for active recruiting',
      features: ['20 Profile Unlocks', 'Full Contact Details', '90 Days Validity', 'Priority Support'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      credits: 100,
      price: 499.99,
      perCredit: 5.00,
      description: 'For large-scale hiring',
      features: ['100 Profile Unlocks', 'Full Contact Details', '180 Days Validity', 'Dedicated Account Manager', 'Custom Integrations'],
    },
  ];

  const handlePurchase = async (packageId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-credits', {
        body: { package: packageId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success(`Credits purchased successfully! You now have ${data.totalCredits} credits.`);
      onPurchaseComplete();
      setOpen(false);
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || "Failed to purchase credits");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Buy Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Profile Unlock Credits</DialogTitle>
          <DialogDescription>
            Unlock candidate profiles to view full contact information, resumes, and portfolios.
            <br />
            Current balance: <span className="font-bold text-primary">{currentCredits} credits</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${pkg.popular ? 'border-primary border-2' : 'border-border'}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-4xl font-bold">${pkg.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${pkg.perCredit.toFixed(2)} per unlock
                  </p>
                  <p className="text-2xl font-bold text-primary mt-2">{pkg.credits} Credits</p>
                </div>

                <ul className="space-y-2">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isLoading}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Purchase ${pkg.credits} Credits`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">How it works:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Purchase a credit package that fits your hiring needs</li>
            <li>Browse candidate profiles and find the perfect match</li>
            <li>Use 1 credit to unlock full contact details and resume</li>
            <li>Connect directly with qualified cybersecurity professionals</li>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
};