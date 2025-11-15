import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Clock,
  DollarSign,
  Target,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Analytics {
  period: {
    days: number;
    start_date: string;
    end_date: string;
  };
  summary: {
    active_jobs: number;
    total_applications: number;
    total_hires: number;
    profiles_unlocked: number;
    avg_time_to_hire_days: number;
  };
  conversion_metrics: {
    stage_breakdown: {
      applied: number;
      screening: number;
      interview: number;
      offer: number;
      hired: number;
      rejected: number;
    };
    conversion_rates: {
      application_to_screening: number;
      application_to_interview: number;
      application_to_hire: number;
    };
  };
  time_to_hire: {
    average_days: number;
    vs_industry_avg: number;
  };
  roi: {
    estimated_savings_per_hire: number;
    total_estimated_savings: number;
    industry_benchmark_days: number;
    industry_benchmark_cost: number;
  };
  recent_activity: {
    applications: number;
    unlocks: number;
    hires: number;
  };
  jobs: Array<{
    id: string;
    title: string;
    applications: number;
    hires: number;
  }>;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(90);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("employer-analytics", {
        body: { days: timeRange },
      });

      if (error) throw error;
      setAnalytics(data);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, conversion_metrics, time_to_hire, roi, recent_activity } = analytics;

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hiring Analytics</h2>
          <p className="text-muted-foreground">
            Track your recruitment success and ROI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </Button>
          <Button
            variant={timeRange === 365 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(365)}
          >
            1 Year
          </Button>
          <Button variant="ghost" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ROI Highlight Banner */}
      {roi.total_estimated_savings > 0 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Estimated Cost Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-600">
                ${roi.total_estimated_savings.toLocaleString()}
              </span>
              <span className="text-muted-foreground">
                saved vs. industry average
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your average time-to-hire of {time_to_hire.average_days} days is{" "}
              <span className="font-semibold text-green-600">
                {Math.abs(time_to_hire.vs_industry_avg)} days faster
              </span>{" "}
              than the industry benchmark ({roi.industry_benchmark_days} days)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_applications}</div>
            <p className="text-xs text-muted-foreground">
              {recent_activity.applications} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Hires</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_hires}</div>
            <p className="text-xs text-muted-foreground">
              {recent_activity.hires} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time-to-Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{time_to_hire.average_days} days</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              {Math.abs(time_to_hire.vs_industry_avg)} days faster than industry
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversion_metrics.conversion_rates.application_to_hire}%
            </div>
            <p className="text-xs text-muted-foreground">Application to hire</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Application Funnel</CardTitle>
          <CardDescription>
            Track candidates through each stage of your hiring process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(conversion_metrics.stage_breakdown).map(([stage, count]) => {
              const percentage = summary.total_applications > 0
                ? Math.round((count / summary.total_applications) * 100)
                : 0;
              
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{stage.replace("_", " ")}</span>
                    <span className="text-muted-foreground">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Job Performance */}
      {analytics.jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Performance</CardTitle>
            <CardDescription>
              Application and hire metrics per job posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.applications} applications
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.hires > 0 ? "default" : "secondary"}>
                      {job.hires} {job.hires === 1 ? "hire" : "hires"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
