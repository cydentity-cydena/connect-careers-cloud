import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MessageSquare, MoreVertical, Calendar, Briefcase, Eye, MapPin, Star, StickyNote, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { HireConfirmationDialog } from "./HireConfirmationDialog";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { BadgesRow, BadgeItem, BadgeStatus } from "@/components/hrready/BadgesRow";

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
    };
    profile: {
      full_name: string;
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
}

export const ApplicationCard = ({ application, onStageChange, onToggleStar, onAddNotes, onEditVerification }: ApplicationCardProps) => {
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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getVerificationStatus = (status: string | null): BadgeStatus => {
    if (!status) return "red";
    if (status === "verified") return "green";
    if (status === "pending") return "amber";
    return "red";
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
    
    // Certifications Badge
    if (application.candidate_verifications?.certifications) {
      badges.push({
        label: "Cert",
        status: "green",
        tooltip: "Has certifications"
      });
    }
    
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
        className={`hover:shadow-md transition-all border relative ${application.is_starred ? 'border-amber-400 shadow-sm' : ''}`}
      >
        {application.is_starred && (
          <div className="absolute top-2 right-2 z-10">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
        )}
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={application.profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(application.profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pr-8">
              <h4 className="font-semibold text-sm leading-tight mb-1">
                {application.profile.full_name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
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
          <BadgesRow 
            items={getVerificationBadges()} 
            showHrReady={application.candidate_verifications?.hr_ready || false}
          />

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Years of Experience Badge */}
              {application.candidate_profile?.years_experience !== undefined && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {application.candidate_profile.years_experience} yrs
                </Badge>
              )}
              
              {/* Notes indicator - More prominent */}
              {application.status_notes && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  <StickyNote className="h-3 w-3 mr-1" />
                  Notes
                </Badge>
              )}
            </div>

            {/* Location if available */}
            {(application.candidate_verifications?.logistics_location || application.profile.location) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{application.candidate_verifications?.logistics_location || application.profile.location}</span>
              </div>
            )}

            {/* Applied date */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2 min-w-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs px-2"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/profiles/${application.candidate_id}`;
              }}
            >
              <Eye className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-9 text-xs px-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowMessageDialog(true);
              }}
            >
              <MessageSquare className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Message</span>
            </Button>
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
            <SelectTrigger className="h-9 text-xs w-full bg-card border-border">
              <SelectValue placeholder="Change stage..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-[100]">
              {stages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value} className="cursor-pointer hover:bg-accent">
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
                <AvatarImage src={application.profile.avatar_url || undefined} />
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
