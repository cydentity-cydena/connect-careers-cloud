import Navigation from "@/components/Navigation";
import { PodManagement as PodManagementComponent } from "@/components/admin/PodManagement";

const PodManagement = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <PodManagementComponent />
      </main>
    </div>
  );
};

export default PodManagement;
