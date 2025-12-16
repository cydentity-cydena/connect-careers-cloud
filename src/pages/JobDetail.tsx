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
import { EditJobButton } from "@/components/jobs/EditJobButton";
import { ShareJobButton } from "@/components/jobs/ShareJobButton";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
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
  work_mode: string | null;
  created_at: string;
  created_by: string;
  managed_by_cydena: boolean | null;
  company: {
    id: string;
    name: string;
    description: string;
    industry: string;
    size: string;
    location: string;
    website: string;
    logo_url: string | null;
    created_by: string;
  } | null;
}

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

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
          work_mode,
          created_at,
          created_by,
          managed_by_cydena,
          company_id,
          companies!left(
            id,
            name,
            description,
            industry,
            size,
            location,
            website,
            logo_url,
            created_by
          )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setJob(null);
        return;
      }

      // Transform the data to match expected structure
      const transformedData: Job = {
        ...data,
        company: data.companies ? {
          id: data.companies.id,
          name: data.companies.name,
          description: data.companies.description,
          industry: data.companies.industry,
          size: data.companies.size,
          location: data.companies.location,
          website: data.companies.website,
          logo_url: data.companies.logo_url,
          created_by: data.companies.created_by
        } : null
      };
      
      setJob(transformedData);

      // Fetch verification status
      if (transformedData.company?.created_by) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_verified")
          .eq("id", transformedData.company.created_by)
          .maybeSingle();

        setIsVerified(profile?.is_verified || false);
      }
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
    if (min && max) return `£${(min / 1000).toFixed(0)}k - £${(max / 1000).toFixed(0)}k`;
    if (min) return `£${(min / 1000).toFixed(0)}k+`;
    return `Up to £${(max! / 1000).toFixed(0)}k`;
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
        title={`${job.title}${job.company ? ` at ${job.company.name}` : ''} - Cydena`}
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
          <CardHeader className="space-y-4">
            {/* Action Buttons - Top on mobile */}
            <div className="flex flex-wrap gap-2 sm:hidden">
              <EditJobButton 
                jobId={job.id} 
                createdBy={job.created_by}
                variant="outline"
              />
              <ShareJobButton 
                jobId={job.id} 
                jobTitle={job.title} 
                companyName={job.company?.name}
              />
              <ApplyJobDialog jobId={job.id} jobTitle={job.title}>
                <Button size="default" variant="hero" className="whitespace-nowrap">
                  Apply Now
                </Button>
              </ApplyJobDialog>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  {job.company?.logo_url && (
                    <img 
                      src={job.company.logo_url} 
                      alt={job.company.name}
                      className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <CardTitle className="text-2xl sm:text-3xl mb-1 break-words">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base sm:text-lg text-muted-foreground font-semibold">
                        {job.company?.name || 'Company Name Not Available'}
                      </p>
                      {isVerified && <VerifiedBadge />}
                    </div>
                  </div>
                </div>

                {/* Key Details */}
                <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{job.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                    <span>{job.job_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Posted {getTimeAgo(job.created_at)}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.managed_by_cydena && (
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
                      <Shield className="h-3 w-3 mr-1" />
                      Cydena Expert Assist
                    </Badge>
                  )}
                  {job.work_mode && (
                    <Badge variant={job.work_mode === 'remote' ? "default" : "secondary"}>
                      {job.work_mode === 'on-site' ? 'On-site' : job.work_mode === 'remote' ? 'Remote' : 'Hybrid'}
                    </Badge>
                  )}
                  {job.required_clearance && (
                    <Badge className="bg-destructive">
                      <Shield className="h-3 w-3 mr-1" />
                      {job.required_clearance} Clearance
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons - Side on desktop */}
              <div className="hidden sm:flex gap-2 flex-shrink-0">
                <EditJobButton 
                  jobId={job.id} 
                  createdBy={job.created_by}
                  variant="outline"
                />
                <ShareJobButton 
                  jobId={job.id} 
                  jobTitle={job.title} 
                  companyName={job.company?.name}
                />
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
            {job.company && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    About {job.company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.company.description && (
                    <p className="text-sm text-muted-foreground">
                      {job.company.description}
                    </p>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    {job.company.industry && (
                      <div>
                        <span className="font-semibold">Industry:</span>
                        <p className="text-muted-foreground">{job.company.industry}</p>
                      </div>
                    )}
                    {job.company.size && (
                      <div>
                        <span className="font-semibold">Company Size:</span>
                        <p className="text-muted-foreground">{job.company.size} employees</p>
                      </div>
                    )}
                    {job.company.location && (
                      <div>
                        <span className="font-semibold">Location:</span>
                        <p className="text-muted-foreground">{job.company.location}</p>
                      </div>
                    )}
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
            )}

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