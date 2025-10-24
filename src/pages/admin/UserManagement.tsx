import { UserManagement as UserManagementComponent } from "@/components/admin/UserManagement";
import Navigation from "@/components/Navigation";

export default function UserManagement() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users and their verification status
          </p>
        </div>
        <UserManagementComponent />
      </div>
    </>
  );
}
