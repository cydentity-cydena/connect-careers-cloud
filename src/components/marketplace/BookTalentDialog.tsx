import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Send } from "lucide-react";
import { toast } from "sonner";

interface BookTalentDialogProps {
  talentUserId: string;
  talentName: string;
  dayRate?: number | null;
}

export const BookTalentDialog = ({ talentUserId, talentName, dayRate }: BookTalentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rateType, setRateType] = useState("day");

  const bookMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to book talent");

      const { error } = await supabase.from("marketplace_engagements").insert({
        client_id: user.id,
        talent_id: talentUserId,
        title,
        description,
        start_date: startDate || null,
        end_date: endDate || null,
        agreed_rate_gbp: dayRate || 0,
        engagement_type: rateType === "fixed" ? "project" : "contract",
        status: "pending",
        source: "platform",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Booking request sent to ${talentName}`);
      setOpen(false);
      setTitle("");
      setDescription("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="cyber">
          <Calendar className="h-3.5 w-3.5 mr-1.5" /> Book
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {talentName}</DialogTitle>
          <DialogDescription>
            Send a booking request. They'll be notified and can accept or discuss terms.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Engagement Title</Label>
            <Input
              placeholder="e.g. Penetration Test — Web Application"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the scope, deliverables, and any requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rate Type</Label>
              <Select value={rateType} onValueChange={setRateType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day Rate</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agreed Rate (£)</Label>
              <Input type="number" defaultValue={dayRate || ""} disabled className="bg-muted/30" />
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => bookMutation.mutate()}
            disabled={bookMutation.isPending || !title}
          >
            <Send className="h-4 w-4 mr-2" />
            {bookMutation.isPending ? "Sending..." : "Send Booking Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
