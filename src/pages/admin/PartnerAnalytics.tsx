import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Eye, 
  Unlock,
  DollarSign,
  Building2,
  Award,
  RefreshCw,
  Search
} from "lucide-react";
import SEO from "@/components/SEO";

export default function PartnerAnalytics() {
  const [partnerSlug, setPartnerSlug] = useState("security-blue");
  const [certName, setCertName] = useState("");
  const [timeRange, setTimeRange] = useState(365);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["partner-analytics", partnerSlug, certName, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: timeRange.toString(),
      });
      
      if (partnerSlug) params.append("partner", partnerSlug);
      if (certName) params.append("cert", certName);

      const { data, error } = await supabase.functions.invoke("partner-analytics", {
        body: { params: params.toString() },
      });

      if (error) throw error;
      return data;
    },
  });

  const StatCard = ({ icon: Icon, label, value, subtext, color = "text-primary" }: any) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtext && <p className="text-sm text-muted-foreground mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEO 
        title="Partner Analytics - Admin"
        description="View certification partner performance metrics and employment outcomes"
      />
      
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Partner Analytics</h1>
          <p className="text-muted-foreground">
            Track certification impact on candidate employment and engagement
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="partner">Partner Slug</Label>
                <Input
                  id="partner"
                  placeholder="e.g., security-blue"
                  value={partnerSlug}
                  onChange={(e) => setPartnerSlug(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cert">Certification Name (optional)</Label>
                <Input
                  id="cert"
                  placeholder="e.g., BTL1"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="range">Time Range</Label>
                <div className="flex gap-2">
                  <Button
                    variant={timeRange === 90 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(90)}
                  >
                    90d
                  </Button>
                  <Button
                    variant={timeRange === 365 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(365)}
                  >
                    1yr
                  </Button>
                  <Button
                    variant={timeRange === 730 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(730)}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[140px]" />
            ))}
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Candidates with Cert"
                value={analytics.summary.total_candidates_with_cert}
                color="text-blue-600"
              />
              <StatCard
                icon={Briefcase}
                label="Placements"
                value={analytics.summary.total_placements}
                subtext={`${analytics.summary.placement_rate_percent}% placement rate`}
                color="text-green-600"
              />
              <StatCard
                icon={DollarSign}
                label="Avg Salary"
                value={analytics.summary.avg_salary > 0 
                  ? `$${(analytics.summary.avg_salary / 1000).toFixed(0)}k` 
                  : "N/A"}
                color="text-purple-600"
              />
              <StatCard
                icon={Eye}
                label="Profile Views"
                value={analytics.summary.profile_views}
                subtext={`${analytics.engagement.views_per_candidate} per candidate`}
                color="text-orange-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Unlock}
                label="Profile Unlocks"
                value={analytics.summary.profile_unlocks}
                subtext={`${analytics.engagement.unlock_rate_percent}% of candidates`}
                color="text-cyan-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Hiring Value"
                value={analytics.value_metrics.total_hiring_value > 0
                  ? `$${(analytics.value_metrics.total_hiring_value / 1000000).toFixed(1)}M`
                  : "$0"}
                color="text-pink-600"
              />
              <StatCard
                icon={Building2}
                label="Employer Connections"
                value={analytics.value_metrics.employer_connections}
                subtext="Unique companies"
                color="text-indigo-600"
              />
              <StatCard
                icon={Award}
                label="Cert Types"
                value={Object.keys(analytics.certification_breakdown).length}
                color="text-amber-600"
              />
            </div>

            {/* Certification Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Certification Breakdown</CardTitle>
                <CardDescription>Individual certification performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.certification_breakdown).map(([name, data]: [string, any]) => (
                    <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{name}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.count} candidates
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default">
                          {data.verified} verified
                        </Badge>
                        {data.pending > 0 && (
                          <Badge variant="secondary">
                            {data.pending} pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Placements */}
            {analytics.recent_placements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Placements</CardTitle>
                  <CardDescription>Latest successful hires</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.recent_placements.map((placement: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{placement.position}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(placement.date).toLocaleDateString()}
                          </div>
                        </div>
                        {placement.salary && (
                          <Badge variant="outline">
                            ${(placement.salary / 1000).toFixed(0)}k
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No data available for the selected filters
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
