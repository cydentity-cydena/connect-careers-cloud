import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface AssignPodToEmployerProps {
  podId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PodAssignmentWithProfile {
  id: string;
  pod_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  expires_at: string;
  notes: string;
  profile?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

export const AssignPodToEmployer = ({ podId, open, onOpenChange }: AssignPodToEmployerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: employers, isLoading: loadingEmployers } = useQuery({
    queryKey: ["employers-recruiters", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          email,
          user_roles!inner(role)
        `)
        .or("user_roles.role.eq.employer,user_roles.role.eq.recruiter");

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const { data: assignments, isLoading: loadingAssignments } = useQuery<PodAssignmentWithProfile[]>({
    queryKey: ["pod-assignments", podId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pod_assignments")
        .select("*")
        .eq("pod_id", podId)
        .order("assigned_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const employerIds = data.map(a => a.assigned_to);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, email")
          .in("id", employerIds);

        return data.map(assignment => ({
          ...assignment,
          profile: profiles?.find(p => p.id === assignment.assigned_to)
        }));
      }

      return data;
    },
    enabled: open,
  });

  const assignPodMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployer) return;

      const { error } = await supabase
        .from("pod_assignments")
        .insert({
          pod_id: podId,
          assigned_to: selectedEmployer,
          expires_at: expiryDate?.toISOString(),
          notes,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pod assigned successfully");
      setSelectedEmployer(null);
      setExpiryDate(undefined);
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["pod-assignments", podId] });
      queryClient.invalidateQueries({ queryKey: ["candidate-pods"] });
    },
    onError: (error) => {
      toast.error("Failed to assign pod: " + error.message);
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("pod_assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Assignment removed");
      queryClient.invalidateQueries({ queryKey: ["pod-assignments", podId] });
      queryClient.invalidateQueries({ queryKey: ["candidate-pods"] });
    },
    onError: (error) => {
      toast.error("Failed to remove assignment: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Pod to Employer/Recruiter</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Assignments */}
          <div>
            <h3 className="font-semibold mb-3">Current Assignments</h3>
            <div className="space-y-2">
              {loadingAssignments ? (
                <div className="text-center py-4">Loading assignments...</div>
              ) : assignments && assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={assignment.profile?.avatar_url || ""} />
                        <AvatarFallback>
                          {assignment.profile?.full_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {assignment.profile?.full_name || assignment.profile?.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.profile?.email}
                        </p>
                        {assignment.expires_at && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(assignment.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                      disabled={removeAssignmentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No assignments yet</p>
              )}
            </div>
          </div>

          {/* Add New Assignment */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Add New Assignment</h3>
            
            <div>
              <Label htmlFor="search-employer">Search Employer/Recruiter</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-employer"
                  placeholder="Search by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-2">
              {loadingEmployers ? (
                <div className="text-center py-4">Loading...</div>
              ) : employers && employers.length > 0 ? (
                employers.map((employer) => (
                  <div
                    key={employer.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                      selectedEmployer === employer.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedEmployer(employer.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employer.avatar_url || ""} />
                      <AvatarFallback>
                        {employer.full_name?.[0] || employer.username?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {employer.full_name || employer.username || "Unknown"}
                      </p>
                      <p className="text-sm opacity-80">{employer.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No employers/recruiters found
                </div>
              )}
            </div>

            <div>
              <Label>Expiry Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : "No expiry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this assignment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button
              onClick={() => assignPodMutation.mutate()}
              disabled={!selectedEmployer || assignPodMutation.isPending}
              className="w-full"
            >
              {assignPodMutation.isPending ? "Assigning..." : "Assign Pod"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
