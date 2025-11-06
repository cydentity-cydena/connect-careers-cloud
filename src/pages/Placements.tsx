import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { UserPlus, PoundSterling, TrendingUp, Calendar } from "lucide-react";
import { z } from "zod";

const placementSchema = z.object({
  client_id: z.string().uuid({ message: "Please select a client" }),
  candidate_id: z.string().uuid({ message: "Please select a candidate" }),
  position_title: z.string().trim().min(1, { message: "Position title is required" }).max(200),
  salary_offered: z.number().positive({ message: "Salary must be positive" }).optional(),
  commission_rate: z.number().min(0).max(100, { message: "Commission rate must be between 0 and 100" }).optional(),
  commission_amount: z.number().min(0).optional(),
  placement_date: z.string(),
  start_date: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type Placement = {
  id: string;
  position_title: string;
  salary_offered: number | null;
  commission_amount: number | null;
  commission_status: string;
  placement_date: string;
  start_date: string | null;
  client_id: string;
  candidate_id: string;
};

type Client = {
  id: string;
  company_name: string;
};

type Candidate = {
  id: string;
  full_name: string;
};

const Placements = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    client_id: "",
    candidate_id: "",
    position_title: "",
    salary_offered: "",
    commission_rate: "",
    commission_amount: "",
    placement_date: new Date().toISOString().split('T')[0],
    start_date: "",
    notes: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    loadData(user.id);
  };

  const loadData = async (uid: string) => {
    setLoading(true);
    
    // Load placements with client and candidate names
    const { data: placementsData, error: placementsError } = await supabase
      .from('placements')
      .select(`
        *,
        clients!inner(company_name),
        profiles!placements_candidate_id_fkey(full_name)
      `)
      .eq('recruiter_id', uid)
      .order('placement_date', { ascending: false });

    if (placementsError) {
      toast.error("Failed to load placements");
      console.error(placementsError);
    } else {
      setPlacements(placementsData || []);
    }

    // Load clients for dropdown
    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, company_name')
      .eq('recruiter_id', uid)
      .eq('status', 'active');
    
    setClients(clientsData || []);

    // Load candidates for dropdown - only those recruiter has access to
    // Get candidates who applied to recruiter's client jobs
    const { data: applicantCandidates } = await supabase
      .from('applications')
      .select(`
        candidate_id,
        profiles!applications_candidate_id_fkey(id, full_name),
        jobs!inner(
          client_id,
          clients!inner(recruiter_id)
        )
      `)
      .eq('jobs.clients.recruiter_id', uid);

    // Get candidates from unlocked profiles (if recruiter also acts as employer)
    const { data: unlockedCandidates } = await supabase
      .from('profile_unlocks')
      .select('candidate_id, profiles!profile_unlocks_candidate_id_fkey(id, full_name)')
      .eq('employer_id', uid);

    // Combine and deduplicate candidates
    const candidateMap = new Map<string, Candidate>();
    
    applicantCandidates?.forEach(item => {
      const profile = (item.profiles as any);
      if (profile?.id && profile?.full_name) {
        candidateMap.set(profile.id, { id: profile.id, full_name: profile.full_name });
      }
    });

    unlockedCandidates?.forEach(item => {
      const profile = (item.profiles as any);
      if (profile?.id && profile?.full_name) {
        candidateMap.set(profile.id, { id: profile.id, full_name: profile.full_name });
      }
    });

    const uniqueCandidates = Array.from(candidateMap.values())
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
    
    setCandidates(uniqueCandidates);

    setLoading(false);
  };

  const handleSubmit = async () => {
    try {
      const validatedData = placementSchema.parse({
        ...formData,
        salary_offered: formData.salary_offered ? Number(formData.salary_offered) : undefined,
        commission_rate: formData.commission_rate ? Number(formData.commission_rate) : undefined,
        commission_amount: formData.commission_amount ? Number(formData.commission_amount) : undefined,
      });

      const { error } = await supabase
        .from('placements')
        .insert({
          recruiter_id: userId,
          client_id: validatedData.client_id,
          candidate_id: validatedData.candidate_id,
          position_title: validatedData.position_title,
          salary_offered: validatedData.salary_offered,
          commission_rate: validatedData.commission_rate,
          commission_amount: validatedData.commission_amount,
          placement_date: validatedData.placement_date,
          start_date: validatedData.start_date,
          notes: validatedData.notes,
        });

      if (error) throw error;

      toast.success("Placement recorded successfully!");
      setDialogOpen(false);
      loadData(userId);
      resetForm();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to record placement");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      candidate_id: "",
      position_title: "",
      salary_offered: "",
      commission_rate: "",
      commission_amount: "",
      placement_date: new Date().toISOString().split('T')[0],
      start_date: "",
      notes: "",
    });
  };

  const filteredPlacements = placements.filter(p => {
    if (filter === "all") return true;
    return p.commission_status === filter;
  });

  const totalCommissions = placements
    .filter(p => p.commission_status === 'completed')
    .reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0);

  const pendingCommissions = placements
    .filter(p => p.commission_status === 'pending')
    .reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0);

  return (
    <>
      <SEO 
        title="My Placements" 
        description="Manage your candidate placements and track commissions"
      />
      <Navigation />
      <div className="container py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Placements</h1>
          <p className="text-muted-foreground">
            Track your successful placements and commission earnings
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-primary" />
                Total Placements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{placements.length}</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PoundSterling className="h-5 w-5 text-green-500" />
                Completed Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">
                £{totalCommissions.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Pending Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-500">
                £{pendingCommissions.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Placement History</CardTitle>
                <CardDescription>View and manage all your placements</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Record New Placement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Record New Placement</DialogTitle>
                    <DialogDescription>
                      Log a successful candidate placement
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client_id">Client Company *</Label>
                        <Select value={formData.client_id} onValueChange={(val) => setFormData({...formData, client_id: val})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="candidate_id">Candidate *</Label>
                        <Select value={formData.candidate_id} onValueChange={(val) => setFormData({...formData, candidate_id: val})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select candidate" />
                          </SelectTrigger>
                          <SelectContent>
                            {candidates.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position_title">Position Title *</Label>
                      <Input
                        id="position_title"
                        value={formData.position_title}
                        onChange={(e) => setFormData({...formData, position_title: e.target.value})}
                        placeholder="Senior Software Engineer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary_offered">Salary Offered ($)</Label>
                        <Input
                          id="salary_offered"
                          type="number"
                          value={formData.salary_offered}
                          onChange={(e) => setFormData({...formData, salary_offered: e.target.value})}
                          placeholder="120000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                        <Input
                          id="commission_rate"
                          type="number"
                          step="0.1"
                          value={formData.commission_rate}
                          onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commission_amount">Commission Amount ($)</Label>
                      <Input
                        id="commission_amount"
                        type="number"
                        value={formData.commission_amount}
                        onChange={(e) => setFormData({...formData, commission_amount: e.target.value})}
                        placeholder="18000"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="placement_date">Placement Date *</Label>
                        <Input
                          id="placement_date"
                          type="date"
                          value={formData.placement_date}
                          onChange={(e) => setFormData({...formData, placement_date: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional placement details..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button variant="hero" onClick={handleSubmit} className="flex-1">
                        Record Placement
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={setFilter} className="mb-4">
              <TabsList>
                <TabsTrigger value="all">All Placements</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading placements...</div>
            ) : filteredPlacements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No placements found. Record your first placement to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Placement Date</TableHead>
                      <TableHead className="text-right">Salary</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlacements.map((placement: any) => (
                      <TableRow key={placement.id}>
                        <TableCell className="font-medium">
                          {placement.profiles?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{placement.clients?.company_name || 'N/A'}</TableCell>
                        <TableCell>{placement.position_title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(placement.placement_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {placement.salary_offered 
                            ? `$${Number(placement.salary_offered).toLocaleString()}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {placement.commission_amount 
                            ? `$${Number(placement.commission_amount).toLocaleString()}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={placement.commission_status === 'completed' ? 'default' : 'secondary'}>
                            {placement.commission_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Placements;
