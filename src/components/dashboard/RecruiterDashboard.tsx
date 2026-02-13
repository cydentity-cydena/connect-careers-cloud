import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Briefcase, TrendingUp, PoundSterling, UserPlus, Bug, Award, ListChecks, Workflow, Upload, Target, Loader2 } from "lucide-react";
import RecruiterClientsList from "./RecruiterClientsList";
import RecruiterPlacements from "./RecruiterPlacements";
import { ApplicationPipeline } from "@/components/employer/ApplicationPipeline";
import { JobManagement } from "./JobManagement";
import { AnalyticsDashboard } from "@/components/employer/AnalyticsDashboard";
import { ImportCandidatesDialog } from "@/components/recruiter/ImportCandidatesDialog";
import { ImportedCandidatesView } from "@/components/recruiter/ImportedCandidatesView";
import { ImportBatchesView } from "@/components/recruiter/ImportBatchesView";
import { TeamMembersView } from "@/components/team/TeamMembersView";
import { CreateCustomAssessmentDialog } from "@/components/assessments/CreateCustomAssessmentDialog";
import { CustomAssessmentsList } from "@/components/assessments/CustomAssessmentsList";
import { AssessmentQuotaDisplay } from "@/components/assessments/AssessmentQuotaDisplay";
import { AssignedPods } from "@/components/employer/AssignedPods";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { EmployerBounties } from "@/components/employer/EmployerBounties";
import { Skeleton } from "@/components/ui/skeleton";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [clientsCount, setClientsCount] = useState(0);
  const [placementsCount, setPlacementsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [hiringSubTab, setHiringSubTab] = useState("pipeline");
  const [candidatesSubTab, setCandidatesSubTab] = useState("imported");
  const [businessSubTab, setBusinessSubTab] = useState("clients");
  const [settingsSubTab, setSettingsSubTab] = useState("team");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);

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
    const { count: cCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('recruiter_id', uid);
    setClientsCount(cCount || 0);

    const { count: pCount } = await supabase
      .from('placements')
      .select('*', { count: 'exact', head: true })
      .eq('recruiter_id', uid);
    setPlacementsCount(pCount || 0);

    const { count: jCount } = await supabase
      .from('jobs')
      .select('*, clients!inner(recruiter_id)', { count: 'exact', head: true })
      .eq('clients.recruiter_id', uid)
      .eq('is_active', true);
    setActiveJobsCount(jCount || 0);

    const { data: placements } = await supabase
      .from('placements')
      .select('commission_amount')
      .eq('recruiter_id', uid)
      .eq('commission_status', 'completed');
    
    const total = placements?.reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0) || 0;
    setTotalCommissions(total);
    setStatsLoaded(true);
  };

  // Only show onboarding when truly new (no clients AND no jobs)
  const showOnboarding = statsLoaded && clientsCount === 0 && activeJobsCount === 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-muted-foreground">
          Manage your client companies, placements, and candidate pipeline
        </p>
      </div>

      {showOnboarding && (
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
                  <Button variant="hero" size="sm" className="mt-2" onClick={() => navigate('/clients/create')}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
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
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hiring">Hiring</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* ─── OVERVIEW ─── */}
        <TabsContent value="overview" className="space-y-8 mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {!statsLoaded ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="border-border shadow-card">
                    <CardHeader className="pb-3"><Skeleton className="h-5 w-24" /></CardHeader>
                    <CardContent><Skeleton className="h-10 w-16" /><Skeleton className="h-4 w-20 mt-2" /></CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card 
                  className="border-primary border-2 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => { setActiveTab("business"); setBusinessSubTab("clients"); }}
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
                  onClick={() => { setActiveTab("hiring"); setHiringSubTab("jobs"); }}
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
                  onClick={() => { setActiveTab("business"); setBusinessSubTab("placements"); }}
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
                  onClick={() => { setActiveTab("business"); setBusinessSubTab("placements"); }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <PoundSterling className="h-5 w-5 text-primary" />
                      Commissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      £{totalCommissions.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Total earned</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <SubscriptionStatus />

          <AnalyticsDashboard />

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle>Add New Client</CardTitle>
                <CardDescription>Expand your client portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add companies you recruit for and manage their hiring needs
                </p>
                <Button variant="hero" className="w-full" onClick={() => navigate('/clients/create')}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Client Company
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle>Post Job for Client</CardTitle>
                <CardDescription>Create openings on behalf of clients</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Post job listings for your client companies
                </p>
                <Button variant="cyber" className="w-full" onClick={() => navigate('/jobs/create')}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Post Client Job
                </Button>
              </CardContent>
            </Card>
          </div>

          {placementsCount >= 10 && (
            <Card className="border-accent/30 shadow-lg bg-gradient-to-br from-accent/5 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Agency Partnership Program
                </CardTitle>
                <CardDescription>You qualify for enhanced agency benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  With {placementsCount} placements, you're eligible for enhanced features and priority support
                </p>
                <Button variant="outline" className="w-full border-accent/50 hover:bg-accent/10" onClick={() => navigate('/contact')}>
                  Contact for Partnership Details
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── HIRING (Pipeline, Jobs, Assessments, Pods) ─── */}
        <TabsContent value="hiring" className="mt-6 space-y-6">
          <Tabs value={hiringSubTab} onValueChange={setHiringSubTab}>
            <TabsList>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="pods">Pods</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="mt-4">
              <ApplicationPipeline />
            </TabsContent>

            <TabsContent value="jobs" className="mt-4">
              <JobManagement />
            </TabsContent>

            <TabsContent value="assessments" className="mt-4 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Custom Assessments</h2>
                  <p className="text-muted-foreground">Create tailored technical assessments for your candidate pool</p>
                </div>
                <CreateCustomAssessmentDialog />
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <CustomAssessmentsList />
                </div>
                <div>
                  <AssessmentQuotaDisplay />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pods" className="mt-4">
              <AssignedPods />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ─── CANDIDATES (Imported, Batches) ─── */}
        <TabsContent value="candidates" className="mt-6 space-y-6">
          <Card className="border-border shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Candidate Database</CardTitle>
                  <CardDescription>Manage imported candidates and build shortlists</CardDescription>
                </div>
                <Button onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Candidates
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={candidatesSubTab} onValueChange={setCandidatesSubTab}>
                <TabsList>
                  <TabsTrigger value="imported">Candidates</TabsTrigger>
                  <TabsTrigger value="batches">Import History</TabsTrigger>
                </TabsList>
                <TabsContent value="imported" className="mt-4">
                  <ImportedCandidatesView />
                </TabsContent>
                <TabsContent value="batches" className="mt-4">
                  <ImportBatchesView />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Candidate Shortlists
              </CardTitle>
              <CardDescription>Build shortlists for client presentations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse profiles, save top candidates, and create custom shortlists for each client requisition
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/profiles')}>
                Browse Candidates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── BUSINESS (Clients, Placements, Bounties) ─── */}
        <TabsContent value="business" className="mt-6 space-y-6">
          <Tabs value={businessSubTab} onValueChange={setBusinessSubTab}>
            <TabsList>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="placements">Placements</TabsTrigger>
              <TabsTrigger value="bounties">
                <Target className="h-4 w-4 mr-1" />
                Bounties
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="mt-4">
              <Card className="border-border shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Clients</CardTitle>
                      <CardDescription>Manage companies you recruit for</CardDescription>
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

            <TabsContent value="placements" className="mt-4">
              <Card className="border-border shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Placements</CardTitle>
                      <CardDescription>Your latest successful placements</CardDescription>
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

            <TabsContent value="bounties" className="mt-4">
              <EmployerBounties />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ─── SETTINGS (Team, ATS, Bug Report) ─── */}
        <TabsContent value="settings" className="mt-6 space-y-6">
          <Tabs value={settingsSubTab} onValueChange={setSettingsSubTab}>
            <TabsList>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="mt-4">
              <TeamMembersView role="recruiter" />
            </TabsContent>

            <TabsContent value="integrations" className="mt-4">
              <Card className="border-border shadow-card bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-primary" />
                    ATS Integrations
                  </CardTitle>
                  <CardDescription>Push verified candidates to your ATS</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect to Workday, Greenhouse, or use webhooks to automatically sync candidates.
                  </p>
                  <Button variant="default" className="w-full gap-2" onClick={() => navigate('/integrations')}>
                    <Workflow className="h-4 w-4" />
                    Manage Integrations
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="mt-4">
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-primary" />
                    Report a Bug
                  </CardTitle>
                  <CardDescription>Help us improve the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Found something broken? Let us know!
                  </p>
                  <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/bug-report')}>
                    <Bug className="h-4 w-4" />
                    Report Bug
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <ImportCandidatesDialog 
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
};

export default RecruiterDashboard;
