import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Store, Eye, Zap, Globe } from "lucide-react";
import { toast } from "sonner";

interface MarketplaceSettingsProps {
  userId: string;
}

export const MarketplaceSettings = ({ userId }: MarketplaceSettingsProps) => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["marketplace-settings", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<Record<string, any>>({});

  // Merge profile data with local form state
  const getValue = (key: string, fallback: any = "") =>
    form[key] !== undefined ? form[key] : profile?.[key] ?? fallback;

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = {
        is_marketplace_visible: getValue("is_marketplace_visible", false),
        marketplace_headline: getValue("marketplace_headline", ""),
        day_rate_gbp: getValue("day_rate_gbp", null) ? Number(getValue("day_rate_gbp")) : null,
        hourly_rate_gbp: getValue("hourly_rate_gbp", null) ? Number(getValue("hourly_rate_gbp")) : null,
        availability_status: getValue("availability_status", "available"),
        security_clearance: getValue("security_clearance", "none"),
        ir35_status: getValue("ir35_status", ""),
        is_api_bookable: getValue("is_api_bookable", false),
        is_mcp_bookable: getValue("is_mcp_bookable", false),
        response_time_hours: getValue("response_time_hours", 24) ? Number(getValue("response_time_hours", 24)) : 24,
        professional_statement: getValue("professional_statement", ""),
        updated_at: new Date().toISOString(),
      };

      if (profile) {
        const { error } = await supabase
          .from("candidate_profiles")
          .update(updates)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("candidate_profiles")
          .insert({ ...updates, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-settings"] });
      toast.success("Marketplace settings saved");
      setForm({});
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>;

  const isVisible = getValue("is_marketplace_visible", false);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Store className="h-5 w-5 text-primary" />
          Marketplace Profile
        </CardTitle>
        <CardDescription>
          Control how you appear in the Cydena talent marketplace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">Marketplace Visibility</p>
              <p className="text-xs text-muted-foreground">Make your profile discoverable by clients and AI agents</p>
            </div>
          </div>
          <Switch
            checked={isVisible}
            onCheckedChange={(v) => updateField("is_marketplace_visible", v)}
          />
        </div>

        {isVisible && (
          <>
            {/* Headline */}
            <div className="space-y-2">
              <Label>Marketplace Headline</Label>
              <Input
                placeholder="e.g. Senior Penetration Tester | OSCP | Cloud Security"
                value={getValue("marketplace_headline")}
                onChange={(e) => updateField("marketplace_headline", e.target.value)}
              />
            </div>

            {/* Professional Statement */}
            <div className="space-y-2">
              <Label>Professional Statement</Label>
              <Textarea
                placeholder="Brief description of your expertise and what you offer..."
                value={getValue("professional_statement")}
                onChange={(e) => updateField("professional_statement", e.target.value)}
                rows={3}
              />
            </div>

            {/* Rates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day Rate (£)</Label>
                <Input
                  type="number"
                  placeholder="650"
                  value={getValue("day_rate_gbp", "")}
                  onChange={(e) => updateField("day_rate_gbp", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate (£)</Label>
                <Input
                  type="number"
                  placeholder="85"
                  value={getValue("hourly_rate_gbp", "")}
                  onChange={(e) => updateField("hourly_rate_gbp", e.target.value)}
                />
              </div>
            </div>

            {/* Availability & Clearance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={getValue("availability_status", "available")}
                  onValueChange={(v) => updateField("availability_status", v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy (limited)</SelectItem>
                    <SelectItem value="on_engagement">On Engagement</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Security Clearance</Label>
                <Select
                  value={getValue("security_clearance", "none")}
                  onValueChange={(v) => updateField("security_clearance", v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="BPSS">BPSS</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="DV">DV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* IR35 & Response Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IR35 Status</Label>
                <Select
                  value={getValue("ir35_status", "")}
                  onValueChange={(v) => updateField("ir35_status", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inside">Inside IR35</SelectItem>
                    <SelectItem value="outside">Outside IR35</SelectItem>
                    <SelectItem value="not_applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Response Time (hours)</Label>
                <Input
                  type="number"
                  placeholder="24"
                  value={getValue("response_time_hours", 24)}
                  onChange={(e) => updateField("response_time_hours", e.target.value)}
                />
              </div>
            </div>

            {/* API/MCP Bookable */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Programmatic Access</Label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Allow API booking</span>
                </div>
                <Switch
                  checked={getValue("is_api_bookable", false)}
                  onCheckedChange={(v) => updateField("is_api_bookable", v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Allow MCP booking (AI agents)</span>
                </div>
                <Switch
                  checked={getValue("is_mcp_bookable", false)}
                  onCheckedChange={(v) => updateField("is_mcp_bookable", v)}
                />
              </div>
            </div>
          </>
        )}

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending ? "Saving..." : "Save Marketplace Settings"}
        </Button>

        {isVisible && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {getValue("availability_status", "available")}
            </Badge>
            <span>•</span>
            <span>Your profile will appear in marketplace search results</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
