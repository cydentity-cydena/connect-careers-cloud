import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Building2, 
  Shield,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { ApplyJobDialog } from "@/components/jobs/ApplyJobDialog";
import SEO from "@/components/SEO";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  required_skills: string[] | null;
  required_clearance: string | null;
  remote_allowed: boolean | null;
  created_at: string;
  company: {
    id: string;
    name: string;
    description: string;
    industry: string;
    size: string;
    location: string;
    website: string;
    logo_url: string | null;
  };
}

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          description,
          location,
          job_type,
          salary_min,
          salary_max,
          required_skills,
          required_clearance,
          remote_allowed,
          created_at,
          company:companies(
            id,
            name,
            description,
            industry,
            size,
            location,
            website,
            logo_url
          )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setJob(data as Job);
    } catch (error) {
      console.error("Error loading job:", error);
      toast.error("Failed to load job details");
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Competitive";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Job not found</p>
            <Button onClick={() => navigate("/jobs")} className="mt-4">
              Back to Jobs
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${job.title} at ${job.company.name} - Cydena`}
        description={job.description.substring(0, 160)}
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/jobs")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {job.company.logo_url && (
                    <img 
                      src={job.company.logo_url} 
                      alt={job.company.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-3xl mb-1">{job.title}</CardTitle>
                    <p className="text-lg text-muted-foreground font-semibold">
                      {job.company.name}
                    </p>
                  </div>
                </div>

                {/* Key Details */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {job.location || "Not specified"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {job.job_type}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {formatSalary(job.salary_min, job.salary_max)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Posted {getTimeAgo(job.created_at)}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant={job.remote_allowed ? "default" : "secondary"}>
                    {job.remote_allowed ? "Remote" : "On-site"}
                  </Badge>
                  {job.required_clearance && (
                    <Badge className="bg-destructive">
                      <Shield className="h-3 w-3 mr-1" />
                      {job.required_clearance} Clearance
                    </Badge>
                  )}
                </div>
              </div>

              {/* Apply Button */}
              <div className="ml-4">
                <ApplyJobDialog jobId={job.id} jobTitle={job.title}>
                  <Button size="lg" variant="hero" className="whitespace-nowrap">
                    Apply Now
                  </Button>
                </ApplyJobDialog>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-foreground">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Required Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills & Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  About {job.company.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {job.company.description}
                </p>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Industry:</span>
                    <p className="text-muted-foreground">{job.company.industry}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Company Size:</span>
                    <p className="text-muted-foreground">{job.company.size} employees</p>
                  </div>
                  <div>
                    <span className="font-semibold">Location:</span>
                    <p className="text-muted-foreground">{job.company.location}</p>
                  </div>
                </div>

                {job.company.website && (
                  <>
                    <Separator />
                    <a 
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      Visit Company Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Apply Again */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <p className="text-sm mb-4">Ready to take the next step?</p>
                <ApplyJobDialog jobId={job.id} jobTitle={job.title}>
                  <Button variant="hero" className="w-full">
                    Apply for this Position
                  </Button>
                </ApplyJobDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;