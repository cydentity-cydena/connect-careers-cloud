import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Briefcase, MapPin, Building2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  work_mode: string | null;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  required_skills: string[] | null;
  required_certifications: string[] | null;
  companies: {
    name: string;
  } | null;
}

const JobsLinkedIn = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        description,
        location,
        work_mode,
        job_type,
        salary_min,
        salary_max,
        required_skills,
        required_certifications,
        companies (name)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `From ${formatter.format(min)}`;
    return `Up to ${formatter.format(max!)}`;
  };

  const generateLinkedInPost = (job: Job): string => {
    const companyName = job.companies?.name || "a leading organization";
    const salary = formatSalary(job.salary_min, job.salary_max);
    const workMode = job.work_mode ? job.work_mode.charAt(0).toUpperCase() + job.work_mode.slice(1) : "";
    const location = job.location || "Flexible";
    
    let post = `🚀 **NOW HIRING: ${job.title}**\n\n`;
    post += `We're helping ${companyName} find their next ${job.title}!\n\n`;
    
    if (job.description) {
      const shortDesc = job.description.length > 200 
        ? job.description.substring(0, 200) + "..." 
        : job.description;
      post += `📋 About the role:\n${shortDesc}\n\n`;
    }
    
    post += `📍 Location: ${location}`;
    if (workMode) post += ` (${workMode})`;
    post += `\n`;
    
    post += `💼 Type: ${job.job_type.replace("_", " ").charAt(0).toUpperCase() + job.job_type.replace("_", " ").slice(1)}\n`;
    
    if (salary) {
      post += `💰 Salary: ${salary}\n`;
    }
    
    if (job.required_skills && job.required_skills.length > 0) {
      const topSkills = job.required_skills.slice(0, 5).join(", ");
      post += `\n🔧 Key Skills: ${topSkills}\n`;
    }
    
    if (job.required_certifications && job.required_certifications.length > 0) {
      post += `🎓 Certifications: ${job.required_certifications.slice(0, 3).join(", ")}\n`;
    }
    
    post += `\n✨ Ready to take your cybersecurity career to the next level?\n\n`;
    post += `👉 Apply now on Cydena: https://cydena.com/jobs\n\n`;
    post += `#CybersecurityJobs #InfoSec #Hiring #SecurityCareers #Cydena #CyberTalent`;
    
    return post;
  };

  const copyToClipboard = async (jobId: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(jobId);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            LinkedIn Job Posts Generator
          </h1>
          <p className="text-muted-foreground">
            {jobs.length} active jobs ready for LinkedIn marketing
          </p>
        </div>

        <div className="space-y-6">
          {jobs.map((job) => {
            const linkedInPost = generateLinkedInPost(job);
            return (
              <Card key={job.id} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-foreground flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {job.companies?.name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.companies.name}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                        )}
                        {(job.salary_min || job.salary_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(job.salary_min, job.salary_max)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {job.work_mode && (
                        <Badge variant="outline">{job.work_mode}</Badge>
                      )}
                      <Badge variant="secondary">{job.job_type.replace("_", " ")}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-sans text-foreground overflow-x-auto">
                      {linkedInPost}
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(job.id, linkedInPost)}
                    >
                      {copiedId === job.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobsLinkedIn;
