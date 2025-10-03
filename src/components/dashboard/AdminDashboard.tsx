import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Briefcase, AlertCircle } from "lucide-react";
import { SeedDemoCandidates } from "@/components/admin/SeedDemoCandidates";

const AdminDashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and moderation tools
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground mt-1">Registered</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-secondary" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">0</p>
            <p className="text-sm text-muted-foreground mt-1">Posted</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-accent" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">0</p>
            <p className="text-sm text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">0</p>
            <p className="text-sm text-muted-foreground mt-1">Moderation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SeedDemoCandidates />
        
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>
              Key metrics and growth indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Candidates</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Employers</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Companies</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>
            Platform management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">User Management</p>
            </div>
            <div className="text-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
              <Briefcase className="h-6 w-6 mx-auto mb-2 text-secondary" />
              <p className="text-sm font-medium">Job Moderation</p>
            </div>
            <div className="text-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
              <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-sm font-medium">Skills Library</p>
            </div>
            <div className="text-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <p className="text-sm font-medium">Audit Logs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
