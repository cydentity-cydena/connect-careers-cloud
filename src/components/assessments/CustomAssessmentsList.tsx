import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Eye, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ViewAssessmentDialog } from "./ViewAssessmentDialog";
import { SendAssessmentDialog } from "./SendAssessmentDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const CustomAssessmentsList = () => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['custom-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const { error } = await supabase
        .from('custom_assessments')
        .delete()
        .eq('id', assessmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-assessments'] });
      toast({
        title: "Assessment deleted",
        description: "The assessment has been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      setSelectedAssessment(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setViewDialogOpen(true);
  };

  const handleSendToCandidate = (assessment: any) => {
    setSelectedAssessment(assessment);
    setSendDialogOpen(true);
  };

  const handleDeleteClick = (assessment: any) => {
    setSelectedAssessment(assessment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAssessment) {
      deleteMutation.mutate(selectedAssessment.id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading your assessments...</div>;
  }

  if (!assessments || assessments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No custom assessments yet</p>
          <p className="text-sm mt-2">Create your first assessment to start evaluating candidates</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {assessments.map((assessment: any) => {
          const questions = Array.isArray(assessment.questions) ? assessment.questions : [];
          
          return (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{assessment.assessment_name}</CardTitle>
                    <CardDescription>{assessment.description || 'No description'}</CardDescription>
                  </div>
                  <Badge variant={assessment.is_active ? "default" : "secondary"}>
                    {assessment.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Used {assessment.times_used} times</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {format(new Date(assessment.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(assessment)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSendToCandidate(assessment)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send to Candidate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteClick(assessment)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ViewAssessmentDialog
        assessment={selectedAssessment}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <SendAssessmentDialog
        assessment={selectedAssessment}
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAssessment?.assessment_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
