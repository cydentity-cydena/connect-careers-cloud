import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  GraduationCap, Plus, Pencil, Trash2, ArrowLeft, BookOpen,
  ChevronDown, ChevronUp, GripVertical, Target
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  partner_name: string | null;
  partner_logo_url: string | null;
  banner_url: string | null;
  access_code: string;
  is_active: boolean;
  sequential_modules: boolean;
  accreditation_name: string | null;
  accreditation_logo_url: string | null;
  accreditation_url: string | null;
  created_at: string;
}

interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  module_order: number;
}

interface ModuleChallenge {
  id: string;
  module_id: string;
  challenge_id: string;
  sort_order: number;
  challenge_title?: string;
  challenge_category?: string;
  challenge_difficulty?: string;
  challenge_points?: number;
}

interface CTFChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
}

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [moduleChallenges, setModuleChallenges] = useState<Record<string, ModuleChallenge[]>>({});
  const [allChallenges, setAllChallenges] = useState<CTFChallenge[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showAddChallengeDialog, setShowAddChallengeDialog] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Form state
  const [courseForm, setCourseForm] = useState({
    title: "", slug: "", description: "", partner_name: "", partner_logo_url: "",
    banner_url: "", access_code: "", sequential_modules: true
  });
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchAllChallenges();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error("Failed to load courses"); return; }
    setCourses(data || []);
    setLoading(false);
  };

  const fetchAllChallenges = async () => {
    const { data } = await supabase
      .from('ctf_challenges')
      .select('id, title, category, difficulty, points')
      .eq('is_active', true)
      .order('title');
    setAllChallenges(data || []);
  };

  const fetchModules = async (courseId: string) => {
    const { data: mods } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('module_order');
    setModules(mods || []);

    // Fetch challenges for each module
    if (mods && mods.length > 0) {
      const moduleIds = mods.map(m => m.id);
      const { data: mcData } = await supabase
        .from('course_module_challenges')
        .select('*')
        .in('module_id', moduleIds)
        .order('sort_order');

      // Enrich with challenge info
      const challengeIds = mcData?.map(mc => mc.challenge_id) || [];
      let challengeMap: Record<string, CTFChallenge> = {};
      if (challengeIds.length > 0) {
        const { data: cData } = await supabase
          .from('ctf_challenges')
          .select('id, title, category, difficulty, points')
          .in('id', challengeIds);
        cData?.forEach(c => { challengeMap[c.id] = c; });
      }

      const grouped: Record<string, ModuleChallenge[]> = {};
      mcData?.forEach(mc => {
        const c = challengeMap[mc.challenge_id];
        const enriched: ModuleChallenge = {
          ...mc,
          challenge_title: c?.title,
          challenge_category: c?.category,
          challenge_difficulty: c?.difficulty,
          challenge_points: c?.points
        };
        if (!grouped[mc.module_id]) grouped[mc.module_id] = [];
        grouped[mc.module_id].push(enriched);
      });
      setModuleChallenges(grouped);
    } else {
      setModuleChallenges({});
    }
  };

  const handleCreateCourse = async () => {
    if (!courseForm.title || !courseForm.slug || !courseForm.access_code) {
      toast.error("Title, slug, and access code are required");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('courses').insert({
      title: courseForm.title,
      slug: courseForm.slug,
      description: courseForm.description || null,
      partner_name: courseForm.partner_name || null,
      partner_logo_url: courseForm.partner_logo_url || null,
      banner_url: courseForm.banner_url || null,
      access_code: courseForm.access_code,
      sequential_modules: courseForm.sequential_modules,
      created_by: user?.id
    });

    if (error) {
      if (error.code === '23505') toast.error("A course with this slug already exists");
      else toast.error("Failed to create course");
      return;
    }

    toast.success("Course created!");
    setShowCreateDialog(false);
    setCourseForm({ title: "", slug: "", description: "", partner_name: "", partner_logo_url: "", banner_url: "", access_code: "", sequential_modules: true });
    fetchCourses();
  };

  const handleToggleActive = async (course: Course) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_active: !course.is_active })
      .eq('id', course.id);
    if (error) { toast.error("Failed to update"); return; }
    fetchCourses();
    if (selectedCourse?.id === course.id) {
      setSelectedCourse({ ...selectedCourse, is_active: !course.is_active });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Delete this course and all its modules? This cannot be undone.")) return;
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Course deleted");
    if (selectedCourse?.id === courseId) setSelectedCourse(null);
    fetchCourses();
  };

  const handleCreateModule = async () => {
    if (!moduleForm.title || !selectedCourse) return;
    const nextOrder = modules.length > 0 ? Math.max(...modules.map(m => m.module_order)) + 1 : 0;

    const { error } = await supabase.from('course_modules').insert({
      course_id: selectedCourse.id,
      title: moduleForm.title,
      description: moduleForm.description || null,
      module_order: nextOrder
    });

    if (error) { toast.error("Failed to create module"); return; }
    toast.success("Module added!");
    setShowModuleDialog(false);
    setModuleForm({ title: "", description: "" });
    fetchModules(selectedCourse.id);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Delete this module and unlink its challenges?")) return;
    const { error } = await supabase.from('course_modules').delete().eq('id', moduleId);
    if (error) { toast.error("Failed to delete module"); return; }
    toast.success("Module deleted");
    if (selectedCourse) fetchModules(selectedCourse.id);
  };

  const handleAddChallenge = async (challengeId: string) => {
    if (!activeModuleId) return;
    const existing = moduleChallenges[activeModuleId] || [];
    const nextOrder = existing.length > 0 ? Math.max(...existing.map(c => c.sort_order)) + 1 : 0;

    const { error } = await supabase.from('course_module_challenges').insert({
      module_id: activeModuleId,
      challenge_id: challengeId,
      sort_order: nextOrder
    });

    if (error) {
      if (error.code === '23505') toast.error("Challenge already in this module");
      else toast.error("Failed to add challenge");
      return;
    }

    toast.success("Challenge added!");
    if (selectedCourse) fetchModules(selectedCourse.id);
  };

  const handleRemoveChallenge = async (mcId: string) => {
    const { error } = await supabase.from('course_module_challenges').delete().eq('id', mcId);
    if (error) { toast.error("Failed to remove"); return; }
    if (selectedCourse) fetchModules(selectedCourse.id);
  };

  const selectCourse = (course: Course) => {
    setSelectedCourse(course);
    fetchModules(course.id);
  };

  const getDifficultyColor = (d: string) => {
    switch (d?.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-500';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-500';
      case 'advanced': return 'bg-orange-500/20 text-orange-500';
      case 'expert': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Available challenges = all challenges not already in this module
  const getAvailableChallenges = () => {
    const usedIds = new Set((moduleChallenges[activeModuleId || ""] || []).map(mc => mc.challenge_id));
    return allChallenges.filter(c => !usedIds.has(c.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Course Management | Admin" description="Manage training courses" />
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => selectedCourse ? setSelectedCourse(null) : navigate('/dashboard')} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {selectedCourse ? 'Back to Courses' : 'Back to Dashboard'}
        </Button>

        {!selectedCourse ? (
          <>
            {/* Course List */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" /> Course Management
                </h1>
                <p className="text-muted-foreground">Create and manage training courses with module challenges</p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> New Course</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>Set up a new training course with access code gate</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title *</Label>
                      <Input value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="CREST CPSA Lite" />
                    </div>
                    <div>
                      <Label>Slug * (URL path)</Label>
                      <Input value={courseForm.slug} onChange={e => setCourseForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} placeholder="cpsa-lite" />
                    </div>
                    <div>
                      <Label>Access Code *</Label>
                      <Input value={courseForm.access_code} onChange={e => setCourseForm(f => ({ ...f, access_code: e.target.value }))} placeholder="CPSA-2026" className="font-mono" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="Course description..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Partner Name</Label>
                        <Input value={courseForm.partner_name} onChange={e => setCourseForm(f => ({ ...f, partner_name: e.target.value }))} placeholder="Real LMS" />
                      </div>
                      <div>
                        <Label>Partner Logo URL</Label>
                        <Input value={courseForm.partner_logo_url} onChange={e => setCourseForm(f => ({ ...f, partner_logo_url: e.target.value }))} placeholder="https://..." />
                      </div>
                    </div>
                    <div>
                      <Label>Banner Image URL</Label>
                      <Input value={courseForm.banner_url} onChange={e => setCourseForm(f => ({ ...f, banner_url: e.target.value }))} placeholder="https://..." />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={courseForm.sequential_modules} onCheckedChange={v => setCourseForm(f => ({ ...f, sequential_modules: v }))} />
                      <Label>Sequential modules (must complete in order)</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateCourse}>Create Course</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {courses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first training course to get started.</p>
                  <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Create Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map(course => (
                  <Card key={course.id} className="hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="cursor-pointer flex-1" onClick={() => selectCourse(course)}>
                          <CardTitle className="text-lg hover:text-primary transition-colors">{course.title}</CardTitle>
                          <CardDescription className="mt-1">
                            /{course.slug} • Code: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{course.access_code}</code>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={course.is_active ? "default" : "secondary"}>
                            {course.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Switch checked={course.is_active} onCheckedChange={() => handleToggleActive(course)} />
                        <span className="text-sm text-muted-foreground">Active</span>
                        <div className="flex-1" />
                        <Button variant="outline" size="sm" onClick={() => selectCourse(course)}>
                          Manage Modules
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteCourse(course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Module Management for selected course */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">{selectedCourse.title}</h1>
                <p className="text-muted-foreground">
                  Manage modules and challenges • Code: <code className="font-mono bg-muted px-1 py-0.5 rounded">{selectedCourse.access_code}</code>
                </p>
              </div>
              <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Add Module</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Module</DialogTitle>
                    <DialogDescription>Add a new module to this course</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Module Title *</Label>
                      <Input value={moduleForm.title} onChange={e => setModuleForm(f => ({ ...f, title: e.target.value }))} placeholder="Module 1: Network Fundamentals" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={moduleForm.description} onChange={e => setModuleForm(f => ({ ...f, description: e.target.value }))} placeholder="What this module covers..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowModuleDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateModule}>Add Module</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {modules.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Modules Yet</h3>
                  <p className="text-muted-foreground mb-4">Add modules to organize your course challenges.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {modules.map((mod, idx) => {
                  const challenges = moduleChallenges[mod.id] || [];
                  return (
                    <Card key={mod.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{mod.title}</CardTitle>
                              {mod.description && <CardDescription>{mod.description}</CardDescription>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{challenges.length} challenges</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setActiveModuleId(mod.id); setShowAddChallengeDialog(true); }}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Challenge
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteModule(mod.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {challenges.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {challenges.map(mc => (
                              <div key={mc.id} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                                <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{mc.challenge_title || mc.challenge_id}</p>
                                  <p className="text-xs text-muted-foreground">{mc.challenge_category} • {mc.challenge_points} pts</p>
                                </div>
                                <Badge variant="outline" className={`text-xs ${getDifficultyColor(mc.challenge_difficulty || '')}`}>
                                  {mc.challenge_difficulty}
                                </Badge>
                                <Button variant="ghost" size="sm" className="text-destructive h-7 w-7 p-0" onClick={() => handleRemoveChallenge(mc.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Add Challenge Dialog */}
            <Dialog open={showAddChallengeDialog} onOpenChange={setShowAddChallengeDialog}>
              <DialogContent className="max-w-lg max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Add Challenge to Module</DialogTitle>
                  <DialogDescription>Select a CTF challenge to add to this module</DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto max-h-96 space-y-2">
                  {getAvailableChallenges().length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No more challenges available. Create new CTF challenges first.</p>
                  ) : (
                    getAvailableChallenges().map(c => (
                      <button
                        key={c.id}
                        onClick={() => { handleAddChallenge(c.id); setShowAddChallengeDialog(false); }}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 transition-colors flex items-center gap-3"
                      >
                        <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.category} • {c.points} pts</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(c.difficulty)}`}>
                          {c.difficulty}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
