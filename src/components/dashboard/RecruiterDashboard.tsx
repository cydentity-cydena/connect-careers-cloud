import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Briefcase, TrendingUp, DollarSign, UserPlus } from "lucide-react";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [clientsCount, setClientsCount] = useState(0);
  const [placementsCount, setPlacementsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [totalCommissions, setTotalCommissions] = useState(0);

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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-primary border-2 shadow-lg hover:scale-105 transition-transform">
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

            <Card className="border-border shadow-card hover:scale-105 transition-transform">
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

            <Card className="border-border shadow-card hover:scale-105 transition-transform">
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

            <Card className="border-border shadow-card hover:scale-105 transition-transform">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">
                  ${totalCommissions.toLocaleString()}
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
                  <Button variant="hero" className="w-full">
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
                >
                  View All Placements
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle>Your Clients</CardTitle>
              <CardDescription>
                Manage companies you recruit for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {clientsCount === 0 ? (
                  <div className="space-y-4">
                    <Building2 className="h-12 w-12 mx-auto opacity-50" />
                    <p>No clients yet. Add your first client to get started!</p>
                    <Button variant="hero">
                      <Building2 className="h-4 w-4 mr-2" />
                      Add First Client
                    </Button>
                  </div>
                ) : (
                  <p>Client list will be displayed here</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecruiterDashboard;
