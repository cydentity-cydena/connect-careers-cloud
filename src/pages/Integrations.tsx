import Navigation from "@/components/Navigation";
import { IntegrationManagement } from "@/components/integrations/IntegrationManagement";

export default function Integrations() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <IntegrationManagement />
      </div>
    </>
  );
}