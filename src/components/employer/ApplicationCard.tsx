import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MessageSquare, MoreVertical, Calendar, Briefcase, GripVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { HireConfirmationDialog } from "./HireConfirmationDialog";

type PipelineStage = "applied" | "screening" | "interview" | "offer" | "rejected" | "hired";

interface ApplicationCardProps {
  application: {
    id: string;
    candidate_id: string;
    job_id: string;
    stage: PipelineStage;
    applied_at: string;
    cover_letter: string | null;
    candidate_profile: {
      title: string;
      years_experience: number;
    };
    profile: {
      full_name: string;
      avatar_url: string | null;
    };
    job: {
      title: string;
    };
  };
  onStageChange: (applicationId: string, newStage: PipelineStage) => void;
}

export const ApplicationCard = ({ application, onStageChange }: ApplicationCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showHireDialog, setShowHireDialog] = useState(false);

  const stages: { value: PipelineStage; label: string }[] = [
    { value: "screening", label: "Move to Screening" },
    { value: "interview", label: "Schedule Interview" },
    { value: "offer", label: "Send Offer" },
    { value: "hired", label: "Mark as Hired" },
    { value: "rejected", label: "Reject" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow border"
      >
        <CardContent className="p-3 space-y-3">
          <div className="flex items-start gap-2">
            <div 
              className="cursor-move mt-1 flex-shrink-0"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={application.profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(application.profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {application.profile.full_name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {application.candidate_profile?.title || "No title"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {stages
                  .filter(s => s.value !== application.stage)
                  .map((stage) => (
                    <DropdownMenuItem
                      key={stage.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (stage.value === 'hired') {
                          setShowHireDialog(true);
                        } else {
                          onStageChange(application.id, stage.value);
                        }
                      }}
                    >
                      {stage.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            <span className="truncate">{application.candidate_profile?.years_experience || 0}y exp</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            View Details
          </Button>
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
              <Button variant="default" className="flex-1">
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
    </>
  );
};
