import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const SkillsAssessmentCTA = () => {
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem('skills-assessment-progress');
    setHasSavedProgress(!!savedProgress);
  }, []);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Validate Your Skills</CardTitle>
        </div>
        <CardDescription>
          Take professional technical assessments to demonstrate your expertise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Stand out to employers with verified skills assessments. Get instant feedback and showcase results on your profile.
          </p>
          <Button asChild className="w-full">
            <Link to="/skills-assessment">
              {hasSavedProgress ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resume Assessment
                </>
              ) : (
                <>
                  Take Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};