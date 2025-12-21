import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Youtube, Video, RefreshCw, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  channel_name: string;
  channel_url: string | null;
  thumbnail_url: string | null;
  difficulty: string | null;
  category: string | null;
  total_xp: number | null;
  is_active: boolean | null;
  display_order: number | null;
  created_at: string;
}

interface PathVideo {
  id: string;
  path_id: string;
  title: string;
  youtube_video_id: string;
  description: string | null;
  duration_minutes: number | null;
  video_order: number;
  xp_reward: number;
}

interface VideoStatus {
  id: string;
  status: "checking" | "valid" | "invalid" | "unknown";
}

const CATEGORIES = [
  { value: "penetration-testing", label: "Penetration Testing" },
  { value: "networking", label: "Networking" },
  { value: "bug-bounty", label: "Bug Bounty" },
  { value: "malware-analysis", label: "Malware Analysis" },
  { value: "web-security", label: "Web Security" },
  { value: "cloud-security", label: "Cloud Security" },
  { value: "incident-response", label: "Incident Response" },
  { value: "general", label: "General" },
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const LearningPathsManagement = () => {
  const navigate = useNavigate();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [videos, setVideos] = useState<PathVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathDialogOpen, setPathDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [editingVideo, setEditingVideo] = useState<PathVideo | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("paths");
  const [videoStatuses, setVideoStatuses] = useState<Record<string, VideoStatus["status"]>>({});
  const [validating, setValidating] = useState(false);

  const [pathForm, setPathForm] = useState({
    title: "",
    description: "",
    channel_name: "",
    channel_url: "",
    difficulty: "beginner",
    category: "general",
    total_xp: 100,
    is_active: true,
    display_order: 0,
  });

  const [videoForm, setVideoForm] = useState({
    title: "",
    youtube_video_id: "",
    description: "",
    duration_minutes: 10,
    video_order: 1,
    xp_reward: 10,
  });

  useEffect(() => {
    loadPaths();
  }, []);

  useEffect(() => {
    if (selectedPathId) {
      loadVideos(selectedPathId);
    }
  }, [selectedPathId]);

  const loadPaths = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("youtube_learning_paths")
      .select("*")
      .order("display_order");

    if (error) {
      toast.error("Failed to load learning paths");
    } else {
      setPaths(data || []);
    }
    setLoading(false);
  };

  const loadVideos = async (pathId: string) => {
    const { data, error } = await supabase
      .from("youtube_path_videos")
      .select("*")
      .eq("path_id", pathId)
      .order("video_order");

    if (error) {
      toast.error("Failed to load videos");
    } else {
      setVideos(data || []);
    }
  };

  const resetPathForm = () => {
    setPathForm({
      title: "",
      description: "",
      channel_name: "",
      channel_url: "",
      difficulty: "beginner",
      category: "general",
      total_xp: 100,
      is_active: true,
      display_order: 0,
    });
    setEditingPath(null);
  };

  const resetVideoForm = () => {
    setVideoForm({
      title: "",
      youtube_video_id: "",
      description: "",
      duration_minutes: 10,
      video_order: videos.length + 1,
      xp_reward: 10,
    });
    setEditingVideo(null);
  };

  const openEditPathDialog = (path: LearningPath) => {
    setEditingPath(path);
    setPathForm({
      title: path.title,
      description: path.description || "",
      channel_name: path.channel_name,
      channel_url: path.channel_url || "",
      difficulty: path.difficulty || "beginner",
      category: path.category || "general",
      total_xp: path.total_xp || 100,
      is_active: path.is_active ?? true,
      display_order: path.display_order || 0,
    });
    setPathDialogOpen(true);
  };

  const openEditVideoDialog = (video: PathVideo) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      youtube_video_id: video.youtube_video_id,
      description: video.description || "",
      duration_minutes: video.duration_minutes || 10,
      video_order: video.video_order,
      xp_reward: video.xp_reward,
    });
    setVideoDialogOpen(true);
  };

  const handlePathSubmit = async () => {
    if (!pathForm.title || !pathForm.channel_name) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      title: pathForm.title,
      description: pathForm.description || null,
      channel_name: pathForm.channel_name,
      channel_url: pathForm.channel_url || null,
      difficulty: pathForm.difficulty,
      category: pathForm.category,
      total_xp: pathForm.total_xp,
      is_active: pathForm.is_active,
      display_order: pathForm.display_order,
    };

    if (editingPath) {
      const { error } = await supabase
        .from("youtube_learning_paths")
        .update(payload)
        .eq("id", editingPath.id);

      if (error) {
        toast.error("Failed to update path");
      } else {
        toast.success("Path updated");
        setPathDialogOpen(false);
        resetPathForm();
        loadPaths();
      }
    } else {
      const { error } = await supabase
        .from("youtube_learning_paths")
        .insert(payload);

      if (error) {
        toast.error("Failed to create path");
      } else {
        toast.success("Path created");
        setPathDialogOpen(false);
        resetPathForm();
        loadPaths();
      }
    }
  };

  const handleVideoSubmit = async () => {
    if (!videoForm.title || !videoForm.youtube_video_id || !selectedPathId) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      path_id: selectedPathId,
      title: videoForm.title,
      youtube_video_id: videoForm.youtube_video_id,
      description: videoForm.description || null,
      duration_minutes: videoForm.duration_minutes,
      video_order: videoForm.video_order,
      xp_reward: videoForm.xp_reward,
    };

    if (editingVideo) {
      const { error } = await supabase
        .from("youtube_path_videos")
        .update(payload)
        .eq("id", editingVideo.id);

      if (error) {
        toast.error("Failed to update video");
      } else {
        toast.success("Video updated");
        setVideoDialogOpen(false);
        resetVideoForm();
        loadVideos(selectedPathId);
      }
    } else {
      const { error } = await supabase
        .from("youtube_path_videos")
        .insert(payload);

      if (error) {
        toast.error("Failed to add video");
      } else {
        toast.success("Video added");
        setVideoDialogOpen(false);
        resetVideoForm();
        loadVideos(selectedPathId);
      }
    }
  };

  const togglePathActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("youtube_learning_paths")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(currentState ? "Path hidden" : "Path published");
      loadPaths();
    }
  };

  const deletePath = async (id: string) => {
    if (!confirm("Delete this learning path and all its videos?")) return;

    const { error } = await supabase
      .from("youtube_learning_paths")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete path");
    } else {
      toast.success("Path deleted");
      if (selectedPathId === id) {
        setSelectedPathId(null);
        setVideos([]);
      }
      loadPaths();
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Delete this video?")) return;

    const { error } = await supabase
      .from("youtube_path_videos")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete video");
    } else {
      toast.success("Video deleted");
      if (selectedPathId) loadVideos(selectedPathId);
    }
  };

  const validateAllVideos = async () => {
    setValidating(true);
    const newStatuses: Record<string, VideoStatus["status"]> = {};

    // Get all videos from all paths
    const { data: allVideos } = await supabase
      .from("youtube_path_videos")
      .select("id, youtube_video_id");

    if (!allVideos) {
      setValidating(false);
      return;
    }

    // Check each video using YouTube oEmbed (doesn't require API key)
    for (const video of allVideos) {
      newStatuses[video.id] = "checking";
      setVideoStatuses({ ...newStatuses });

      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.youtube_video_id}&format=json`
        );
        newStatuses[video.id] = response.ok ? "valid" : "invalid";
      } catch {
        newStatuses[video.id] = "invalid";
      }
    }

    setVideoStatuses(newStatuses);
    setValidating(false);

    const invalidCount = Object.values(newStatuses).filter(s => s === "invalid").length;
    if (invalidCount > 0) {
      toast.error(`Found ${invalidCount} broken video(s)`);
    } else {
      toast.success("All videos are valid!");
    }
  };

  const extractVideoId = (url: string): string => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^[a-zA-Z0-9_-]{11}$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1] || url;
    }
    return url;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-500";
      case "intermediate": return "bg-yellow-500/20 text-yellow-500";
      case "advanced": return "bg-red-500/20 text-red-500";
      default: return "bg-muted";
    }
  };

  const selectedPath = paths.find(p => p.id === selectedPathId);

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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Youtube className="h-8 w-8 text-red-500" />
              Learning Paths Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage YouTube learning paths and validate video links
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={validateAllVideos}
              disabled={validating}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${validating ? "animate-spin" : ""}`} />
              {validating ? "Validating..." : "Validate All Links"}
            </Button>

            <Dialog open={pathDialogOpen} onOpenChange={(open) => {
              setPathDialogOpen(open);
              if (!open) resetPathForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Path
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPath ? "Edit Learning Path" : "Add Learning Path"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPath ? "Update path details" : "Add a new YouTube learning path"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={pathForm.title}
                        onChange={(e) => setPathForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., HackTheBox Walkthroughs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Channel Name *</Label>
                      <Input
                        value={pathForm.channel_name}
                        onChange={(e) => setPathForm(prev => ({ ...prev, channel_name: e.target.value }))}
                        placeholder="e.g., IppSec"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Channel URL</Label>
                    <Input
                      value={pathForm.channel_url}
                      onChange={(e) => setPathForm(prev => ({ ...prev, channel_url: e.target.value }))}
                      placeholder="https://youtube.com/@channelname"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={pathForm.description}
                      onChange={(e) => setPathForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What will learners gain from this path?"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={pathForm.category}
                        onValueChange={(value) => setPathForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={pathForm.difficulty}
                        onValueChange={(value) => setPathForm(prev => ({ ...prev, difficulty: value }))}
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
                      <Label>Total XP</Label>
                      <Input
                        type="number"
                        value={pathForm.total_xp}
                        onChange={(e) => setPathForm(prev => ({ ...prev, total_xp: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={pathForm.display_order}
                        onChange={(e) => setPathForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-7">
                      <Switch
                        checked={pathForm.is_active}
                        onCheckedChange={(checked) => setPathForm(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label>Publish immediately</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setPathDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePathSubmit}>
                      {editingPath ? "Update" : "Create"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="videos" disabled={!selectedPathId}>
              Videos {selectedPath && `(${selectedPath.title})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paths">
            <Card>
              <CardHeader>
                <CardTitle>All Learning Paths</CardTitle>
                <CardDescription>
                  Click on a path to manage its videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Path</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>XP</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paths.map((path) => (
                        <TableRow
                          key={path.id}
                          className={selectedPathId === path.id ? "bg-primary/5" : "cursor-pointer hover:bg-muted/50"}
                          onClick={() => {
                            setSelectedPathId(path.id);
                            setActiveTab("videos");
                          }}
                        >
                          <TableCell className="font-medium">{path.title}</TableCell>
                          <TableCell>
                            <a
                              href={path.channel_url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              {path.channel_name}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {CATEGORIES.find(c => c.value === path.category)?.label || path.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getDifficultyColor(path.difficulty || "beginner")}>
                              {path.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>{path.total_xp}</TableCell>
                          <TableCell>
                            {path.is_active ? (
                              <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Hidden</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => togglePathActive(path.id, path.is_active ?? false)}
                              >
                                {path.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditPathDialog(path)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deletePath(path.id)}
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

          <TabsContent value="videos">
            {selectedPath && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Videos in "{selectedPath.title}"
                    </CardTitle>
                    <CardDescription>
                      Manage videos and check for broken links
                    </CardDescription>
                  </div>
                  <Dialog open={videoDialogOpen} onOpenChange={(open) => {
                    setVideoDialogOpen(open);
                    if (!open) resetVideoForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" onClick={() => {
                        resetVideoForm();
                        setVideoDialogOpen(true);
                      }}>
                        <Plus className="h-4 w-4" />
                        Add Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingVideo ? "Edit Video" : "Add Video"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingVideo ? "Update video details" : "Add a YouTube video to this path"}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Video Title *</Label>
                          <Input
                            value={videoForm.title}
                            onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Introduction to Nmap"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>YouTube Video ID or URL *</Label>
                          <Input
                            value={videoForm.youtube_video_id}
                            onChange={(e) => setVideoForm(prev => ({ 
                              ...prev, 
                              youtube_video_id: extractVideoId(e.target.value) 
                            }))}
                            placeholder="e.g., dIUQvt7KZCE or full YouTube URL"
                          />
                          <p className="text-xs text-muted-foreground">
                            Paste a YouTube URL or video ID (11 characters)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={videoForm.description}
                            onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of what this video covers"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Duration (min)</Label>
                            <Input
                              type="number"
                              value={videoForm.duration_minutes}
                              onChange={(e) => setVideoForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Order</Label>
                            <Input
                              type="number"
                              value={videoForm.video_order}
                              onChange={(e) => setVideoForm(prev => ({ ...prev, video_order: parseInt(e.target.value) || 1 }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>XP Reward</Label>
                            <Input
                              type="number"
                              value={videoForm.xp_reward}
                              onChange={(e) => setVideoForm(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 10 }))}
                            />
                          </div>
                        </div>

                        {videoForm.youtube_video_id && (
                          <div className="border rounded-lg p-3 bg-muted/50">
                            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                            <img
                              src={`https://img.youtube.com/vi/${videoForm.youtube_video_id}/mqdefault.jpg`}
                              alt="Video thumbnail"
                              className="w-full max-w-xs rounded"
                            />
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleVideoSubmit}>
                            {editingVideo ? "Update" : "Add Video"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Video ID</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>XP</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell>{video.video_order}</TableCell>
                          <TableCell className="font-medium">{video.title}</TableCell>
                          <TableCell>
                            <a
                              href={`https://youtube.com/watch?v=${video.youtube_video_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline font-mono text-sm"
                            >
                              {video.youtube_video_id}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>{video.duration_minutes} min</TableCell>
                          <TableCell>{video.xp_reward}</TableCell>
                          <TableCell>
                            {videoStatuses[video.id] === "checking" && (
                              <Badge variant="secondary">Checking...</Badge>
                            )}
                            {videoStatuses[video.id] === "valid" && (
                              <Badge className="bg-green-500/20 text-green-500 gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Valid
                              </Badge>
                            )}
                            {videoStatuses[video.id] === "invalid" && (
                              <Badge className="bg-red-500/20 text-red-500 gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Broken
                              </Badge>
                            )}
                            {!videoStatuses[video.id] && (
                              <Badge variant="outline">Not checked</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditVideoDialog(video)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteVideo(video.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {videos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No videos yet. Add your first video!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningPathsManagement;
