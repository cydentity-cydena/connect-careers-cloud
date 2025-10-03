import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, MapPin, DollarSign, Clock, Search } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  requiredSkills: string[];
  requiredClearance?: string;
  remote: boolean;
  postedDate: string;
}

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock job data
  const jobs: Job[] = [
    {
      id: "1",
      title: "Senior Security Analyst",
      company: "CyberSec Corp",
      location: "Washington, DC",
      type: "Full-time",
      salary: "$100k - $130k",
      requiredSkills: ["CISSP", "Security+", "SIEM"],
      requiredClearance: "Secret",
      remote: false,
      postedDate: "2 days ago"
    },
    {
      id: "2",
      title: "Penetration Tester",
      company: "SecureNet Solutions",
      location: "Remote",
      type: "Contract",
      salary: "$120k - $150k",
      requiredSkills: ["OSCP", "CEH", "Metasploit"],
      remote: true,
      postedDate: "1 week ago"
    },
    {
      id: "3",
      title: "SOC Analyst",
      company: "ThreatWatch Inc",
      location: "New York, NY",
      type: "Full-time",
      salary: "$80k - $100k",
      requiredSkills: ["CySA+", "Security+", "Splunk"],
      remote: false,
      postedDate: "3 days ago"
    },
    {
      id: "4",
      title: "Incident Responder",
      company: "Digital Shield",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$110k - $140k",
      requiredSkills: ["GCIH", "GCFA", "CySA+"],
      requiredClearance: "Top Secret",
      remote: false,
      postedDate: "1 day ago"
    },
    {
      id: "5",
      title: "Security Engineer",
      company: "CloudSecure",
      location: "Remote",
      type: "Full-time",
      salary: "$130k - $160k",
      requiredSkills: ["CISSP", "AWS Security", "Terraform"],
      remote: true,
      postedDate: "5 days ago"
    },
    {
      id: "6",
      title: "Cybersecurity Consultant",
      company: "InfoSec Advisors",
      location: "Boston, MA",
      type: "Contract",
      salary: "$150k - $180k",
      requiredSkills: ["CISM", "CISSP", "Risk Management"],
      remote: false,
      postedDate: "1 week ago"
    },
  ];

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Job Opportunities</h1>
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

        {/* Jobs Grid */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <Card
              key={job.id}
              className="border-border shadow-card hover:scale-[1.02] transition-transform animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="text-base font-semibold text-foreground">
                      {job.company}
                    </CardDescription>
                  </div>
                  <Badge variant={job.remote ? "default" : "secondary"}>
                    {job.remote ? "Remote" : "On-site"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {job.postedDate}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {job.requiredClearance && (
                    <div>
                      <p className="text-sm font-semibold">
                        Clearance Required:{" "}
                        <Badge className="ml-2 bg-destructive">
                          {job.requiredClearance}
                        </Badge>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="hero" className="flex-1">
                      Apply Now
                    </Button>
                    <Button variant="cyber" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
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
