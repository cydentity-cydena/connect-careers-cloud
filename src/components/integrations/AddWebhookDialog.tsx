import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface AddWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWebhookDialog({ open, onOpenChange }: AddWebhookDialogProps) {
  const [name, setName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [triggerOnVerification, setTriggerOnVerification] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addWebhookMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("webhook_integrations").insert({
        user_id: user.id,
        name,
        webhook_url: webhookUrl,
        trigger_on_verification: triggerOnVerification,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast({ title: "Webhook added successfully" });
      setName("");
      setWebhookUrl("");
      setTriggerOnVerification(true);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Webhook Integration</DialogTitle>
          <DialogDescription>
            Connect to any system via webhook. Works with Zapier, Make, or custom endpoints.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Integration Name</Label>
            <Input
              id="name"
              placeholder="e.g., Zapier to Workday"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The endpoint where candidate data will be sent
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-trigger on verification</Label>
              <p className="text-xs text-muted-foreground">
                Automatically push candidates when they're verified
              </p>
            </div>
            <Switch
              checked={triggerOnVerification}
              onCheckedChange={setTriggerOnVerification}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => addWebhookMutation.mutate()}
            disabled={!name || !webhookUrl || addWebhookMutation.isPending}
          >
            {addWebhookMutation.isPending ? "Adding..." : "Add Webhook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}