import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";

export const CustomAssessmentsList = () => {
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
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Send to Candidate
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
