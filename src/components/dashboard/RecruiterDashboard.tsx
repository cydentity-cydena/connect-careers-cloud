import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Briefcase, TrendingUp, PoundSterling, UserPlus, Bug, Award, ListChecks, Workflow } from "lucide-react";
import RecruiterClientsList from "./RecruiterClientsList";
import RecruiterPlacements from "./RecruiterPlacements";
import { ApplicationPipeline } from "@/components/employer/ApplicationPipeline";
import { JobManagement } from "./JobManagement";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [clientsCount, setClientsCount] = useState(0);
  const [placementsCount, setPlacementsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadUserProfile(user.id);
      loadStats(user.id);
    }
  };

  const loadUserProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', uid)
      .single();
    
    if (data) {
      setUserName(data.username || data.full_name?.split(' ')[0] || 'Recruiter');
    }
  };

  const loadStats = async (uid: string) => {
    // Load clients count
    const { count: cCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('recruiter_id', uid);
    setClientsCount(cCount || 0);

    // Load placements count
    const { count: pCount } = await supabase
      .from('placements')
      .select('*', { count: 'exact', head: true })
      .eq('recruiter_id', uid);
    setPlacementsCount(pCount || 0);

    // Load active jobs for clients
    const { count: jCount } = await supabase
      .from('jobs')
      .select('*, clients!inner(recruiter_id)', { count: 'exact', head: true })
      .eq('clients.recruiter_id', uid)
      .eq('is_active', true);
    setActiveJobsCount(jCount || 0);

    // Calculate total commissions
    const { data: placements } = await supabase
      .from('placements')
      .select('commission_amount')
      .eq('recruiter_id', uid)
      .eq('commission_status', 'completed');
    
    const total = placements?.reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0) || 0;
    setTotalCommissions(total);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-muted-foreground">
          Manage your client companies, placements, and candidate pipeline
        </p>
      </div>

      {(clientsCount === 0 || activeJobsCount === 0 || placementsCount === 0) && (
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle>Getting Started as a Recruiter</CardTitle>
            <CardDescription>
              Build your client base and place top talent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Add Client Companies</h3>
                  <p className="text-sm text-muted-foreground">
                    Build your portfolio of companies you recruit for
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Post Jobs for Clients</h3>
                  <p className="text-sm text-muted-foreground">
                    Create job listings on behalf of your client companies
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Source & Place Candidates</h3>
                  <p className="text-sm text-muted-foreground">
                    Find qualified candidates and track your placements
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-4xl grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="border-primary border-2 shadow-lg hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setActiveTab("clients")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{clientsCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Active companies</p>
              </CardContent>
            </Card>

            <Card 
              className="border-border shadow-card hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setActiveTab("jobs")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-secondary" />
                  Active Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-secondary">{activeJobsCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Client openings</p>
              </CardContent>
            </Card>

            <Card 
              className="border-border shadow-card hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setActiveTab("placements")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="h-5 w-5 text-accent" />
                  Placements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">{placementsCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Total placements</p>
              </CardContent>
            </Card>

            <Card 
              className="border-border shadow-card hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setActiveTab("placements")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PoundSterling className="h-5 w-5 text-green-500" />
                  Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">
                  £{totalCommissions.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total earned</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle>Add New Client</CardTitle>
                <CardDescription>
                  Expand your client portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Add companies you recruit for and manage their hiring needs
                  </p>
                  <Button variant="hero" className="w-full" onClick={() => navigate('/clients/create')}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Client Company
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle>Post Job for Client</CardTitle>
                <CardDescription>
                  Create openings on behalf of clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Post job listings for your client companies
                  </p>
                  <Button variant="cyber" className="w-full" onClick={() => navigate('/jobs/create')}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Post Client Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-500/30 shadow-lg bg-gradient-to-br from-green-500/5 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Track Your Placements
                </CardTitle>
                <CardDescription>
                  Manage candidate placements and commission tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    View all your placements, track commission status, and manage client relationships
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-500/50 hover:bg-green-500/10"
                    onClick={() => navigate('/placements')}
                  >
                    View All Placements
                  </Button>
                </div>
              </CardContent>
            </Card>

            {placementsCount >= 10 && (
              <Card className="border-accent/30 shadow-lg bg-gradient-to-br from-accent/5 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Agency Partnership Program
                  </CardTitle>
                  <CardDescription>
                    You qualify for enhanced agency benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      With {placementsCount} placements, you're eligible for enhanced features and priority support
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-accent/50 hover:bg-accent/10"
                      onClick={() => navigate('/contact')}
                    >
                      Contact for Partnership Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Candidate Shortlists
                </CardTitle>
                <CardDescription>
                  Build shortlists for client presentations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Browse profiles, save top candidates, and create custom shortlists for each client requisition
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/profiles')}
                  >
                    Browse Candidates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <ApplicationPipeline />
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <JobManagement />
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <Card className="border-border shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Clients</CardTitle>
                  <CardDescription>
                    Manage companies you recruit for
                  </CardDescription>
                </div>
                <Button variant="hero" onClick={() => navigate('/clients/create')}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RecruiterClientsList recruiterId={userId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="mt-6">
          <Card className="border-border shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Placements</CardTitle>
                  <CardDescription>
                    Your latest successful placements
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => navigate('/placements')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RecruiterPlacements recruiterId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-border shadow-card bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            ATS Integrations
          </CardTitle>
          <CardDescription>
            Push verified candidates to your ATS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Connect to Workday, Greenhouse, or use webhooks to automatically sync candidates.
          </p>
          <Button 
            variant="default" 
            className="w-full gap-2"
            onClick={() => navigate('/integrations')}
          >
            <Workflow className="h-4 w-4" />
            Manage Integrations
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            Report a Bug
          </CardTitle>
          <CardDescription>
            Help us improve the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Found something broken? Let us know!
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
  );
};

export default RecruiterDashboard;
