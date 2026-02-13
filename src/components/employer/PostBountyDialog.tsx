import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface PostBountyDialogProps {
  onSuccess?: () => void;
}

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

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
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
      });

      if (error) throw error;

      toast.success("Bounty posted successfully!");
      setOpen(false);
      resetForm();
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

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !description.trim()}
          >
            {loading ? "Posting..." : "Post Bounty"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
