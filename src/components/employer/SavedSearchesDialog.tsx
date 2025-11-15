import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bookmark, Bell, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SavedSearch {
  id: string;
  name: string;
  search_criteria: any;
  notify_on_match: boolean;
  created_at: string;
}

interface SavedSearchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCriteria?: any;
  onLoadSearch?: (criteria: any) => void;
}

export const SavedSearchesDialog = ({
  open,
  onOpenChange,
  currentCriteria,
  onLoadSearch,
}: SavedSearchesDialogProps) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchName, setSearchName] = useState("");
  const [notifyOnMatch, setNotifyOnMatch] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSavedSearches();
    }
  }, [open]);

  const fetchSavedSearches = async () => {
    const { data, error } = await supabase
      .from("saved_searches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved searches:", error);
      return;
    }

    setSavedSearches(data || []);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast.error("Please enter a name for this search");
      return;
    }

    if (!currentCriteria) {
      toast.error("No search criteria to save");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("saved_searches").insert([{
      user_id: user.id,
      name: searchName,
      search_criteria: currentCriteria,
      notify_on_match: notifyOnMatch,
    }]);

    setLoading(false);

    if (error) {
      toast.error("Failed to save search");
      return;
    }

    toast.success("Search saved successfully!");
    setSearchName("");
    fetchSavedSearches();
  };

  const handleDeleteSearch = async (id: string) => {
    const { error } = await supabase.from("saved_searches").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete search");
      return;
    }

    toast.success("Search deleted");
    fetchSavedSearches();
  };

  const handleToggleNotifications = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("saved_searches")
      .update({ notify_on_match: !currentValue })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update notifications");
      return;
    }

    toast.success(
      !currentValue ? "Notifications enabled" : "Notifications disabled"
    );
    fetchSavedSearches();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Saved Searches
          </DialogTitle>
          <DialogDescription>
            Save your search criteria and get notified when matching candidates join
          </DialogDescription>
        </DialogHeader>

        {currentCriteria && (
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold">Save Current Search</h3>
            <div className="space-y-2">
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                placeholder="e.g., Senior SOC Analysts"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify">Get notified</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when matching candidates join
                </p>
              </div>
              <Switch
                id="notify"
                checked={notifyOnMatch}
                onCheckedChange={setNotifyOnMatch}
              />
            </div>

            <Button onClick={handleSaveSearch} disabled={loading} className="w-full">
              Save Search
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Your Saved Searches ({savedSearches.length})</h3>
          
          {savedSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No saved searches yet. Create complex filters and save them for quick access!
            </p>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <Card key={search.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{search.name}</h4>
                        {search.notify_on_match && (
                          <Badge variant="secondary" className="gap-1">
                            <Bell className="h-3 w-3" />
                            Alerts on
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Saved {new Date(search.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleNotifications(search.id, search.notify_on_match)}
                      >
                        <Bell className={`h-4 w-4 ${search.notify_on_match ? 'fill-current' : ''}`} />
                      </Button>

                      {onLoadSearch && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onLoadSearch(search.search_criteria);
                            onOpenChange(false);
                            toast.success("Search loaded");
                          }}
                        >
                          Load
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSearch(search.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
