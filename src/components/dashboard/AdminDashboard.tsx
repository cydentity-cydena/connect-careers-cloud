import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Briefcase, AlertCircle, UserCog, CheckCircle, Bug } from "lucide-react";
import { SeedDemoCandidates } from "@/components/admin/SeedDemoCandidates";
import { VerificationReviewPanel } from "@/components/admin/VerificationReviewPanel";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { UserManagement } from "@/components/admin/UserManagement";
import { JobModeration } from "@/components/admin/JobModeration";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [employersCount, setEmployersCount] = useState(0);
  const [recruitersCount, setRecruitersCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [employerCompaniesCount, setEmployerCompaniesCount] = useState(0);
  const [clientCompaniesCount, setClientCompaniesCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Total users
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    setTotalUsers(usersCount || 0);

    // Candidates
    const { count: cCount } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'candidate');
    setCandidatesCount(cCount || 0);

    // Employers
    const { count: eCount } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'employer');
    setEmployersCount(eCount || 0);

    // Recruiters
    const { count: rCount } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'recruiter');
    setRecruitersCount(rCount || 0);

    // Active jobs
    const { count: jCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    setActiveJobsCount(jCount || 0);

    // Applications
    const { count: aCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true });
    setApplicationsCount(aCount || 0);

    // Employer Companies (companies table - actual platform companies)
    const { count: empCompCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    setEmployerCompaniesCount(empCompCount || 0);

    // Client Companies (clients table - recruiter clients)
    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    setClientCompaniesCount(clientCount || 0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and moderation tools
        </p>
      </div>

      {/* Notifications Section */}
      <AdminNotifications />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totalUsers}</p>
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
            <p className="text-3xl font-bold text-secondary">{activeJobsCount}</p>
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
            <p className="text-3xl font-bold text-accent">{applicationsCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Platform Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{employerCompaniesCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Employer Profiles</p>
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
                <span className="font-semibold">{candidatesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Employers</span>
                <span className="font-semibold">{employersCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Recruiters</span>
                <span className="font-semibold">{recruitersCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Platform Companies</span>
                <span className="font-semibold">{employerCompaniesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Client Companies</span>
                <span className="font-semibold">{clientCompaniesCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-primary" />
              Report a Bug
            </CardTitle>
            <CardDescription>
              Platform issue reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Found a platform issue? Report it here.
            </p>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => navigate('/bug-report')}
            >
              <Bug className="h-4 w-4" />
              Report Bug
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Verification Review Panel */}
      <VerificationReviewPanel />

      {/* Admin Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="jobs">Job Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="jobs">
          <JobModeration />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
