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
          Add 20 demo cybersecurity candidates to populate the leaderboard and profiles.
          Each candidate will have a full profile, certifications, and XP.
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
              Seed 20 Demo Candidates
            </>
          )}
        </Button>

        {results && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold">
              {results.message}
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {results.results?.map((result: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {result.success ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={result.success ? "text-green-600" : "text-red-600"}>
                    {result.email}: {result.success ? "Success" : result.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4 space-y-1">
          <p><strong>Demo Credentials:</strong></p>
          <p>All demo accounts use password: <code className="bg-muted px-1 rounded">Demo123!</code></p>
          <p>Example: john.smith.demo@cydena.com</p>
        </div>
      </CardContent>
    </Card>
  );
};
