import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileSpreadsheet, Users, UserCheck, Mail } from "lucide-react";
import { format } from "date-fns";

interface ImportBatch {
  id: string;
  batch_name: string;
  import_date: string;
  total_candidates: number;
  activated_candidates: number;
  invited_candidates: number;
  file_name: string | null;
  notes: string | null;
}

export function ImportBatchesView() {
  const { data: batches, isLoading } = useQuery({
    queryKey: ["import-batches"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('recruiter_candidate_imports')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('import_date', { ascending: false });

      if (error) throw error;
      return data as ImportBatch[];
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading import history...</div>;
  }

  if (!batches || batches.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No imports yet. Upload your first candidate database to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {batches.map((batch) => {
        const activationRate = batch.total_candidates > 0 
          ? (batch.activated_candidates / batch.total_candidates) * 100 
          : 0;
        const invitationRate = batch.total_candidates > 0
          ? (batch.invited_candidates / batch.total_candidates) * 100
          : 0;

        return (
          <Card key={batch.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    {batch.batch_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Imported {format(new Date(batch.import_date), 'PPP')}
                  </p>
                  {batch.file_name && (
                    <p className="text-xs text-muted-foreground">
                      File: {batch.file_name}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  {batch.total_candidates}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {batch.notes && (
                <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
                  {batch.notes}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      Invited
                    </span>
                    <span className="font-medium">{batch.invited_candidates} / {batch.total_candidates}</span>
                  </div>
                  <Progress value={invitationRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">{invitationRate.toFixed(0)}% invited</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5" />
                      Activated
                    </span>
                    <span className="font-medium">{batch.activated_candidates} / {batch.total_candidates}</span>
                  </div>
                  <Progress value={activationRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">{activationRate.toFixed(0)}% activation rate</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium">
                      {batch.total_candidates - batch.activated_candidates}
                    </span>
                  </div>
                  <Progress 
                    value={((batch.total_candidates - batch.activated_candidates) / batch.total_candidates) * 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {(((batch.total_candidates - batch.activated_candidates) / batch.total_candidates) * 100).toFixed(0)}% pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}