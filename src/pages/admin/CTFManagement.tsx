import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, EyeOff, Flag, Trophy, Shield, ArrowLeft, Upload, FileDown, X, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import CTFEventManagement from "@/components/admin/CTFEventManagement";

interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  flag: string;
  hints: unknown;
  is_active: boolean;
  created_at: string;
  file_url?: string | null;
  file_name?: string | null;
}

const CATEGORIES = [
  "General",
  "Puzzle",
  "Network Security",
  "Cryptography",
  "Web Security",
  "Forensics",
  "Reverse Engineering",
  "Threat Intelligence",
  "Incident Response",
  "Cloud Security",
  "Malware Analysis",
  "OSINT"
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const CTFManagement = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<CTFChallenge | null>(null);
  const [showFlag, setShowFlag] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "beginner",
    points: 100,
    flag: "",
    hints: [] as { text: string; cost: number }[],
    is_active: false,
    file_url: null as string | null,
    file_name: null as string | null
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ctf_challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load challenges");
    } else {
      setChallenges(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      difficulty: "beginner",
      points: 100,
      flag: "",
      hints: [],
      is_active: false,
      file_url: null,
      file_name: null
    });
    setEditingChallenge(null);
  };

  const openEditDialog = (challenge: CTFChallenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points,
      flag: challenge.flag,
      hints: (challenge.hints as { text: string; cost: number }[] | null) || [],
      is_active: challenge.is_active,
      file_url: challenge.file_url || null,
      file_name: challenge.file_name || null
    });
    setDialogOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `challenges/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ctf-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ctf-files')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        file_url: publicUrl,
        file_name: file.name
      }));

      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      file_url: null,
      file_name: null
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.category || !formData.flag) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      points: formData.points,
      flag: formData.flag,
      hints: formData.hints.length > 0 ? formData.hints : null,
      is_active: formData.is_active,
      file_url: formData.file_url,
      file_name: formData.file_name
    };

    if (editingChallenge) {
      const { error } = await supabase
        .from("ctf_challenges")
        .update(payload)
        .eq("id", editingChallenge.id);

      if (error) {
        toast.error("Failed to update challenge");
      } else {
        toast.success("Challenge updated successfully");
        setDialogOpen(false);
        resetForm();
        loadChallenges();
      }
    } else {
      const { error } = await supabase
        .from("ctf_challenges")
        .insert(payload);

      if (error) {
        toast.error("Failed to create challenge");
      } else {
        toast.success("Challenge created successfully");
        setDialogOpen(false);
        resetForm();
        loadChallenges();
      }
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("ctf_challenges")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update challenge status");
    } else {
      toast.success(currentState ? "Challenge hidden from public" : "Challenge released to public");
      loadChallenges();
    }
  };

  const deleteChallenge = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    const { error } = await supabase
      .from("ctf_challenges")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete challenge");
    } else {
      toast.success("Challenge deleted");
      loadChallenges();
    }
  };

  const addHint = () => {
    setFormData(prev => ({
      ...prev,
      hints: [...prev.hints, { text: "", cost: 10 }]
    }));
  };

  const updateHint = (index: number, field: "text" | "cost", value: string | number) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.map((h, i) => i === index ? { ...h, [field]: value } : h)
    }));
  };

  const removeHint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-400";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400";
      case "advanced": return "bg-red-500/20 text-red-400";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Flag className="h-8 w-8 text-primary" />
            CTF Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage challenges and private events
          </p>
        </div>

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="challenges" className="gap-2"><Flag className="h-4 w-4" /> Challenges</TabsTrigger>
            <TabsTrigger value="events" className="gap-2"><Calendar className="h-4 w-4" /> Events</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
          <div className="flex items-center justify-between mb-8">
          <div />

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingChallenge ? "Edit Challenge" : "Create New Challenge"}
                </DialogTitle>
                <DialogDescription>
                  {editingChallenge ? "Update challenge details" : "Add a new CTF challenge"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Challenge title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Challenge description and instructions..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map(d => (
                          <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flag">Flag *</Label>
                    <Input
                      id="flag"
                      value={formData.flag}
                      onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value }))}
                      placeholder="CTF{...}"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Hints (Optional)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addHint}>
                      <Plus className="h-3 w-3 mr-1" /> Add Hint
                    </Button>
                  </div>
                  {formData.hints.map((hint, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Input
                        placeholder="Hint text..."
                        value={hint.text}
                        onChange={(e) => updateHint(index, "text", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Cost"
                        value={hint.cost}
                        onChange={(e) => updateHint(index, "cost", parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHint(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label>Challenge File (Optional)</Label>
                  <p className="text-xs text-muted-foreground">
                    Upload PCAPs, executables, images, or other files for the challenge
                  </p>
                  
                  {formData.file_url ? (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileDown className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm truncate">{formData.file_name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="*/*"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {uploading ? "Uploading..." : "Upload File"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Release to public immediately
                  </Label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingChallenge ? "Update Challenge" : "Create Challenge"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{challenges.length}</p>
                  <p className="text-sm text-muted-foreground">Total Challenges</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{challenges.filter(c => c.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Public</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <EyeOff className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{challenges.filter(c => !c.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {challenges.reduce((sum, c) => sum + c.points, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Challenges</CardTitle>
            <CardDescription>Manage your CTF challenges</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No challenges yet. Create your first one!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Flag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenges.map((challenge) => (
                    <TableRow key={challenge.id}>
                      <TableCell className="font-medium">{challenge.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{challenge.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{challenge.points}</TableCell>
                      <TableCell>
                        {challenge.file_url ? (
                          <a 
                            href={challenge.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline text-sm"
                          >
                            <FileDown className="h-4 w-4" />
                            <span className="max-w-[100px] truncate">{challenge.file_name || 'File'}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {showFlag[challenge.id] ? challenge.flag : "••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setShowFlag(prev => ({ ...prev, [challenge.id]: !prev[challenge.id] }))}
                          >
                            {showFlag[challenge.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={challenge.is_active ? "default" : "secondary"}>
                          {challenge.is_active ? "Public" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleActive(challenge.id, challenge.is_active)}
                            title={challenge.is_active ? "Hide from public" : "Release to public"}
                          >
                            {challenge.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(challenge)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteChallenge(challenge.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
          </TabsContent>

          <TabsContent value="events">
            <CTFEventManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CTFManagement;
