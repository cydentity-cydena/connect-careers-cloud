import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, MoreVertical, Calendar, Briefcase, Eye, MapPin, Star, StickyNote, Shield, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { HireConfirmationDialog } from "./HireConfirmationDialog";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { BadgesRow, BadgeItem, BadgeStatus } from "@/components/hrready/BadgesRow";
import { PushCandidateButton } from "@/components/integrations/PushCandidateButton";

type PipelineStage = "applied" | "screening" | "interview" | "offer" | "rejected" | "hired";

interface ApplicationCardProps {
  application: {
    id: string;
    candidate_id: string;
    job_id: string;
    stage: PipelineStage;
    applied_at: string;
    cover_letter: string | null;
    status_notes?: string | null;
    is_starred?: boolean;
    candidate_profile: {
      title: string;
      years_experience: number;
      resume_url?: string | null;
    };
    profile: {
      full_name: string;
      username?: string | null;
      avatar_url: string | null;
      location?: string | null;
    };
    job: {
      title: string;
    };
    candidate_verifications?: {
      hr_ready: boolean;
      identity_status: string | null;
      rtw_status: string | null;
      logistics_status: string | null;
      logistics_location: string | null;
      certifications: any;
    } | null;
  };
  onStageChange: (applicationId: string, newStage: PipelineStage) => void;
  onToggleStar?: () => void;
  onAddNotes?: () => void;
  onEditVerification?: () => void;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const ApplicationCard = ({ application, onStageChange, onToggleStar, onAddNotes, onEditVerification, isSelected, onToggleSelection }: ApplicationCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showHireDialog, setShowHireDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const stages: { value: PipelineStage; label: string }[] = [
    { value: "applied", label: "Applied" },
    { value: "screening", label: "Screening" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Offer" },
    { value: "rejected", label: "Rejected" },
    { value: "hired", label: "Hired" },
  ];

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .filter(n => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??";
  };

  const getVerificationStatus = (status: string | null): BadgeStatus => {
    if (!status) return "grey";
    // Status values are stored as colors directly in the database
    if (status === "green" || status === "amber" || status === "red" || status === "grey") {
      return status as BadgeStatus;
    }
    // Fallback for any other values
    return "grey";
  };

  const getCertificationStatus = (): BadgeStatus => {
    const certs = application.candidate_verifications?.certifications;
    
    if (!certs || (Array.isArray(certs) && certs.length === 0)) {
      return "grey";
    }
    
    // Parse certifications array
    const certArray = Array.isArray(certs) ? certs : [];
    if (certArray.length === 0) return "grey";
    
    // Check statuses - prioritize worst status
    let hasRed = false;
    let hasAmber = false;
    let hasGrey = false;
    let hasGreen = false;
    
    certArray.forEach((cert: any) => {
      const status = cert.status || "grey";
      if (status === "red") hasRed = true;
      else if (status === "amber") hasAmber = true;
      else if (status === "grey") hasGrey = true;
      else if (status === "green") hasGreen = true;
    });
    
    // Return worst status
    if (hasRed) return "red";
    if (hasAmber) return "amber";
    if (hasGrey) return "grey";
    if (hasGreen) return "green";
    
    return "grey";
  };

  const getVerificationBadges = (): BadgeItem[] => {
    const badges: BadgeItem[] = [];
    
    // ID Badge
    badges.push({
      label: "ID",
      status: getVerificationStatus(application.candidate_verifications?.identity_status || null),
      tooltip: application.candidate_verifications?.identity_status 
        ? `Identity: ${application.candidate_verifications.identity_status}` 
        : "Identity: Not verified"
    });
    
    // RTW Badge
    badges.push({
      label: "RTW",
      status: getVerificationStatus(application.candidate_verifications?.rtw_status || null),
      tooltip: application.candidate_verifications?.rtw_status 
        ? `Right to Work: ${application.candidate_verifications.rtw_status}` 
        : "Right to Work: Not verified"
    });
    
    // Certifications Badge - now properly checking status
    const certStatus = getCertificationStatus();
    const certs = application.candidate_verifications?.certifications;
    const certCount = Array.isArray(certs) ? certs.length : 0;
    
    badges.push({
      label: "Cert",
      status: certStatus,
      tooltip: certCount > 0 
        ? `Certifications: ${certCount} cert${certCount !== 1 ? 's' : ''} (${certStatus})` 
        : "No certifications"
    });
    
    // Logistics Badge (if available)
    if (application.candidate_verifications?.logistics_status) {
      badges.push({
        label: "Logistics",
        status: getVerificationStatus(application.candidate_verifications.logistics_status),
        tooltip: application.candidate_verifications.logistics_location 
          ? `Location: ${application.candidate_verifications.logistics_location}`
          : "Logistics verified"
      });
    }
    
    return badges;
  };

  return (
    <>
      <Card 
        className={`hover:shadow-lg transition-all duration-200 border-2 relative ${application.is_starred ? 'border-amber-400 shadow-amber-100 dark:shadow-amber-900/20' : 'border-border/50 hover:border-border'} ${isSelected ? 'ring-2 ring-primary' : ''}`}
      >
        {onToggleSelection && (
          <div className="absolute top-3 left-3 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection();
              }}
              className="h-4 w-4 rounded border-border cursor-pointer"
            />
          </div>
        )}
        {application.is_starred && (
          <div className="absolute -top-1 -right-1 z-10 bg-background rounded-full p-0.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
        )}
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-background shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-base font-semibold">
                {getInitials(application.profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pr-6">
              {application.profile.username ? (
                <Link 
                  to={`/profiles/${application.candidate_id}`}
                  className="font-bold text-base leading-tight mb-1.5 text-foreground hover:text-primary transition-colors cursor-pointer block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {application.profile.full_name}
                  <span className="text-muted-foreground font-normal text-sm"> (@{application.profile.username})</span>
                </Link>
              ) : (
                <h4 className="font-bold text-base leading-tight mb-1.5 text-foreground">
                  {application.profile.full_name}
                  <span className="text-muted-foreground font-normal text-sm"> (No profile yet)</span>
                </h4>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                {application.candidate_profile?.title || "No title"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 absolute top-2 right-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                {onEditVerification && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditVerification(); }}>
                    <Shield className="h-4 w-4 mr-2" />
                    Edit Verification
                  </DropdownMenuItem>
                )}
                {onToggleStar && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStar(); }}>
                    <Star className={`h-4 w-4 mr-2 ${application.is_starred ? "fill-current" : ""}`} />
                    {application.is_starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                )}
                {onAddNotes && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddNotes(); }}>
                    <StickyNote className="h-4 w-4 mr-2" />
                    {application.status_notes ? "Edit Notes" : "Add Notes"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Verification Status Badges */}
          <div className="py-2">
            <BadgesRow 
              items={getVerificationBadges()} 
              showHrReady={application.candidate_verifications?.hr_ready || false}
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1.5 items-center">
              {/* Years of Experience Badge */}
              {application.candidate_profile?.years_experience !== undefined && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium flex items-center gap-1">
                  <Briefcase className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{application.candidate_profile.years_experience} yrs</span>
                </Badge>
              )}
              
              {/* Notes indicator - More prominent */}
              {application.status_notes && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <StickyNote className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">Notes</span>
                </Badge>
              )}
            </div>

            {/* Location if available */}
            {(application.candidate_verifications?.logistics_location || application.profile.location) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/90">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate font-medium">{application.candidate_verifications?.logistics_location || application.profile.location}</span>
              </div>
            )}

            {/* Applied date */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-3">
            {application.candidate_profile?.resume_url && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs font-medium px-1.5 flex items-center justify-center gap-1"
                onClick={async (e) => {
                  e.stopPropagation();
                  const { createClient } = await import('@supabase/supabase-js');
                  const supabase = createClient(
                    import.meta.env.VITE_SUPABASE_URL,
                    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                  );
                  const { data } = supabase.storage
                    .from('resumes')
                    .getPublicUrl(application.candidate_profile!.resume_url!);
                  window.open(data.publicUrl, '_blank');
                }}
              >
                <Download className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">CV</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs font-medium px-1.5 flex items-center justify-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/profiles/${application.candidate_id}`;
              }}
            >
              <Eye className="h-3.5 w-3.5 flex-shrink-0" />
              <span>View</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-9 text-xs font-medium px-1.5 flex items-center justify-center gap-1 col-span-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowMessageDialog(true);
              }}
            >
              <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Message</span>
            </Button>
          </div>
          <div className="pt-2">
            <PushCandidateButton 
              candidateId={application.candidate_id}
              candidateName={application.profile.full_name}
            />
          </div>

          {/* Stage Selection Dropdown */}
          <Select
            value={application.stage}
            onValueChange={(value) => {
              if (value === 'hired') {
                setShowHireDialog(true);
              } else {
                onStageChange(application.id, value as PipelineStage);
              }
            }}
          >
            <SelectTrigger className="h-10 text-sm w-full bg-muted/30 border-border hover:bg-muted/50 transition-colors font-medium">
              <SelectValue placeholder="Change stage..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-[100]">
              {stages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value} className="cursor-pointer hover:bg-accent text-sm font-medium">
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(application.profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>{application.profile.full_name}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {application.candidate_profile?.title || "No title"}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Applied to {application.job.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Experience</h4>
              <Badge variant="secondary">
                {application.candidate_profile?.years_experience || 0} years
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Applied</h4>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })} on{" "}
                {new Date(application.applied_at).toLocaleDateString()}
              </p>
            </div>

            {application.cover_letter && (
              <div>
                <h4 className="font-semibold mb-2">Cover Letter</h4>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = `/profiles/${application.candidate_id}`}
              >
                View Full Profile
              </Button>
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => setShowMessageDialog(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showHireDialog && (
        <HireConfirmationDialog
          applicationId={application.id}
          candidateId={application.candidate_id}
          jobId={application.job_id}
          positionTitle={application.job.title}
          candidateName={application.profile.full_name}
          onHireComplete={() => {
            setShowHireDialog(false);
            onStageChange(application.id, 'hired');
          }}
        />
      )}

      <SendMessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        recipientId={application.candidate_id}
        recipientName={application.profile.full_name}
      />
    </>
  );
};
