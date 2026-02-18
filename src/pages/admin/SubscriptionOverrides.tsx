import Navigation from "@/components/Navigation";
import SubscriptionOverridesComponent from "@/components/admin/SubscriptionOverrides";

export default function SubscriptionOverridesPage() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Subscription Overrides</h1>
          <p className="text-muted-foreground">
            Grant or revoke subscription access for employers and recruiters without requiring payment
          </p>
        </div>
        <SubscriptionOverridesComponent />
      </div>
    </>
  );
}
