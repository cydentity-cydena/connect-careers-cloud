import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Briefcase, ExternalLink, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Client {
  id: string;
  company_name: string;
  industry: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface RecruiterClientsListProps {
  recruiterId: string;
}

const RecruiterClientsList = ({ recruiterId }: RecruiterClientsListProps) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    industry: "",
    notes: "",
    status: "active"
  });

  useEffect(() => {
    if (recruiterId) {
      loadClients();
    }
  }, [recruiterId]);

  const loadClients = async () => {
    setLoading(true);
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });

    if (clientsData) {
      setClients(clientsData);
      
      // Load job counts for each client
      const counts: Record<string, number> = {};
      for (const client of clientsData) {
        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('is_active', true);
        counts[client.id] = count || 0;
      }
      setJobCounts(counts);
    }
    setLoading(false);
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setFormData({
      company_name: client.company_name,
      contact_name: client.contact_name || "",
      contact_email: client.contact_email || "",
      contact_phone: client.contact_phone || "",
      industry: client.industry || "",
      notes: client.notes || "",
      status: client.status
    });
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          industry: formData.industry,
          notes: formData.notes,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingClient.id);

      if (error) throw error;

      toast.success("Client updated successfully");
      setEditingClient(null);
      loadClients();
    } catch (error: any) {
      toast.error(error.message || "Failed to update client");
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', deleteClient.id);

      if (error) throw error;

      toast.success("Client deleted successfully");
      setDeleteClient(null);
      loadClients();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete client");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading clients...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <Building2 className="h-12 w-12 mx-auto opacity-50 text-muted-foreground" />
        <p className="text-muted-foreground">No clients yet. Add your first client to get started!</p>
        <Button variant="hero" onClick={() => navigate('/clients/create')}>
          <Building2 className="h-4 w-4 mr-2" />
          Add First Client
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">{client.company_name}</h3>
                      {client.contact_name && (
                        <p className="text-sm text-muted-foreground">Contact: {client.contact_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {client.industry && (
                      <Badge variant="secondary" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {client.industry}
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1">
                      <Briefcase className="h-3 w-3" />
                      {jobCounts[client.id] || 0} Active Jobs
                    </Badge>
                    <Badge 
                      variant={client.status === 'active' ? 'default' : 'secondary'}
                    >
                      {client.status}
                    </Badge>
                  </div>

                  {client.contact_email && (
                    <p className="text-sm text-muted-foreground">
                      {client.contact_email}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClick(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteClient(client)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate('/jobs/create')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Post Job
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update the client information below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-company-name">Company Name *</Label>
              <Input
                id="edit-company-name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Acme Corporation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contact-name">Contact Name</Label>
              <Input
                id="edit-contact-name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contact-email">Contact Email</Label>
              <Input
                id="edit-contact-email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="john@acme.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contact-phone">Contact Phone</Label>
              <Input
                id="edit-contact-phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-industry">Industry</Label>
              <Input
                id="edit-industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Technology, Healthcare, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClient(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateClient}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteClient?.company_name}</strong>? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecruiterClientsList;
