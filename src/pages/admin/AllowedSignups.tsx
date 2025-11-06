import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AllowedSignup {
  id: string;
  email: string;
  allowed_role: string | null;
  notes: string | null;
  used_at: string | null;
  created_at: string;
}

export default function AllowedSignups() {
  const [allowedEmails, setAllowedEmails] = useState<AllowedSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<string>("");
  const [newNotes, setNewNotes] = useState("");
  const { toast } = useToast();

  const fetchAllowedEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('allowed_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllowedEmails(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load allowed emails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowedEmails();
  }, []);

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const insertData: any = {
        email: newEmail.toLowerCase().trim(),
      };

      if (newRole) {
        insertData.allowed_role = newRole;
      }

      if (newNotes.trim()) {
        insertData.notes = newNotes.trim();
      }

      const { error } = await supabase
        .from('allowed_signups')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email added to allowlist",
      });

      setNewEmail("");
      setNewRole("");
      setNewNotes("");
      fetchAllowedEmails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add email",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmail = async (id: string) => {
    try {
      const { error } = await supabase
        .from('allowed_signups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email removed from allowlist",
      });

      fetchAllowedEmails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove email",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Allowed Signups</h1>
          <p className="text-muted-foreground">
            Manage who can sign up during private beta
          </p>
        </div>

        {/* Add New Email Form */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Email to Allowlist</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Role (Optional - leave empty to allow any role)
              </label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role restriction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Role</SelectItem>
                  <SelectItem value="candidate">Candidate Only</SelectItem>
                  <SelectItem value="employer">Employer Only</SelectItem>
                  <SelectItem value="recruiter">Recruiter Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Textarea
                placeholder="Why is this person being allowed?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button onClick={handleAddEmail}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Allowlist
            </Button>
          </div>
        </div>

        {/* Allowed Emails Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : allowedEmails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No allowed emails yet
                  </TableCell>
                </TableRow>
              ) : (
                allowedEmails.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.email}</TableCell>
                    <TableCell>
                      {item.allowed_role ? (
                        <Badge variant="outline">{item.allowed_role}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Any</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.used_at ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Signed Up
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.notes || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmail(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
