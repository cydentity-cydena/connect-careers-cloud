import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Trash2, Star, Eye, Download, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Resume {
  id: string;
  resume_name: string;
  resume_type: string;
  resume_url: string;
  is_primary: boolean;
  is_visible_to_employers: boolean;
}

export const MultipleResumesManager = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newResume, setNewResume] = useState({
    name: "",
    type: "general",
    file: null as File | null,
  });

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("candidate_resumes")
        .select("*")
        .eq("candidate_id", user.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!newResume.file || !newResume.name) {
      toast.error("Please provide a resume name and file");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload to storage bucket
      const fileExt = newResume.file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, newResume.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Store resume metadata in database
      const { error } = await supabase.from("candidate_resumes").insert({
        candidate_id: user.id,
        resume_name: newResume.name,
        resume_type: newResume.type,
        resume_url: fileName, // Store the storage path
        is_primary: resumes.length === 0, // First resume is primary
        is_visible_to_employers: true, // Default to visible
      });

      if (error) throw error;

      toast.success("Resume uploaded successfully");
      setNewResume({ name: "", type: "general", file: null });
      
      // Reset file input
      const fileInput = document.getElementById("resume-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      loadResumes();
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      toast.error(error.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unset all as primary
      await supabase
        .from("candidate_resumes")
        .update({ is_primary: false })
        .eq("candidate_id", user.id);

      // Set selected as primary
      const { error } = await supabase
        .from("candidate_resumes")
        .update({ is_primary: true })
        .eq("id", resumeId);

      if (error) throw error;

      toast.success("Primary resume updated");
      loadResumes();
    } catch (error) {
      console.error("Error setting primary resume:", error);
      toast.error("Failed to update primary resume");
    }
  };

  const handleDownload = async (resumeUrl: string, resumeName: string) => {
    try {
      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from("resumes")
        .createSignedUrl(resumeUrl, 60); // 60 seconds expiry

      if (error) throw error;

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `${resumeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Resume downloaded");
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error("Failed to download resume");
    }
  };

  const handleView = async (resumeUrl: string) => {
    try {
      // Get signed URL for viewing
      const { data, error } = await supabase.storage
        .from("resumes")
        .createSignedUrl(resumeUrl, 300); // 5 minutes expiry

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error("Error viewing resume:", error);
      toast.error("Failed to view resume");
    }
  };

  const handleDelete = async (resumeId: string) => {
    try {
      // Get the resume to find the storage path
      const resume = resumes.find(r => r.id === resumeId);
      if (!resume) throw new Error("Resume not found");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("resumes")
        .remove([resume.resume_url]);

      if (storageError) console.error("Storage deletion error:", storageError);

      // Delete from database
      const { error } = await supabase
        .from("candidate_resumes")
        .delete()
        .eq("id", resumeId);

      if (error) throw error;

      toast.success("Resume deleted");
      loadResumes();
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
    }
  };

  const handleToggleVisibility = async (resumeId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from("candidate_resumes")
        .update({ is_visible_to_employers: !currentVisibility })
        .eq("id", resumeId);

      if (error) throw error;

      toast.success(
        !currentVisibility
          ? "Resume is now visible to employers"
          : "Resume is now hidden from employers"
      );
      loadResumes();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Manage Resumes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload New Resume */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="resume-name">Resume Name</Label>
            <Input
              id="resume-name"
              placeholder="e.g., Technical Resume, Managerial Resume"
              value={newResume.name}
              onChange={(e) => setNewResume({ ...newResume, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume-type">Resume Type</Label>
            <Select
              value={newResume.type}
              onValueChange={(value) => setNewResume({ ...newResume, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="managerial">Managerial</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume-file">Upload File</Label>
            <Input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setNewResume({ ...newResume, file: e.target.files?.[0] || null })}
            />
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Resume"}
          </Button>
        </div>

        {/* Existing Resumes */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading resumes...</p>
          ) : resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resumes uploaded yet</p>
          ) : (
            resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{resume.resume_name}</p>
                    {resume.is_primary && (
                      <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        <Star className="h-3 w-3 fill-current" />
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{resume.resume_type}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch
                      checked={resume.is_visible_to_employers}
                      onCheckedChange={() => handleToggleVisibility(resume.id, resume.is_visible_to_employers)}
                      id={`visibility-${resume.id}`}
                    />
                    <label 
                      htmlFor={`visibility-${resume.id}`}
                      className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
                    >
                      {resume.is_visible_to_employers ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Visible to employers
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Hidden from employers
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(resume.resume_url)}
                    title="View resume"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(resume.resume_url, resume.resume_name)}
                    title="Download resume"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!resume.is_primary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(resume.id)}
                      title="Set as primary"
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(resume.id)}
                    title="Delete resume"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
