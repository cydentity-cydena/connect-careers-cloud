import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function IntegrationLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["integration-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      
      // Fetch candidate names separately
      const logsWithNames = await Promise.all((data || []).map(async (log) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", log.candidate_id)
          .single();
        return { ...log, profile };
      }));
      
      return logsWithNames;
    },
  });

  if (isLoading) {
    return <p>Loading logs...</p>;
  }

  if (!logs || logs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">No integration logs yet</h3>
        <p className="text-sm text-muted-foreground">
          Logs will appear here when candidates are pushed to integrations
        </p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {log.status === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : log.status === "failed" ? (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">
                      {log.integration_type}
                    </Badge>
                    <Badge variant={log.status === "success" ? "default" : log.status === "failed" ? "destructive" : "secondary"}>
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    {log.profile?.full_name || log.profile?.email || "Unknown candidate"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                  {log.error_message && (
                    <p className="text-xs text-red-500 mt-2">{log.error_message}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}