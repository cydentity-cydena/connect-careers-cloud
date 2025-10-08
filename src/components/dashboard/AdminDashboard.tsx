import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Briefcase, AlertCircle, UserCog, CheckCircle } from "lucide-react";
import { SeedDemoCandidates } from "@/components/admin/SeedDemoCandidates";
import { VerificationReviewPanel } from "@/components/admin/VerificationReviewPanel";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [employersCount, setEmployersCount] = useState(0);
  const [recruitersCount, setRecruitersCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);

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

    // Companies
    const { count: compCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    setCompaniesCount(compCount || 0);
  };

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
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{companiesCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Registered</p>
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
                <span className="text-sm text-muted-foreground">Companies</span>
                <span className="font-semibold">{companiesCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Review Panel */}
      <VerificationReviewPanel />

      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>
            Platform management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/profiles')}
              className="text-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">User Management</p>
            </div>
            <div 
              onClick={() => navigate('/jobs')}
              className="text-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <Briefcase className="h-6 w-6 mx-auto mb-2 text-secondary" />
              <p className="text-sm font-medium">Job Moderation</p>
            </div>
            <div 
              onClick={() => navigate('/skills')}
              className="text-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-sm font-medium">Skills Library</p>
            </div>
            <div 
              onClick={() => toast.info("Role management interface coming soon")}
              className="text-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <UserCog className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-sm font-medium">Role Management</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
