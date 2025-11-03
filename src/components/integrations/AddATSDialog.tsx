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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddATSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddATSDialog({ open, onOpenChange }: AddATSDialogProps) {
  const [provider, setProvider] = useState<string>("");
  const [name, setName] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addATSMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("ats_connections").insert({
        user_id: user.id,
        provider: provider as any,
        name,
        credentials,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ats-connections"] });
      toast({ title: "ATS connection added successfully" });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add ATS connection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setProvider("");
    setName("");
    setCredentials({});
  };

  const renderCredentialFields = () => {
    switch (provider) {
      case "workday":
        return (
          <>
            <div className="space-y-2">
              <Label>API URL</Label>
              <Input
                placeholder="https://your-tenant.workday.com/api"
                value={credentials.api_url || ""}
                onChange={(e) => setCredentials({ ...credentials, api_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={credentials.username || ""}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={credentials.password || ""}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </>
        );
      case "greenhouse":
        return (
          <>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="Your Greenhouse API key"
                value={credentials.api_key || ""}
                onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Found in Greenhouse → Configure → Dev Center → API Credential Management
              </p>
            </div>
          </>
        );
      case "lever":
        return (
          <>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="Your Lever API key"
                value={credentials.api_key || ""}
                onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
              />
            </div>
          </>
        );
      case "bamboohr":
        return (
          <>
            <div className="space-y-2">
              <Label>Subdomain</Label>
              <Input
                placeholder="yourcompany"
                value={credentials.subdomain || ""}
                onChange={(e) => setCredentials({ ...credentials, subdomain: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                From yourcompany.bamboohr.com
              </p>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="Your BambooHR API key"
                value={credentials.api_key || ""}
                onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect ATS Platform</DialogTitle>
          <DialogDescription>
            Native integration with your ATS for seamless candidate data transfer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>ATS Platform</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select ATS platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workday">Workday</SelectItem>
                <SelectItem value="greenhouse">Greenhouse</SelectItem>
                <SelectItem value="lever">Lever</SelectItem>
                <SelectItem value="bamboohr">BambooHR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {provider && (
            <>
              <div className="space-y-2">
                <Label>Connection Name</Label>
                <Input
                  placeholder="e.g., Production Workday"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {renderCredentialFields()}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => addATSMutation.mutate()}
            disabled={!provider || !name || addATSMutation.isPending}
          >
            {addATSMutation.isPending ? "Connecting..." : "Connect ATS"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}