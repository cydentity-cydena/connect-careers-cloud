import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Trash2, Plus, Search } from "lucide-react";

const TIERS = [
  { value: "employer_starter", label: "Employer Starter" },
  { value: "employer_growth", label: "Employer Growth" },
  { value: "employer_scale", label: "Employer Scale" },
  { value: "recruiter_pro", label: "Recruiter Pro" },
];

export default function SubscriptionOverrides() {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedTier, setSelectedTier] = useState("employer_growth");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);

  const { data: overrides, isLoading } = useQuery({
    queryKey: ["subscription-overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_overrides" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch profile info for each override
      const userIds = (data as any[]).map((o: any) => o.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, username")
        .in("id", userIds);

      return (data as any[]).map((o: any) => ({
        ...o,
        profile: profiles?.find((p) => p.id === o.user_id),
      }));
    },
  });

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, username")
      .ilike("email", `%${searchEmail.trim()}%`)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      toast.error("User not found");
      setFoundUser(null);
      return;
    }
    setFoundUser(data);
  };

  const grantOverride = useMutation({
    mutationFn: async () => {
      if (!foundUser) throw new Error("No user selected");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("subscription_overrides" as any).upsert({
        user_id: foundUser.id,
        tier: selectedTier,
        reason: reason || null,
        granted_by: user.id,
        is_active: true,
        expires_at: expiresAt || null,
      }, { onConflict: "user_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Subscription override granted");
      queryClient.invalidateQueries({ queryKey: ["subscription-overrides"] });
      setFoundUser(null);
      setSearchEmail("");
      setReason("");
      setExpiresAt("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const revokeOverride = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subscription_overrides" as any)
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Override revoked");
      queryClient.invalidateQueries({ queryKey: ["subscription-overrides"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Grant Subscription Override
          </CardTitle>
          <CardDescription>
            Allow an employer or recruiter to browse without a paid subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUser()}
            />
            <Button variant="outline" onClick={searchUser}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {foundUser && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <p className="font-medium">{foundUser.full_name || foundUser.username || "No name"}</p>
              <p className="text-sm text-muted-foreground">{foundUser.email}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIERS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Expires (optional)"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />

                <Input
                  placeholder="Reason (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <Button onClick={() => grantOverride.mutate()} disabled={grantOverride.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Grant Override
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Overrides</CardTitle>
          <CardDescription>Users with admin-granted subscription access</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !overrides?.length ? (
            <p className="text-muted-foreground text-sm text-center py-4">No overrides granted yet.</p>
          ) : (
            <div className="space-y-3">
              {overrides.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="space-y-1">
                    <p className="font-medium">{o.profile?.full_name || o.profile?.username || o.user_id}</p>
                    <p className="text-sm text-muted-foreground">{o.profile?.email}</p>
                    <div className="flex gap-2 items-center">
                      <Badge variant={o.is_active ? "default" : "secondary"}>
                        {o.is_active ? "Active" : "Revoked"}
                      </Badge>
                      <Badge variant="outline">{o.tier}</Badge>
                      {o.expires_at && (
                        <span className="text-xs text-muted-foreground">
                          Expires: {new Date(o.expires_at).toLocaleDateString()}
                        </span>
                      )}
                      {o.reason && (
                        <span className="text-xs text-muted-foreground">— {o.reason}</span>
                      )}
                    </div>
                  </div>
                  {o.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeOverride.mutate(o.id)}
                      disabled={revokeOverride.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
