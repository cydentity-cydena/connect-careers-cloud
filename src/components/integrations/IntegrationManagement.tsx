import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Webhook, Settings, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddWebhookDialog } from "./AddWebhookDialog";
import { AddATSDialog } from "./AddATSDialog";
import { IntegrationLogs } from "./IntegrationLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function IntegrationManagement() {
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [showATSDialog, setShowATSDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: webhooks, isLoading: webhooksLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_integrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: atsConnections, isLoading: atsLoading } = useQuery({
    queryKey: ["ats-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ats_connections")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("webhook_integrations")
        .update({ active: !active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast({ title: "Webhook status updated" });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("webhook_integrations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast({ title: "Webhook deleted" });
    },
  });

  const toggleATSMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("ats_connections")
        .update({ active: !active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ats-connections"] });
      toast({ title: "ATS connection status updated" });
    },
  });

  const deleteATSMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ats_connections")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ats-connections"] });
      toast({ title: "ATS connection deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">ATS Integrations</h2>
          <p className="text-muted-foreground">Push verified candidates to your ATS or custom webhooks</p>
        </div>
      </div>

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="ats">ATS Platforms</TabsTrigger>
          <TabsTrigger value="logs">Integration Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Connect to any system via webhooks (Zapier, Make, custom endpoints)
            </p>
            <Button onClick={() => setShowWebhookDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </div>

          {webhooksLoading ? (
            <p>Loading webhooks...</p>
          ) : webhooks && webhooks.length > 0 ? (
            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Webhook className="h-5 w-5 mt-1 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{webhook.name}</h3>
                          <Badge variant={webhook.active ? "default" : "secondary"}>
                            {webhook.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 break-all">
                          {webhook.webhook_url}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {webhook.trigger_on_verification && "Triggers on candidate verification"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWebhookMutation.mutate({ id: webhook.id, active: webhook.active })}
                      >
                        {webhook.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No webhooks configured</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a webhook to automatically push verified candidates to any system
              </p>
              <Button onClick={() => setShowWebhookDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Webhook
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ats" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Native integrations with popular ATS platforms
            </p>
            <Button onClick={() => setShowATSDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Connect ATS
            </Button>
          </div>

          {atsLoading ? (
            <p>Loading ATS connections...</p>
          ) : atsConnections && atsConnections.length > 0 ? (
            <div className="grid gap-4">
              {atsConnections.map((ats) => (
                <Card key={ats.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Settings className="h-5 w-5 mt-1 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{ats.name}</h3>
                          <Badge variant="outline" className="capitalize">
                            {ats.provider}
                          </Badge>
                          <Badge variant={ats.active ? "default" : "secondary"}>
                            {ats.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Connected {new Date(ats.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleATSMutation.mutate({ id: ats.id, active: ats.active })}
                      >
                        {ats.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteATSMutation.mutate(ats.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No ATS connections</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect to Workday, Greenhouse, Lever, or BambooHR
              </p>
              <Button onClick={() => setShowATSDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Connect Your First ATS
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <IntegrationLogs />
        </TabsContent>
      </Tabs>

      <AddWebhookDialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog} />
      <AddATSDialog open={showATSDialog} onOpenChange={setShowATSDialog} />
    </div>
  );
}