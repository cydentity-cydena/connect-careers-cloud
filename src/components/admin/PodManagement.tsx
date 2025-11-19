import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Users, UserPlus, Building2, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AddCandidatesToPod } from "./AddCandidatesToPod";
import { AssignPodToEmployer } from "./AssignPodToEmployer";
import { PodMembers } from "./PodMembers";

export const PodManagement = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newPodName, setNewPodName] = useState("");
  const [newPodDescription, setNewPodDescription] = useState("");
  const [editPodName, setEditPodName] = useState("");
  const [editPodDescription, setEditPodDescription] = useState("");
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
  const [addCandidatesOpen, setAddCandidatesOpen] = useState(false);
  const [assignEmployerOpen, setAssignEmployerOpen] = useState(false);
  const [viewMembersOpen, setViewMembersOpen] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: pods, isLoading } = useQuery({
    queryKey: ["candidate-pods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_pods")
        .select(`
          *,
          pod_members(count),
          pod_assignments(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createPodMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("candidate_pods")
        .insert({
          name: newPodName,
          description: newPodDescription,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Pod created successfully");
      setCreateDialogOpen(false);
      setNewPodName("");
      setNewPodDescription("");
      queryClient.invalidateQueries({ queryKey: ["candidate-pods"] });
    },
    onError: (error) => {
      toast.error("Failed to create pod: " + error.message);
    },
  });

  const togglePodStatusMutation = useMutation({
    mutationFn: async ({ podId, isActive }: { podId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("candidate_pods")
        .update({ is_active: !isActive })
        .eq("id", podId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pod status updated");
      queryClient.invalidateQueries({ queryKey: ["candidate-pods"] });
    },
    onError: (error) => {
      toast.error("Failed to update pod: " + error.message);
    },
  });

  const editPodMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPodId) throw new Error("No pod selected");
      
      const { error } = await supabase
        .from("candidate_pods")
        .update({
          name: editPodName,
          description: editPodDescription,
        })
        .eq("id", selectedPodId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pod updated successfully");
      setEditDialogOpen(false);
      setSelectedPodId(null);
      setEditPodName("");
      setEditPodDescription("");
      queryClient.invalidateQueries({ queryKey: ["candidate-pods"] });
    },
    onError: (error) => {
      toast.error("Failed to update pod: " + error.message);
    },
  });

  const deletePodMutation = useMutation({
    mutationFn: async (podId: string) => {
      const { error } = await supabase
        .from("candidate_pods")
        .delete()
        .eq("id", podId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pod deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedPodId(null);
      queryClient.invalidateQueries({ queryKey: ["candidate-pods"] });
    },
    onError: (error) => {
      toast.error("Failed to delete pod: " + error.message);
    },
  });

  const handleEditClick = (pod: any) => {
    setSelectedPodId(pod.id);
    setEditPodName(pod.name);
    setEditPodDescription(pod.description || "");
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (podId: string) => {
    setSelectedPodId(podId);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading pods...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pod Management</h2>
          <p className="text-muted-foreground">Create and manage candidate pods for employers</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Pod
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Pod</DialogTitle>
              <DialogDescription>
                Create a curated group of candidates to assign to employers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pod-name">Pod Name</Label>
                <Input
                  id="pod-name"
                  placeholder="e.g., Senior Penetration Testers"
                  value={newPodName}
                  onChange={(e) => setNewPodName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pod-description">Description</Label>
                <Textarea
                  id="pod-description"
                  placeholder="Describe this pod..."
                  value={newPodDescription}
                  onChange={(e) => setNewPodDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={() => createPodMutation.mutate()}
                disabled={!newPodName || createPodMutation.isPending}
                className="w-full"
              >
                {createPodMutation.isPending ? "Creating..." : "Create Pod"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {pods?.map((pod) => (
          <Card key={pod.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {pod.name}
                    {!pod.is_active && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                    )}
                  </CardTitle>
                  <CardDescription>{pod.description || "No description"}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(pod)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(pod.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={pod.is_active ? "outline" : "default"}
                    size="sm"
                    onClick={() =>
                      togglePodStatusMutation.mutate({ podId: pod.id, isActive: pod.is_active })
                    }
                  >
                    {pod.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {pod.pod_members?.[0]?.count || 0} candidates
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {pod.pod_assignments?.[0]?.count || 0} assignments
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setSelectedPodId(pod.id);
                    setViewMembersOpen(true);
                  }}
                >
                  <Users className="h-4 w-4" />
                  View Members
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setSelectedPodId(pod.id);
                    setAddCandidatesOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Candidates
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setSelectedPodId(pod.id);
                    setAssignEmployerOpen(true);
                  }}
                >
                  <Building2 className="h-4 w-4" />
                  Assign to Employer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {pods?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No pods created yet. Create your first pod to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedPodId && (
        <>
          <PodMembers
            podId={selectedPodId}
            open={viewMembersOpen}
            onOpenChange={setViewMembersOpen}
          />
          <AddCandidatesToPod
            podId={selectedPodId}
            open={addCandidatesOpen}
            onOpenChange={setAddCandidatesOpen}
          />
          <AssignPodToEmployer
            podId={selectedPodId}
            open={assignEmployerOpen}
            onOpenChange={setAssignEmployerOpen}
          />
        </>
      )}

      {/* Edit Pod Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pod</DialogTitle>
            <DialogDescription>
              Update the pod's name and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-pod-name">Pod Name</Label>
              <Input
                id="edit-pod-name"
                placeholder="e.g., Senior Penetration Testers"
                value={editPodName}
                onChange={(e) => setEditPodName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-pod-description">Description</Label>
              <Textarea
                id="edit-pod-description"
                placeholder="Describe this pod..."
                value={editPodDescription}
                onChange={(e) => setEditPodDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => editPodMutation.mutate()}
                disabled={!editPodName || editPodMutation.isPending}
                className="flex-1"
              >
                {editPodMutation.isPending ? "Updating..." : "Update Pod"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this pod and remove all member assignments. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPodId && deletePodMutation.mutate(selectedPodId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePodMutation.isPending ? "Deleting..." : "Delete Pod"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
