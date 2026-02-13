import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Plus, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const APIKeyManagement = () => {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("marketplace_api_keys")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const keyBytes = new Uint8Array(32);
      crypto.getRandomValues(keyBytes);
      const fullKey = "cyd_" + Array.from(keyBytes).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 48);
      const prefix = fullKey.slice(0, 8);
      // Simple hash for storage (in production you'd use a proper hash)
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(fullKey));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const { error } = await supabase.from("marketplace_api_keys").insert({
        profile_id: user.id,
        name: newKeyName || "Untitled Key",
        key_hash: hashHex,
        key_prefix: prefix,
        is_active: true,
      });
      if (error) throw error;
      return fullKey;
    },
    onSuccess: (apiKey) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setNewlyCreatedKey(apiKey);
      setNewKeyName("");
      toast.success("API key created. Copy it now — it won't be shown again.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase.from("marketplace_api_keys").delete().eq("id", keyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked");
    },
  });

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Key className="h-5 w-5 text-primary" />
          API Keys
        </CardTitle>
        <CardDescription>
          Generate keys to access the Cydena Marketplace REST API programmatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Key name (e.g. Production, Staging)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-1" /> Create Key
          </Button>
        </div>

        {newlyCreatedKey && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
            <p className="text-sm font-medium text-primary">New API Key Created — Copy it now!</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background p-2 rounded font-mono break-all">
                {newlyCreatedKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(newlyCreatedKey);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setNewlyCreatedKey(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading keys...</p>
        ) : keys?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No API keys yet. Create one to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys?.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell>
                    <code className="text-xs font-mono">{k.key_prefix}••••••••</code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {k.created_at ? format(new Date(k.created_at), "dd MMM yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={k.is_active ? "default" : "secondary"} className="text-xs">
                      {k.is_active ? "Active" : "Revoked"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(k.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
