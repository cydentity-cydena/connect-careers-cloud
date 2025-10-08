import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Briefcase, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  company_name: string;
  industry: string | null;
  contact_name: string | null;
  contact_email: string | null;
  status: string;
  created_at: string;
}

interface RecruiterClientsListProps {
  recruiterId: string;
}

const RecruiterClientsList = ({ recruiterId }: RecruiterClientsListProps) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (recruiterId) {
      loadClients();
    }
  }, [recruiterId]);

  const loadClients = async () => {
    setLoading(true);
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });

    if (clientsData) {
      setClients(clientsData);
      
      // Load job counts for each client
      const counts: Record<string, number> = {};
      for (const client of clientsData) {
        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('is_active', true);
        counts[client.id] = count || 0;
      }
      setJobCounts(counts);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading clients...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <Building2 className="h-12 w-12 mx-auto opacity-50 text-muted-foreground" />
        <p className="text-muted-foreground">No clients yet. Add your first client to get started!</p>
        <Button variant="hero" onClick={() => navigate('/clients/create')}>
          <Building2 className="h-4 w-4 mr-2" />
          Add First Client
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <Card key={client.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">{client.company_name}</h3>
                    {client.contact_name && (
                      <p className="text-sm text-muted-foreground">Contact: {client.contact_name}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {client.industry && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {client.industry}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1">
                    <Briefcase className="h-3 w-3" />
                    {jobCounts[client.id] || 0} Active Jobs
                  </Badge>
                  <Badge 
                    variant={client.status === 'active' ? 'default' : 'secondary'}
                  >
                    {client.status}
                  </Badge>
                </div>

                {client.contact_email && (
                  <p className="text-sm text-muted-foreground">
                    {client.contact_email}
                  </p>
                )}
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/jobs/create')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Post Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecruiterClientsList;
