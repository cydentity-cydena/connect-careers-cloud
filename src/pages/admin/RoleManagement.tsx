import { RoleManagement as RoleManagementComponent } from "@/components/admin/RoleManagement";
import Navigation from "@/components/Navigation";

export default function RoleManagement() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Role Management</h1>
          <p className="text-muted-foreground">
            Assign and manage user roles across the platform
          </p>
        </div>
        <RoleManagementComponent />
      </div>
    </>
  );
}
