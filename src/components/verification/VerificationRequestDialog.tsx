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
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, FileUp, X } from "lucide-react";

interface VerificationRequestDialogProps {
  userId: string;
  existingRequest?: any;
}

export function VerificationRequestDialog({ userId, existingRequest }: VerificationRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState(existingRequest?.company_name || "");
  const [companyWebsite, setCompanyWebsite] = useState(existingRequest?.company_website || "");
  const [registrationNumber, setRegistrationNumber] = useState(existingRequest?.business_registration_number || "");
  const [additionalInfo, setAdditionalInfo] = useState(existingRequest?.additional_info || "");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedFiles.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload up to 5 documents",
        variant: "destructive",
      });
      return;
    }
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return [];

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('verification-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('verification-documents')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!companyName || !companyWebsite) {
      toast({
        title: "Missing information",
        description: "Please fill in company name and website",
        variant: "destructive",
      });
      return;
    }

    // Basic website URL validation
    if (!companyWebsite.match(/^https?:\/\/.+\..+/)) {
      toast({
        title: "Invalid website",
        description: "Please enter a valid website URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload files first
      const documentUrls = await uploadFiles();

      const { error } = await supabase
        .from('verification_requests')
        .upsert({
          user_id: userId,
          candidate_id: userId,
          verification_type: 'identity',
          company_name: companyName,
          company_website: companyWebsite,
          business_registration_number: registrationNumber || null,
          additional_info: additionalInfo || null,
          document_urls: documentUrls.length > 0 ? documentUrls : null,
          status: 'pending',
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Verification request submitted",
        description: "We'll review your request and get back to you soon.",
      });

      queryClient.invalidateQueries({ queryKey: ['verification-request'] });
      setOpen(false);
      setUploadedFiles([]);
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

  const getStatusBadge = () => {
    if (!existingRequest) return null;

    switch (existingRequest.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-yellow-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            Verification pending review
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <CheckCircle className="h-4 w-4" />
            Verified business
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            Verification rejected: {existingRequest.rejection_reason || "Please resubmit with correct information"}
          </div>
        );
    }
  };

  const canEdit = !existingRequest || existingRequest.status === 'rejected';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingRequest?.status === 'approved' ? 'outline' : 'default'}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {existingRequest?.status === 'approved' ? 'Verified' : 'Get Verified'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Business Verification</DialogTitle>
          <DialogDescription>
            Verified businesses get a badge and higher visibility to candidates.
          </DialogDescription>
        </DialogHeader>

        {getStatusBadge()}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={!canEdit}
              placeholder="Your Company Ltd."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-website">Company Website *</Label>
            <Input
              id="company-website"
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              disabled={!canEdit}
              placeholder="https://yourcompany.com"
            />
            <p className="text-xs text-muted-foreground">
              Must match your email domain
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration-number">Business Registration Number</Label>
            <Input
              id="registration-number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              disabled={!canEdit}
              placeholder="Optional - helps speed up verification"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">Additional Information</Label>
            <Textarea
              id="additional-info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              disabled={!canEdit}
              placeholder="LinkedIn page, additional verification details, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents">Supporting Documents (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload business registration, incorporation certificate, or other proof (up to 5 files, max 10MB each)
            </p>
            <Input
              id="documents"
              type="file"
              onChange={handleFileChange}
              disabled={!canEdit || uploading}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              multiple
              className="cursor-pointer"
            />
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                    <span className="flex items-center gap-2">
                      <FileUp className="h-4 w-4" />
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(idx)}
                      disabled={!canEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {canEdit && (
            <Button onClick={handleSubmit} disabled={loading || uploading}>
              {uploading ? "Uploading files..." : loading ? "Submitting..." : "Submit for Verification"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
