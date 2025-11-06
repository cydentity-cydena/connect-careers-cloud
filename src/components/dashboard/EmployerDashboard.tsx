import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, Briefcase, TrendingUp, Coins, Workflow, CheckCircle, Bug, ArrowRight } from "lucide-react";
import { CreditsPurchaseDialog } from "@/components/employer/CreditsPurchaseDialog";
import { ApplicationPipeline } from "@/components/employer/ApplicationPipeline";
import { UnlockUsageTracker } from "@/components/employer/UnlockUsageTracker";
import { VerificationRequestDialog } from "@/components/verification/VerificationRequestDialog";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { JobManagement } from "./JobManagement";
import { useQuery } from "@tanstack/react-query";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [annualAllocation, setAnnualAllocation] = useState<number | undefined>();
  const [userId, setUserId] = useState("");
  const [jobsCount, setJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [showGettingStarted, setShowGettingStarted] = useState(true);

  const { data: verificationRequest } = useQuery({
    queryKey: ['verification-request', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadCredits(user.id);
      loadStats(user.id);
      loadUserProfile(user.id);
    }
  };

  const loadUserProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, username, created_at')
      .eq('id', uid)
      .single();
    
    if (data) {
      setUserName(data.username || data.full_name?.split(' ')[0] || 'Employer');
      
      // Check if account is older than 7 days
      const createdDate = new Date(data.created_at);
      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      setShowGettingStarted(daysSinceCreation < 7);
    }
  };

  const loadStats = async (uid: string) => {
    // Load jobs count
    const { count: jCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', uid);
    setJobsCount(jCount || 0);

    // Load applications count
    const { count: aCount } = await supabase
      .from('applications')
      .select('*, jobs!inner(*)', { count: 'exact', head: true })
      .eq('jobs.created_by', uid);
    setApplicationsCount(aCount || 0);
  };

  const loadCredits = async (uid: string) => {
    const { data } = await supabase
      .from('employer_credits')
      .select('credits, credits_used, annual_allocation')
      .eq('employer_id', uid)
      .maybeSingle();
    
    if (data) {
      setCredits(data.credits);
      setCreditsUsed(data.credits_used || 0);
      setAnnualAllocation(data.annual_allocation || undefined);
    }
  };
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-muted-foreground">
          Manage your company profile, job postings, and application pipeline
        </p>
      </div>

      {/* Verification Banner */}
      {userId && verificationRequest?.status !== 'approved' && (
        <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Get Your Verification Badge
            </CardTitle>
            <CardDescription>
              Verified businesses get higher visibility and candidate trust
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Complete a quick verification to show candidates you're a legitimate business. 
                Verified employers see 3x more applications on average.
              </p>
              <VerificationRequestDialog userId={userId} existingRequest={verificationRequest} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status */}
      <SubscriptionStatus />

      {showGettingStarted && (
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle>Getting Started as an Employer</CardTitle>
            <CardDescription>
              Follow these steps to find the perfect candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link to="/company/create" className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Create Your Company Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Add company details, culture, and what makes you unique
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              
              <Link to="/jobs/create" className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Post Job Openings</h3>
                  <p className="text-sm text-muted-foreground">
                    Define roles with required skills and clearances
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              
              <button 
                onClick={() => {
                  const pipelineTab = document.querySelector('[value="pipeline"]') as HTMLElement;
                  pipelineTab?.click();
                  setTimeout(() => {
                    document.querySelector('.tabs-content')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group w-full text-left"
              >
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Review & Hire</h3>
                  <p className="text-sm text-muted-foreground">
                    Screen candidates and manage the hiring pipeline
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2">
            <Workflow className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-6">
      {/* Usage Tracker */}
      <UnlockUsageTracker
        creditsAvailable={credits}
        creditsUsed={creditsUsed}
        annualAllocation={annualAllocation}
        currentTier="Starter"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary border-2 shadow-lg hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-primary" />
              Credits Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{credits}</p>
            <p className="text-sm text-muted-foreground mt-1">Profile unlocks available</p>
            <CreditsPurchaseDialog 
              currentCredits={credits} 
              onPurchaseComplete={() => loadCredits(userId)} 
            />
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
            <p className="text-3xl font-bold text-secondary">{jobsCount}</p>
            <p className="text-sm text-muted-foreground mt-1">{jobsCount === 0 ? 'No jobs posted' : 'Active jobs'}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-accent" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{applicationsCount}</p>
            <p className="text-sm text-muted-foreground mt-1">{applicationsCount === 0 ? 'No applications yet' : 'Total applications'}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground mt-1">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle>Company Setup</CardTitle>
            <CardDescription>
              Create your company profile to start posting jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set up your company profile to attract top cybersecurity talent
              </p>
              <Button variant="hero" className="w-full" onClick={() => navigate('/company/create')}>
                Create Company Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle>Post Your First Job</CardTitle>
            <CardDescription>
              Reach qualified candidates quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create job postings with detailed requirements and skill matching
              </p>
              <Button variant="cyber" className="w-full" onClick={() => navigate('/jobs/create')}>
                Post a Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <JobManagement />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <ApplicationPipeline />
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
            Help us improve your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Found an issue? Let us know so we can fix it quickly.
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

export default EmployerDashboard;
