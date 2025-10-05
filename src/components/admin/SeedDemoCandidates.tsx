import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const SeedDemoCandidates = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-candidates');

      if (error) throw error;

      setResults(data);
      toast.success(data.message || "Demo candidates seeded successfully!");
    } catch (error: any) {
      console.error('Seed error:', error);
      toast.error(error.message || "Failed to seed demo candidates");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Seed Demo Candidates
        </CardTitle>
        <CardDescription>
          Populate the platform with 100 demo candidates, 50 employers, and 5 recruiters.
          Each user will have a complete profile with credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleSeed} 
          disabled={isSeeding}
          className="w-full"
        >
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding candidates...
            </>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              Seed Demo Users
            </>
          )}
        </Button>

        {results && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold">
              {results.message}
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="font-semibold">Candidates:</p>
                <p className="text-green-600">
                  {results.results?.candidates?.filter((r: any) => r.success).length || 0} / 100
                </p>
              </div>
              <div>
                <p className="font-semibold">Employers:</p>
                <p className="text-blue-600">
                  {results.results?.employers?.filter((r: any) => r.success).length || 0} / 50
                </p>
              </div>
              <div>
                <p className="font-semibold">Recruiters:</p>
                <p className="text-purple-600">
                  {results.results?.recruiters?.filter((r: any) => r.success).length || 0} / 5
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4 space-y-1">
          <p><strong>Demo Credentials:</strong></p>
          <p>All demo accounts use password: <code className="bg-muted px-1 rounded">Demo123!</code></p>
          <p>Candidates: firstname.lastname.#@cydena.demo</p>
          <p>Employers: firstname.lastname.employer#@cydena.demo</p>
          <p>Recruiters: firstname.lastname.recruiter#@cydena.demo</p>
        </div>
      </CardContent>
    </Card>
  );
};
