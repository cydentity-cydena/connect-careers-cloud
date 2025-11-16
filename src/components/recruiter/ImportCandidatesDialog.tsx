import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportCandidatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

interface CandidateRow {
  full_name: string;
  email: string;
  phone?: string;
  title?: string;
  years_experience?: number;
  skills?: string;
  certifications?: string;
  location?: string;
}

export function ImportCandidatesDialog({ open, onOpenChange, onImportComplete }: ImportCandidatesDialogProps) {
  const [batchName, setBatchName] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<CandidateRow[]>([]);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Parse CSV for preview
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const parsed = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.replace(/[^a-z_]/g, '_')] = values[index] || '';
      });
      return row as CandidateRow;
    });

    setPreview(parsed);
  };

  const handleImport = async () => {
    if (!file || !batchName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a batch name and select a file",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Parse full CSV
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const candidates = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.replace(/[^a-z_]/g, '_')] = values[index] || '';
        });
        return row;
      }).filter(c => c.email && c.full_name);

      // Create import batch
      const { data: importBatch, error: batchError } = await supabase
        .from('recruiter_candidate_imports')
        .insert({
          recruiter_id: user.id,
          batch_name: batchName,
          file_name: file.name,
          notes,
          total_candidates: candidates.length,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Process candidates
      let successCount = 0;
      for (const candidate of candidates) {
        try {
          // Check if user already exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', candidate.email)
            .single();

          let candidateId: string;

          if (existingProfile) {
            // User exists - just create relationship
            candidateId = existingProfile.id;
          } else {
            // Create placeholder profile (unclaimed)
            const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
              email: candidate.email,
              email_confirm: false,
              user_metadata: {
                full_name: candidate.full_name,
                imported_by_recruiter: true,
              }
            });

            if (signUpError) {
              console.error(`Failed to create user ${candidate.email}:`, signUpError);
              continue;
            }

            candidateId = newUser.user.id;

            // Update profile with additional info
            await supabase.from('profiles').update({
              full_name: candidate.full_name,
              location: candidate.location,
              imported_by_recruiter: true,
              profile_claimed: false,
            }).eq('id', candidateId);

            // Create candidate profile if title/experience provided
            if (candidate.title || candidate.years_experience) {
              await supabase.from('candidate_profiles').insert({
                user_id: candidateId,
                title: candidate.title || '',
                years_experience: parseInt(candidate.years_experience) || 0,
                phone: candidate.phone,
              });
            }
          }

          // Create recruiter-candidate relationship
          const invitationToken = crypto.randomUUID();
          await supabase.from('recruiter_candidate_relationships').insert({
            recruiter_id: user.id,
            candidate_id: candidateId,
            import_batch_id: importBatch.id,
            activation_status: 'unclaimed',
            invitation_token: invitationToken,
            recruiter_notes: `Imported from ${file.name}`,
          });

          successCount++;
        } catch (error) {
          console.error(`Error processing candidate ${candidate.email}:`, error);
        }
      }

      toast({
        title: "Import successful",
        description: `Successfully imported ${successCount} of ${candidates.length} candidates`,
      });

      onImportComplete?.();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setBatchName("");
    setNotes("");
    setFile(null);
    setPreview([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Candidate Database</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your candidate database. Candidates will be invited to claim their profiles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>CSV Format Required:</strong> full_name, email, phone, title, years_experience, skills, certifications, location
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="batch-name">Batch Name *</Label>
            <Input
              id="batch-name"
              placeholder="e.g., Q4 2024 Import, Client X Candidates"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this import batch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">CSV File *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (first 5 rows)</Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-left">Experience</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{row.full_name}</td>
                          <td className="p-2">{row.email}</td>
                          <td className="p-2">{row.title || '-'}</td>
                          <td className="p-2">{row.years_experience || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={importing || !file || !batchName}>
            {importing ? "Importing..." : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Candidates
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}