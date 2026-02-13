import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const urgencyColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  urgent: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  normal: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  flexible: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  open: "bg-emerald-500/20 text-emerald-400",
  in_progress: "bg-amber-500/20 text-amber-400",
};

const Bounties = () => {
  const [isEmployer, setIsEmployer] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoggedIn(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (data?.some((r) => r.role === "employer")) setIsEmployer(true);
    };
    check();
  }, []);

  const { data: bounties, isLoading } = useQuery({
    queryKey: ["public-bounties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_bounties")
        .select(`*, category:category_id (name)`)
        .in("status", ["open", "in_progress"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Work Bounties | Cydena"
        description="Browse and post cybersecurity task bounties. Find qualified professionals for your security projects."
      />
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">Work Bounties</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Browse project-based cybersecurity tasks posted by businesses. Apply with your skills and get paid on completion.
            </p>
          </div>
          {isEmployer ? (
            <Link to="/dashboard">
              <Button variant="hero" size="lg" className="gap-2">
                <Target className="h-5 w-5" />
                Post a Bounty
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : !isLoggedIn ? (
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2">
                Sign In to Post
              </Button>
            </Link>
          ) : null}
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading bounties...</div>
        ) : !bounties?.length ? (
          <Card className="border-dashed max-w-lg mx-auto">
            <CardContent className="py-16 text-center">
              <Target className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="font-semibold text-lg mb-1">No open bounties right now</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Check back soon — new tasks are posted regularly.
              </p>
              {!isLoggedIn && (
                <Link to="/auth">
                  <Button variant="hero">Sign Up to Get Notified</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bounties.map((b: any) => (
              <Card key={b.id} className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{b.title}</h3>
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      <Badge className={urgencyColors[b.urgency] || ""}>
                        {b.urgency}
                      </Badge>
                      <Badge className={statusColors[b.status] || ""}>
                        {b.status === "in_progress" ? "In Progress" : b.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{b.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {b.category && (
                      <Badge variant="secondary" className="text-xs">{b.category.name}</Badge>
                    )}
                    {b.required_clearance && b.required_clearance !== "none" && (
                      <Badge variant="outline" className="text-xs">{b.required_clearance} Required</Badge>
                    )}
                    {b.location_requirement && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {b.location_requirement}
                        {b.location_city && ` — ${b.location_city}`}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
                    <span className="font-semibold text-primary">
                      {b.budget_min_gbp || b.budget_max_gbp
                        ? `£${Number(b.budget_min_gbp || 0).toLocaleString()} – £${Number(b.budget_max_gbp || 0).toLocaleString()}`
                        : "Budget TBD"}
                    </span>
                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {b.current_applicants || 0}/{b.max_applicants || 10}
                      </span>
                      {b.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(b.deadline), "dd MMM")}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bounties;
