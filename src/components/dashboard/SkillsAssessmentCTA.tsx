import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const SkillsAssessmentCTA = () => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Validate Your Skills</CardTitle>
        </div>
        <CardDescription>
          Take AI-powered technical assessments to demonstrate your expertise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Stand out to employers with verified skills assessments. Get instant AI feedback and showcase results on your profile.
          </p>
          <Button asChild className="w-full">
            <Link to="/skills-assessment">
              Take Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};