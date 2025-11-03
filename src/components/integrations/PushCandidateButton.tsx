import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Webhook, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PushCandidateButtonProps {
  candidateId: string;
  candidateName?: string;
}

export function PushCandidateButton({ candidateId, candidateName }: PushCandidateButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<{type: string; id: string} | null>(null);
  const { toast } = useToast();

  const { data: webhooks } = useQuery({
    queryKey: ["webhooks-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_integrations")
        .select("*")
        .eq("active", true);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: atsConnections } = useQuery({
    queryKey: ["ats-connections-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ats_connections")
        .select("*")
        .eq("active", true);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const pushMutation = useMutation({
    mutationFn: async () => {
      if (!selectedIntegration) throw new Error("No integration selected");

      const isWebhook = selectedIntegration.type === "webhook";
      const functionName = isWebhook ? "push-candidate-webhook" : "push-candidate-ats";
      
      const payload = isWebhook
        ? { candidateId, webhookId: selectedIntegration.id }
        : { candidateId, atsConnectionId: selectedIntegration.id };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Push failed");

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Candidate pushed successfully",
        description: `${candidateName || "Candidate"} has been sent to the integration`,
      });
      setOpen(false);
      setSelectedIntegration(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to push candidate",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const allIntegrations = [
    ...(webhooks || []).map((w) => ({ ...w, type: "webhook" as const })),
    ...(atsConnections || []).map((a) => ({ ...a, type: "ats" as const })),
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Send className="h-4 w-4 mr-2" />
          Push to ATS
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Push Candidate to Integration</DialogTitle>
          <DialogDescription>
            Send {candidateName || "this candidate"}'s verified profile to your ATS or webhook
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {allIntegrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No active integrations found</p>
              <Button variant="outline" onClick={() => window.location.href = "/integrations"}>
                Set up integrations
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Integration</label>
                <div className="space-y-2">
                  {allIntegrations.map((integration) => (
                    <div
                      key={integration.id}
                      onClick={() => setSelectedIntegration({ type: integration.type, id: integration.id })}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedIntegration?.id === integration.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {integration.type === "webhook" ? (
                        <Webhook className="h-5 w-5 text-primary" />
                      ) : (
                        <Settings className="h-5 w-5 text-primary" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{integration.name}</p>
                        {integration.type === "ats" && (
                          <Badge variant="outline" className="capitalize mt-1">
                            {(integration as any).provider}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {allIntegrations.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => pushMutation.mutate()}
              disabled={!selectedIntegration || pushMutation.isPending}
            >
              {pushMutation.isPending ? "Pushing..." : "Push Candidate"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}