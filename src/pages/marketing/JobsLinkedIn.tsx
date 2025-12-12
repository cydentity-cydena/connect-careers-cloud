import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  companies: { name: string } | null;
}

const JobsLinkedIn = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`id, title, location, work_mode, companies (name)`)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) setJobs(data);
    setLoading(false);
  };

  const generatePost = (): string => {
    const jobList = jobs
      .map((job) => {
        const location = job.work_mode === "remote" ? "Remote" : job.location || "Flexible";
        return `→ ${job.title} (${location})`;
      })
      .join("\n");

    return `🔐 **${jobs.length} Cybersecurity Roles Now Open**

We're actively hiring for verified cybersecurity professionals across multiple domains:

${jobList}

Whether you're a seasoned pentester, a GRC specialist, or breaking into the field with fresh certifications — we want to hear from you.

✅ Skills-verified candidates only
✅ Direct access to hiring managers  
✅ No recruiters spamming your inbox

👉 Apply now: https://cydena.com/jobs

Know someone perfect for these roles? Tag them below 👇

#CybersecurityJobs #InfoSec #Hiring #CyberCareers #Cydena`;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatePost());
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          LinkedIn Post — {jobs.length} Active Jobs
        </h1>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <pre className="bg-muted p-6 rounded-lg text-sm whitespace-pre-wrap font-sans text-foreground leading-relaxed">
                {generatePost()}
              </pre>
              <Button
                size="sm"
                className="absolute top-3 right-3"
                onClick={copyToClipboard}
              >
                {copied ? <><Check className="h-4 w-4 mr-1" /> Copied</> : <><Copy className="h-4 w-4 mr-1" /> Copy</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobsLinkedIn;
