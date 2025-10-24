import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Briefcase, User, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Placement {
  id: string;
  position_title: string;
  placement_date: string;
  salary_offered: number | null;
  commission_amount: number | null;
  commission_status: string;
  start_date: string | null;
  notes: string | null;
  client_id: string | null;
}

interface RecruiterPlacementsProps {
  recruiterId: string;
}

const RecruiterPlacements = ({ recruiterId }: RecruiterPlacementsProps) => {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (recruiterId) {
      loadPlacements();
    }
  }, [recruiterId]);

  const loadPlacements = async () => {
    setLoading(true);
    const { data: placementsData } = await supabase
      .from('placements')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('placement_date', { ascending: false })
      .limit(5);

    if (placementsData) {
      setPlacements(placementsData);
      
      // Load client names
      const clientIds = placementsData
        .map(p => p.client_id)
        .filter((id): id is string => id !== null);
      
      if (clientIds.length > 0) {
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, company_name')
          .in('id', clientIds);
        
        if (clientsData) {
          const names: Record<string, string> = {};
          clientsData.forEach(client => {
            names[client.id] = client.company_name;
          });
          setClientNames(names);
        }
      }
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading placements...</div>;
  }

  if (placements.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <User className="h-12 w-12 mx-auto opacity-50 text-muted-foreground" />
        <p className="text-muted-foreground">No placements yet. Start sourcing candidates to track your success!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {placements.map((placement) => (
        <Card key={placement.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    {placement.position_title}
                  </h3>
                  {placement.client_id && clientNames[placement.client_id] && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {clientNames[placement.client_id]}
                    </p>
                  )}
                </div>
                <Badge 
                  variant={
                    placement.commission_status === 'completed' ? 'default' :
                    placement.commission_status === 'pending' ? 'secondary' :
                    'outline'
                  }
                >
                  {placement.commission_status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Placed {formatDistanceToNow(new Date(placement.placement_date), { addSuffix: true })}
                  </span>
                </div>
                {placement.commission_amount && (
                  <div className="flex items-center gap-2 text-green-500">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">
                      £{Number(placement.commission_amount).toLocaleString()} commission
                    </span>
                  </div>
                )}
              </div>

              {placement.salary_offered && (
                <p className="text-sm text-muted-foreground">
                  Salary: £{placement.salary_offered.toLocaleString()}/year
                </p>
              )}

              {placement.notes && (
                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                  {placement.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecruiterPlacements;
