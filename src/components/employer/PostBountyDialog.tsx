import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { useSubscription, SubscriptionTier } from "@/hooks/useSubscription";

interface PostBountyDialogProps {
  onSuccess?: () => void;
}

const TIER_BOUNTY_LIMITS: Record<string, number> = {
  employer_starter: 2,
  employer_growth: 10,
  employer_scale: 999,
  recruiter_pro: 5,
  enterprise: 999,
};

const FEATURED_FEE_GBP = 35;
const COMMISSION_RATE = 0.15;

export const PostBountyDialog = ({ onSuccess }: PostBountyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [engagementType, setEngagementType] = useState("fixed");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [requiredClearance, setRequiredClearance] = useState("none");
  const [locationRequirement, setLocationRequirement] = useState("remote");
  const [locationCity, setLocationCity] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const { tier, subscribed } = useSubscription();

  const { data: categories } = useQuery({
    queryKey: ["task-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: monthlyCount, refetch: refetchCount } = useQuery({
    queryKey: ["monthly-bounty-count"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { data, error } = await supabase.rpc("count_monthly_bounties", { p_user_id: user.id });
      if (error) throw error;
      return data as number;
    },
    enabled: open,
  });

  const monthlyLimit = tier ? (TIER_BOUNTY_LIMITS[tier] ?? 0) : 0;
  const remaining = Math.max(0, monthlyLimit - (monthlyCount ?? 0));
  const isAtLimit = remaining <= 0;
  const isUnlimited = monthlyLimit >= 999;

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (isAtLimit) {
      toast.error("You've reached your monthly bounty limit. Upgrade your plan for more.");
      return;
    }

    const minBudget = parseFloat(budgetMin);
    const maxBudget = parseFloat(budgetMax);
    if (budgetMin && budgetMax && minBudget > maxBudget) {
      toast.error("Minimum budget cannot exceed maximum");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("task_bounties").insert({
        client_id: user.id,
        title: title.trim().slice(0, 200),
        description: description.trim().slice(0, 2000),
        requirements: requirements.trim().slice(0, 2000) || null,
        category_id: categoryId || null,
        engagement_type: engagementType,
        budget_min_gbp: budgetMin ? minBudget : null,
        budget_max_gbp: budgetMax ? maxBudget : null,
        urgency,
        required_clearance: requiredClearance,
        location_requirement: locationRequirement,
        location_city: locationCity.trim().slice(0, 100) || null,
        deadline: deadline || null,
        status: isPublic ? "open" : "invite_only",
        source: "platform",
        is_featured: isFeatured,
        featured_until: isFeatured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        commission_rate: COMMISSION_RATE,
        featured_fee_gbp: isFeatured ? FEATURED_FEE_GBP : 0,
      });

      if (error) throw error;

      toast.success("Bounty posted successfully!");
      setOpen(false);
      resetForm();
      refetchCount();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to post bounty");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRequirements("");
    setCategoryId("");
    setEngagementType("fixed");
    setBudgetMin("");
    setBudgetMax("");
    setUrgency("normal");
    setRequiredClearance("none");
    setLocationRequirement("remote");
    setLocationCity("");
    setDeadline("");
    setIsPublic(true);
    setIsFeatured(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Post Bounty
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Work Bounty</DialogTitle>
          <DialogDescription>
            Describe what you need — qualified candidates will apply.
          </DialogDescription>
        </DialogHeader>

        {/* Tier quota banner */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {!subscribed ? (
                "Subscribe to post bounties"
              ) : isUnlimited ? (
                "Unlimited bounties on your plan"
              ) : (
                <>
                  <span className="font-medium text-foreground">{remaining}</span> of{" "}
                  <span className="font-medium text-foreground">{monthlyLimit}</span> bounties remaining this month
                </>
              )}
            </span>
          </div>
          {!isUnlimited && subscribed && (
            <Badge variant={remaining <= 1 ? "destructive" : "secondary"} className="text-xs">
              {tier?.replace("_", " ")}
            </Badge>
          )}
        </div>

        {isAtLimit && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-destructive">
              You've used all {monthlyLimit} bounty posts this month. Upgrade your subscription to post more.
            </p>
          </div>
        )}

        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="bounty-title">Title *</Label>
            <Input
              id="bounty-title"
              placeholder="e.g. Penetration Test for E-commerce Platform"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="bounty-desc">Description *</Label>
            <Textarea
              id="bounty-desc"
              placeholder="Describe the scope, objectives, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
            />
          </div>

          <div>
            <Label htmlFor="bounty-reqs">Requirements</Label>
            <Textarea
              id="bounty-reqs"
              placeholder="Any specific skills, certifications, or experience needed..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Engagement Type</Label>
              <Select value={engagementType} onValueChange={setEngagementType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="daily">Daily Rate</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget-min">Budget Min (£)</Label>
              <Input
                id="budget-min"
                type="number"
                min="0"
                placeholder="500"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="budget-max">Budget Max (£)</Label>
              <Input
                id="budget-max"
                type="number"
                min="0"
                placeholder="5000"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Urgency</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Required Clearance</Label>
              <Select value={requiredClearance} onValueChange={setRequiredClearance}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="BPSS">BPSS</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="DV">DV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <Select value={locationRequirement} onValueChange={setLocationRequirement}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {locationRequirement !== "remote" && (
              <div>
                <Label htmlFor="location-city">City</Label>
                <Input
                  id="location-city"
                  placeholder="e.g. London"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="font-medium text-sm">Public Bounty</p>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? "Visible on the marketplace — any candidate can apply"
                  : "Invite-only — platform matches qualified talent for you"}
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Featured Bounty upsell */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${isFeatured ? "border-primary bg-primary/5" : "border-border"}`}>
            <div className="flex items-start gap-2">
              <Star className={`h-4 w-4 mt-0.5 ${isFeatured ? "text-primary fill-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="font-medium text-sm">Featured Bounty — £{FEATURED_FEE_GBP}</p>
                <p className="text-xs text-muted-foreground">
                  Pinned at the top of the marketplace for 7 days with a highlighted badge
                </p>
              </div>
            </div>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>

          {/* Commission info */}
          <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">Pricing</p>
            <p>• {Math.round(COMMISSION_RATE * 100)}% platform fee added to the agreed rate, paid by you</p>
            {isFeatured && <p>• £{FEATURED_FEE_GBP} featured listing fee (one-time)</p>}
            <p>• No charge if the bounty expires unfilled</p>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !description.trim() || isAtLimit || !subscribed}
          >
            {loading ? "Posting..." : isFeatured ? `Post Featured Bounty (£${FEATURED_FEE_GBP})` : "Post Bounty"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
