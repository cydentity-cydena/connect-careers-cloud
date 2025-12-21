import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, CheckCircle, XCircle, ExternalLink, Shield } from "lucide-react";

interface PartnerCommunity {
  id: string;
  name: string;
  description: string | null;
  platform: string;
  invite_url: string;
  logo_url: string | null;
  member_count: number | null;
  specializations: string[] | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  created_at: string;
}

interface CommunityForm {
  name: string;
  description: string;
  platform: string;
  invite_url: string;
  logo_url: string;
  member_count: string;
  specializations: string;
  is_verified: boolean;
  is_active: boolean;
}

const defaultForm: CommunityForm = {
  name: "",
  description: "",
  platform: "Discord",
  invite_url: "",
  logo_url: "",
  member_count: "",
  specializations: "",
  is_verified: false,
  is_active: true,
};

export default function PartnerCommunitiesManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<PartnerCommunity | null>(null);
  const [form, setForm] = useState<CommunityForm>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: communities, isLoading } = useQuery({
    queryKey: ["admin-partner-communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_communities")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PartnerCommunity[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CommunityForm) => {
      const { error } = await supabase.from("partner_communities").insert({
        name: data.name,
        description: data.description || null,
        platform: data.platform,
        invite_url: data.invite_url,
        logo_url: data.logo_url || null,
        member_count: data.member_count ? parseInt(data.member_count) : null,
        specializations: data.specializations ? data.specializations.split(",").map(s => s.trim()).filter(Boolean) : null,
        is_verified: data.is_verified,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-communities"] });
      queryClient.invalidateQueries({ queryKey: ["partner-communities"] });
      toast.success("Community added successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error("Failed to add community: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CommunityForm }) => {
      const { error } = await supabase
        .from("partner_communities")
        .update({
          name: data.name,
          description: data.description || null,
          platform: data.platform,
          invite_url: data.invite_url,
          logo_url: data.logo_url || null,
          member_count: data.member_count ? parseInt(data.member_count) : null,
          specializations: data.specializations ? data.specializations.split(",").map(s => s.trim()).filter(Boolean) : null,
          is_verified: data.is_verified,
          is_active: data.is_active,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-communities"] });
      queryClient.invalidateQueries({ queryKey: ["partner-communities"] });
      toast.success("Community updated successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error("Failed to update community: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partner_communities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-communities"] });
      queryClient.invalidateQueries({ queryKey: ["partner-communities"] });
      toast.success("Community deleted successfully");
      setDeleteConfirm(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete community: " + error.message);
    },
  });

  const handleOpenCreate = () => {
    setEditingCommunity(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (community: PartnerCommunity) => {
    setEditingCommunity(community);
    setForm({
      name: community.name,
      description: community.description || "",
      platform: community.platform,
      invite_url: community.invite_url,
      logo_url: community.logo_url || "",
      member_count: community.member_count?.toString() || "",
      specializations: community.specializations?.join(", ") || "",
      is_verified: community.is_verified || false,
      is_active: community.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCommunity(null);
    setForm(defaultForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.invite_url) {
      toast.error("Name and Invite URL are required");
      return;
    }
    if (editingCommunity) {
      updateMutation.mutate({ id: editingCommunity.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const toggleActive = async (community: PartnerCommunity) => {
    const { error } = await supabase
      .from("partner_communities")
      .update({ is_active: !community.is_active })
      .eq("id", community.id);
    
    if (error) {
      toast.error("Failed to update status");
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-communities"] });
      queryClient.invalidateQueries({ queryKey: ["partner-communities"] });
      toast.success(`Community ${community.is_active ? "deactivated" : "activated"}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Partner Communities
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage cybersecurity Discord communities shown on the Community page
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Community
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Partner Communities</CardTitle>
            <CardDescription>
              {communities?.length || 0} communities configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : !communities || communities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No partner communities yet. Add your first one!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Community</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Specializations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities.map((community) => (
                    <TableRow key={community.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {community.logo_url ? (
                            <img
                              src={community.logo_url}
                              alt={community.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {community.name}
                              {community.is_verified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <a
                              href={community.invite_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Invite Link
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {community.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {community.member_count?.toLocaleString() || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {community.specializations?.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {(community.specializations?.length || 0) > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{community.specializations!.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(community)}
                          className={community.is_active ? "text-green-500" : "text-muted-foreground"}
                        >
                          {community.is_active ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="ml-1">{community.is_active ? "Active" : "Inactive"}</span>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(community)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(community.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCommunity ? "Edit Community" : "Add Partner Community"}
              </DialogTitle>
              <DialogDescription>
                {editingCommunity 
                  ? "Update the community details below" 
                  : "Add a new cybersecurity community to display on the Community page"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Community Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., HackTheBox"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of the community"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Input
                      id="platform"
                      value={form.platform}
                      onChange={(e) => setForm({ ...form, platform: e.target.value })}
                      placeholder="Discord"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="member_count">Member Count</Label>
                    <Input
                      id="member_count"
                      type="number"
                      value={form.member_count}
                      onChange={(e) => setForm({ ...form, member_count: e.target.value })}
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="invite_url">Invite URL *</Label>
                  <Input
                    id="invite_url"
                    value={form.invite_url}
                    onChange={(e) => setForm({ ...form, invite_url: e.target.value })}
                    placeholder="https://discord.gg/..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                  <Input
                    id="specializations"
                    value={form.specializations}
                    onChange={(e) => setForm({ ...form, specializations: e.target.value })}
                    placeholder="Penetration Testing, CTF, Red Team"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_verified"
                      checked={form.is_verified}
                      onCheckedChange={(checked) => setForm({ ...form, is_verified: checked })}
                    />
                    <Label htmlFor="is_verified" className="cursor-pointer">Verified</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCommunity ? "Update" : "Add"} Community
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Community</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this community? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
