import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Briefcase, MapPin, DollarSign, Clock, Search, Info } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import { ApplyJobDialog } from "@/components/jobs/ApplyJobDialog";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    created_by: string;
  } | null;
  location: string | null;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  required_skills: string[] | null;
  required_clearance: string | null;
  work_mode: string | null;
  created_at: string;
  description: string;
  must_haves: string[] | null;
  required_certifications: string[] | null;
  years_experience_min: number | null;
  managed_by_cydena: boolean | null;
  skip_experience_match: boolean | null;
  skip_clearance_match: boolean | null;
  skip_must_haves_match: boolean | null;
  skip_certifications_match: boolean | null;
}

interface CompanyVerification {
  [key: string]: boolean;
}

const Jobs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifiedCompanies, setVerifiedCompanies] = useState<CompanyVerification>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<{
    skills: string[];
    certifications: string[];
    yearsExperience: number;
    clearance: string | null;
  } | null>(null);

  useEffect(() => {
    loadJobs();
    loadCandidateProfile();
    checkAdminRole();
  }, []);

  const loadJobs = async () => {
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
          must_haves,
          required_certifications,
          years_experience_min,
          managed_by_cydena,
          skip_experience_match,
          skip_clearance_match,
          skip_must_haves_match,
          skip_certifications_match,
          company_id,
          companies!left(name, created_by)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match expected structure
      const transformedData = (data || []).map((job: any) => ({
        ...job,
        company: job.companies ? {
          name: job.companies.name,
          created_by: job.companies.created_by
        } : null
      }));
      
      setJobs(transformedData);

      // Fetch verification status for all companies
      if (transformedData && transformedData.length > 0) {
        const companyOwnerIds = [...new Set(transformedData.map((job: any) => job.company?.created_by).filter(Boolean))];
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, is_verified")
          .in("id", companyOwnerIds);

        if (!profileError && profiles) {
          const verificationMap: CompanyVerification = {};
          profiles.forEach(profile => {
            verificationMap[profile.id] = profile.is_verified || false;
          });
          setVerifiedCompanies(verificationMap);
        }
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const loadCandidateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfileLoaded(true);
        return;
      }

      // Fetch candidate skills
      const { data: skillsData } = await supabase
        .from("candidate_skills")
        .select("skills(name)")
        .eq("candidate_id", user.id);

      const skills = skillsData?.map(s => s.skills?.name).filter(Boolean) || [];

      // Fetch candidate certifications
      const { data: certsData } = await supabase
        .from("certifications")
        .select("name")
        .eq("candidate_id", user.id);

      const certifications = certsData?.map(c => c.name) || [];

      // Fetch candidate profile for years of experience and clearance
      const { data: profileData } = await supabase
        .from("candidate_profiles")
        .select("years_experience, security_clearance")
        .eq("user_id", user.id)
        .single();

      setCandidateProfile({
        skills,
        certifications,
        yearsExperience: profileData?.years_experience || 0,
        clearance: profileData?.security_clearance || null
      });
    } catch (error) {
      console.error("Error loading candidate profile:", error);
    } finally {
      setProfileLoaded(true);
    }
  };

  const checkAdminRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasAdminRole = roles?.some(r => r.role === 'admin') || false;
      setIsAdmin(hasAdminRole);
    } catch (error) {
      console.error("Error checking admin role:", error);
    }
  };

  const candidateQualifiesForJob = (job: Job): boolean => {
    // Admins can see all jobs
    if (isAdmin) return true;
    
    // If no candidate profile (guest/unauthenticated user), show all jobs
    if (!candidateProfile && profileLoaded) return true;
    
    // If profile not loaded yet, hide jobs to prevent flash
    if (!candidateProfile) return false;

    // Check years of experience requirement (unless overridden)
    if (!job.skip_experience_match && job.years_experience_min && candidateProfile.yearsExperience < job.years_experience_min) {
      return false;
    }

    // Check security clearance requirement (unless overridden)
    if (!job.skip_clearance_match && job.required_clearance && job.required_clearance !== candidateProfile.clearance) {
      return false;
    }

    // Check must-have skills/requirements (unless overridden)
    if (!job.skip_must_haves_match && job.must_haves && job.must_haves.length > 0) {
      const hasMustHaves = job.must_haves.every(mustHave => 
        candidateProfile.skills.some(skill => 
          skill.toLowerCase().includes(mustHave.toLowerCase()) ||
          mustHave.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasMustHaves) return false;
    }

    // Check required certifications (unless overridden)
    if (!job.skip_certifications_match && job.required_certifications && job.required_certifications.length > 0) {
      const hasRequiredCerts = job.required_certifications.every(reqCert =>
        candidateProfile.certifications.some(cert =>
          cert.toLowerCase().includes(reqCert.toLowerCase()) ||
          reqCert.toLowerCase().includes(cert.toLowerCase())
        )
      );
      if (!hasRequiredCerts) return false;
    }

    return true;
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

  const filteredJobs = jobs
    .filter(candidateQualifiesForJob) // Filter out jobs candidate doesn't qualify for
    .filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.company?.name && job.company.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.required_skills && job.required_skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    );

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Cybersecurity Jobs - Security Analyst & Infosec Careers"
        description="Browse cybersecurity jobs from verified employers. Find security analyst, penetration tester, SOC analyst, and security engineer positions. Apply directly."
        keywords="cybersecurity jobs, security analyst jobs, penetration tester careers, SOC analyst positions, infosec jobs"
      />
      <Schema type="breadcrumb" data={{
        items: [
          { name: "Home", path: "/" },
          { name: "Jobs", path: "/jobs" }
        ]
      }} />
      <Navigation />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Cybersecurity Jobs - Find Your Next Security Role</h1>
          <p className="text-muted-foreground">
            Find your next cybersecurity role with leading organizations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by title, company, location, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {candidateProfile && !isAdmin && (
          <Alert className="mb-6 border-accent/20 bg-accent/5">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-foreground ml-2">
              Intelligent Matching Active: You only see jobs matching your qualifications (skills, certifications, experience).
            </AlertDescription>
          </Alert>
        )}

        {/* Jobs Grid */}
        {loading || !profileLoaded ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Loading jobs...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <div key={job.id}>
                <Schema type="jobPosting" data={job} />
                <Card
                  className="border-border shadow-card hover:scale-[1.02] transition-transform animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <CardDescription className="text-base font-semibold text-foreground">
                          {job.company?.name || 'Company Name Not Available'}
                        </CardDescription>
                        {job.company && verifiedCompanies[job.company.created_by] && <VerifiedBadge />}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {job.managed_by_cydena && (
                        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 whitespace-nowrap">
                          Cydena Expert Assist
                        </Badge>
                      )}
                      {job.work_mode && (
                        <Badge variant={job.work_mode === 'remote' ? "default" : "secondary"}>
                          {job.work_mode === 'on-site' ? 'On-site' : job.work_mode === 'remote' ? 'Remote' : 'Hybrid'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                        {getTimeAgo(job.created_at)}
                      </div>
                    </div>

                    {job.required_skills && job.required_skills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Required Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.required_clearance && (
                      <div>
                        <p className="text-sm font-semibold">
                          Clearance Required:{" "}
                          <Badge className="ml-2 bg-destructive">
                            {job.required_clearance}
                          </Badge>
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <ApplyJobDialog jobId={job.id} jobTitle={job.title}>
                        <Button variant="hero" className="flex-1">
                          Apply Now
                        </Button>
                      </ApplyJobDialog>
                      <Button 
                        variant="cyber" 
                        className="flex-1"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            ))}
          </div>
        )}

        {!loading && profileLoaded && filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No jobs found matching your search.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Jobs;
