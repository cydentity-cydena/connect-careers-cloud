import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";

interface UsernameChangeDialogProps {
  currentUsername: string;
  usernameChanges: number;
  userId: string;
}

export function UsernameChangeDialog({ currentUsername, usernameChanges, userId }: UsernameChangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleChange = async () => {
    if (newUsername.length < 3 || newUsername.length > 20) {
      toast({
        title: "Invalid username",
        description: "Username must be between 3-20 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: newUsername,
          username_changes: usernameChanges + 1 
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Username updated",
        description: `Your username is now @${newUsername}`,
      });

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setOpen(false);
      setNewUsername("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Change Username
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Username</DialogTitle>
          <DialogDescription>
            Choose a new username for your profile. You can change this anytime.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Username</Label>
            <Input value={`@${currentUsername}`} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-username">New Username</Label>
            <Input
              id="new-username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="new_username"
              minLength={3}
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              3-20 characters: letters, numbers, underscores only
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleChange} 
            disabled={loading || !newUsername}
          >
            {loading ? "Updating..." : "Change Username"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
