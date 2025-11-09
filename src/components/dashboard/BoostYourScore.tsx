import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Trophy, Clock, CheckCircle } from "lucide-react";
import { ProofSubmissionDialog } from "./ProofSubmissionDialog";
import { useToast } from "@/hooks/use-toast";

export const BoostYourScore = () => {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const { data: boostData, refetch } = useQuery({
    queryKey: ['boost-courses'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('boost-courses');
      if (error) throw error;
      return data;
    },
  });

  const handleStartCourse = (url: string) => {
    window.open(url, '_blank');
  };

  const handleProofSubmitted = () => {
    refetch();
    setSelectedCourse(null);
  };

  const courses = boostData?.items || [];
  const isEmpty = courses.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Boost Your Score
          </h2>
          <p className="text-muted-foreground mt-1">
            <span className="font-semibold text-primary">100% FREE</span> employer-recognized courses. Complete → verify → earn XP instantly.
          </p>
        </div>
      </div>

      {boostData?.recommendedSkill && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm">
              💡 <strong>Tip:</strong> Boost your {boostData.recommendedSkill} ranking with these <strong className="text-green-600">FREE</strong> modules
            </p>
          </CardContent>
        </Card>
      )}

      {isEmpty ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Great job!</p>
            <p className="text-muted-foreground">
              You've completed all available boosts. Check back regularly for new courses!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course: any) => (
            <Card key={course.id} className="hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                      FREE
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {course.partner_slug}
                    </Badge>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground">
                    +{course.reward_amount} XP
                  </Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                {course.est_minutes && (
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    ~{course.est_minutes} min
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {course.badge_hint && (
                  <p className="text-xs text-muted-foreground">{course.badge_hint}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStartCourse(course.url)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedCourse(course)}
                  >
                    I've Completed
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCourse && (
        <ProofSubmissionDialog
          course={selectedCourse}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSuccess={handleProofSubmitted}
        />
      )}
    </div>
  );
};
