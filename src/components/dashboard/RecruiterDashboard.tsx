import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, TrendingUp, Plus, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Client {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  status: string;
  created_at: string;
}

interface Placement {
  id: string;
  position_title: string;
  placement_date: string;
  salary_offered: number | null;
  commission_amount: number | null;
  commission_status: string;
  client_id: string;
  clients: {
    company_name: string;
  };
}

const RecruiterDashboard = () => {
  const [userName, setUserName] = useState<string>("Recruiter");
  const [clients, setClients] = useState<Client[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activePlacements: 0,
    pendingCommission: 0,
    thisMonthPlacements: 0,
  });
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    industry: "",
    notes: "",
    status: "prospect",
  });

  useEffect(() => {
    loadUserProfile();
    loadClients();
    loadPlacements();
  }, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .single();

      if (profile) {
        const displayName = profile.username || profile.full_name?.split(" ")[0] || "Recruiter";
        setUserName(displayName);
      }
    }
  };

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading clients:", error);
      return;
    }

    setClients(data || []);
    setStats(prev => ({ ...prev, totalClients: data?.length || 0 }));
  };

  const loadPlacements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("placements")
      .select(`
        *,
        clients (
          company_name
        )
      `)
      .eq("recruiter_id", user.id)
      .order("placement_date", { ascending: false });

    if (error) {
      console.error("Error loading placements:", error);
      return;
    }

    setPlacements(data || []);

    // Calculate stats
    const pending = data?.filter(p => p.commission_status === "pending").reduce((sum, p) => sum + (p.commission_amount || 0), 0) || 0;
    const thisMonth = data?.filter(p => {
      const placementDate = new Date(p.placement_date);
      const now = new Date();
      return placementDate.getMonth() === now.getMonth() && placementDate.getFullYear() === now.getFullYear();
    }).length || 0;

    setStats(prev => ({
      ...prev,
      activePlacements: data?.length || 0,
      pendingCommission: pending,
      thisMonthPlacements: thisMonth,
    }));
  };

  const handleAddClient = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!newClient.company_name) {
      toast.error("Company name is required");
      return;
    }

    const { error } = await supabase
      .from("clients")
      .insert([{ ...newClient, recruiter_id: user.id }]);

    if (error) {
      toast.error("Failed to add client");
      console.error(error);
      return;
    }

    toast.success("Client added successfully");
    setShowAddClient(false);
    setNewClient({
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      industry: "",
      notes: "",
      status: "prospect",
    });
    loadClients();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userName}! 👋</h1>
          <p className="text-muted-foreground">Manage your clients and track placements</p>
        </div>
        <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Create a new client company to manage placements for</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={newClient.company_name}
                  onChange={(e) => setNewClient({ ...newClient, company_name: e.target.value })}
                  placeholder="Acme Security Inc."
                />
              </div>
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={newClient.contact_name}
                  onChange={(e) => setNewClient({ ...newClient, contact_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={newClient.contact_email}
                  onChange={(e) => setNewClient({ ...newClient, contact_email: e.target.value })}
                  placeholder="john@acme.com"
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={newClient.contact_phone}
                  onChange={(e) => setNewClient({ ...newClient, contact_phone: e.target.value })}
                  placeholder="+44 20 1234 5678"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={newClient.industry}
                  onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                  placeholder="FinTech"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newClient.status} onValueChange={(value) => setNewClient({ ...newClient, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <Button onClick={handleAddClient} className="w-full">Add Client</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Placements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlacements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{stats.pendingCommission.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthPlacements} placements</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="pipeline">Candidate Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Clients</CardTitle>
              <CardDescription>Companies you're recruiting for</CardDescription>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No clients yet. Add your first client to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <Card key={client.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{client.company_name}</CardTitle>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            client.status === 'active' ? 'bg-green-500/10 text-green-500' :
                            client.status === 'prospect' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-gray-500/10 text-gray-500'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                        {client.contact_name && (
                          <CardDescription>Contact: {client.contact_name} {client.contact_email && `(${client.contact_email})`}</CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Placements</CardTitle>
              <CardDescription>Track your successful placements and commissions</CardDescription>
            </CardHeader>
            <CardContent>
              {placements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No placements yet. Start placing candidates to track commissions!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {placements.map((placement) => (
                    <Card key={placement.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{placement.position_title}</h3>
                            <p className="text-sm text-muted-foreground">{placement.clients.company_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Placed: {new Date(placement.placement_date).toLocaleDateString()}
                            </p>
                            {placement.salary_offered && (
                              <p className="text-sm mt-2">Salary: £{placement.salary_offered.toLocaleString()}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {placement.commission_amount && (
                              <p className="text-lg font-bold">£{placement.commission_amount.toLocaleString()}</p>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              placement.commission_status === 'paid' ? 'bg-green-500/10 text-green-500' :
                              placement.commission_status === 'approved' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {placement.commission_status}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Pipeline</CardTitle>
              <CardDescription>Browse and manage candidates across all your clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">Use the Profiles page to search and unlock candidates</p>
                <Button variant="outline" onClick={() => window.location.href = '/profiles'}>
                  Browse Candidates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecruiterDashboard;