import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Users, Calendar, Copy, Link, Eye, Upload, Image } from "lucide-react";

interface CTFEvent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  access_code: string;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
  is_active: boolean;
  visibility: string;
}

interface ChallengeAssignment {
  challenge_id: string;
  event_id: string;
}

const CTFEventManagement = () => {
  const [events, setEvents] = useState<CTFEvent[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CTFEvent | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [assignedChallengeIds, setAssignedChallengeIds] = useState<Set<string>>(new Set());
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    name: "", slug: "", description: "", access_code: "",
    starts_at: "", ends_at: "", is_active: false, banner_url: "" as string | null
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [eventsRes, challengesRes] = await Promise.all([
      supabase.from('ctf_events').select('*').order('created_at', { ascending: false }),
      supabase.from('ctf_challenges').select('id, title, category, difficulty, points, is_active, visibility').order('title')
    ]);

    if (eventsRes.data) {
      setEvents(eventsRes.data as CTFEvent[]);
      // Load participant counts
      const counts: Record<string, number> = {};
      for (const ev of eventsRes.data) {
        const { count } = await supabase
          .from('ctf_event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', ev.id);
        counts[ev.id] = count || 0;
      }
      setParticipantCounts(counts);
    }
    if (challengesRes.data) setChallenges(challengesRes.data as Challenge[]);
    setLoading(false);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", access_code: generateCode(), starts_at: "", ends_at: "", is_active: false, banner_url: null });
    setEditingEvent(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (ev: CTFEvent) => {
    setEditingEvent(ev);
    setFormData({
      name: ev.name, slug: ev.slug, description: ev.description || "",
      access_code: ev.access_code,
      starts_at: ev.starts_at ? ev.starts_at.slice(0, 16) : "",
      ends_at: ev.ends_at ? ev.ends_at.slice(0, 16) : "",
      is_active: ev.is_active,
      banner_url: (ev as any).banner_url || null
    });
    setDialogOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error("Please upload an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Max file size is 2MB"); return; }

    setUploadingLogo(true);
    const ext = file.name.split('.').pop();
    const fileName = `${formData.slug || 'event'}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage.from('ctf-event-logos').upload(fileName, file, { upsert: true });
    if (error) { toast.error("Upload failed"); setUploadingLogo(false); return; }

    const { data: urlData } = supabase.storage.from('ctf-event-logos').getPublicUrl(data.path);
    setFormData(prev => ({ ...prev, banner_url: urlData.publicUrl }));
    toast.success("Logo uploaded!");
    setUploadingLogo(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.access_code) {
      toast.error("Name, slug, and access code are required");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      name: formData.name, slug: formData.slug, description: formData.description || null,
      access_code: formData.access_code,
      starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
      ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
      is_active: formData.is_active,
      banner_url: formData.banner_url || null
    };

    if (editingEvent) {
      const { error } = await supabase.from('ctf_events').update(payload).eq('id', editingEvent.id);
      if (error) { toast.error("Failed to update event"); return; }
      toast.success("Event updated");
    } else {
      const { error } = await supabase.from('ctf_events').insert({ ...payload, created_by: user?.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Event created");
    }
    setDialogOpen(false);
    resetForm();
    loadData();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event? All participant data will be lost.")) return;
    const { error } = await supabase.from('ctf_events').delete().eq('id', id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Event deleted"); loadData(); }
  };

  const openAssignDialog = async (eventId: string) => {
    setSelectedEventId(eventId);
    const { data } = await supabase.from('ctf_challenge_events').select('challenge_id').eq('event_id', eventId);
    setAssignedChallengeIds(new Set((data || []).map(d => d.challenge_id)));
    setAssignDialogOpen(true);
  };

  const toggleChallengeAssignment = async (challengeId: string) => {
    if (!selectedEventId) return;
    const isAssigned = assignedChallengeIds.has(challengeId);

    if (isAssigned) {
      const { error } = await supabase.from('ctf_challenge_events')
        .delete().eq('event_id', selectedEventId).eq('challenge_id', challengeId);
      if (error) { toast.error("Failed to remove"); return; }
      setAssignedChallengeIds(prev => { const s = new Set(prev); s.delete(challengeId); return s; });
    } else {
      const { error } = await supabase.from('ctf_challenge_events')
        .insert({ event_id: selectedEventId, challenge_id: challengeId, sort_order: assignedChallengeIds.size });
      if (error) { toast.error("Failed to assign"); return; }
      setAssignedChallengeIds(prev => new Set(prev).add(challengeId));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Access code copied!");
  };

  const copyEventUrl = (slug: string) => {
    const url = `${window.location.origin}/ctf/events/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Event URL copied!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            CTF Events
          </h2>
          <p className="text-sm text-muted-foreground">Create private CTF competitions with access codes</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Create Event</Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading events...</div>
      ) : events.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Events Yet</h3>
            <p className="text-muted-foreground">Create your first private CTF event</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map(ev => (
            <Card key={ev.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{ev.name}</h3>
                      <Badge variant={ev.is_active ? "default" : "secondary"}>
                        {ev.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {ev.description && <p className="text-sm text-muted-foreground mb-2">{ev.description}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {participantCounts[ev.id] || 0} participants
                      </span>
                      {ev.starts_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(ev.starts_at).toLocaleDateString('en-GB')}
                          {ev.ends_at && ` — ${new Date(ev.ends_at).toLocaleDateString('en-GB')}`}
                        </span>
                      )}
                      <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                        Code: {ev.access_code}
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => copyCode(ev.access_code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => copyEventUrl(ev.slug)} title="Copy event URL">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openAssignDialog(ev.id)} className="gap-1">
                      Challenges
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(ev)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteEvent(ev.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create CTF Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input value={formData.name} onChange={e => {
                const name = e.target.value;
                setFormData(prev => ({ ...prev, name, slug: editingEvent ? prev.slug : generateSlug(name) }));
              }} placeholder="BSides Lancashire 2026" />
            </div>
            <div className="space-y-2">
              <Label>URL Slug *</Label>
              <Input value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="bsides-lancashire-2026" className="font-mono" />
              <p className="text-xs text-muted-foreground">/ctf/events/{formData.slug || '...'}</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A private CTF event for..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Access Code *</Label>
              <div className="flex gap-2">
                <Input value={formData.access_code} onChange={e => setFormData(prev => ({ ...prev, access_code: e.target.value }))}
                  className="font-mono tracking-wider" />
                <Button variant="outline" onClick={() => setFormData(prev => ({ ...prev, access_code: generateCode() }))}>
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date (optional)</Label>
                <Input type="datetime-local" value={formData.starts_at}
                  onChange={e => setFormData(prev => ({ ...prev, starts_at: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date (optional)</Label>
                <Input type="datetime-local" value={formData.ends_at}
                  onChange={e => setFormData(prev => ({ ...prev, ends_at: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formData.is_active} onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))} />
              <Label>Event is active (accepting participants)</Label>
            </div>
            <div className="space-y-2">
              <Label>Event Logo</Label>
              {formData.banner_url && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-white/10">
                  <img src={formData.banner_url} alt="Event logo" className="w-full h-full object-contain" />
                  <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6 bg-background/80"
                    onClick={() => setFormData(prev => ({ ...prev, banner_url: null }))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div>
                <Button variant="outline" size="sm" className="gap-2" disabled={uploadingLogo} asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Max 2MB. Shown on the event page.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingEvent ? "Update" : "Create"} Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Challenges Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Challenges to Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {challenges.map(ch => (
              <div key={ch.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                <Checkbox
                  checked={assignedChallengeIds.has(ch.id)}
                  onCheckedChange={() => toggleChallengeAssignment(ch.id)}
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">{ch.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs">{ch.category}</Badge>
                    <span className="text-xs text-muted-foreground">{ch.points} pts</span>
                    {ch.visibility === 'public' && <Badge variant="secondary" className="text-xs">Public Only</Badge>}
                    {ch.visibility === 'event_only' && <Badge className="text-xs bg-purple-500/20 text-purple-400 border-0">Event Only</Badge>}
                    {!ch.is_active && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CTFEventManagement;
