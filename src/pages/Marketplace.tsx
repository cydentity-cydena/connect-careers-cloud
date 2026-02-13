import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Star, Clock, Shield, MapPin, Zap, Users, Code, Target, AlertTriangle, Eye, ClipboardCheck, Cloud, Building, GraduationCap, Microscope, Bug, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { BookTalentDialog } from "@/components/marketplace/BookTalentDialog";

const iconMap: Record<string, any> = {
  Shield, Target, AlertTriangle, Eye, ClipboardCheck, Cloud, Code, Search: Search,
  Building, GraduationCap, Microscope, Bug,
};

const urgencyColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  urgent: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  normal: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  flexible: "bg-muted text-muted-foreground",
};

const availabilityColors: Record<string, string> = {
  available: "bg-emerald-500",
  busy: "bg-amber-500",
  unavailable: "bg-destructive",
  on_engagement: "bg-amber-500",
};

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [clearanceFilter, setClearanceFilter] = useState("all");

  const { data: categories } = useQuery({
    queryKey: ["task-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: talent, isLoading: talentLoading } = useQuery({
    queryKey: ["marketplace-talent", searchQuery, categoryFilter, clearanceFilter],
    queryFn: async () => {
      let query = supabase
        .from("candidate_profiles")
        .select("*")
        .eq("is_marketplace_visible", true)
        .order("average_rating", { ascending: false });

      if (clearanceFilter !== "all") {
        query = query.eq("security_clearance", clearanceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profile info for each talent
      const userIds = (data || []).map((t: any) => t.user_id);
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, location, bio")
          .in("id", userIds);
        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
        }
      }

      let filtered = (data || []).map((t: any) => ({
        ...t,
        profiles: profilesMap[t.user_id] || null,
      }));

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((t: any) =>
          t.marketplace_headline?.toLowerCase().includes(q) ||
          t.title?.toLowerCase().includes(q) ||
          t.profiles?.full_name?.toLowerCase().includes(q) ||
          t.specializations?.some((s: string) => s.toLowerCase().includes(q)) ||
          t.tools?.some((s: string) => s.toLowerCase().includes(q))
        );
      }
      return filtered;
    },
  });

  const { data: bounties, isLoading: bountiesLoading } = useQuery({
    queryKey: ["marketplace-bounties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_bounties")
        .select(`
          *,
          category:category_id (name, slug, icon),
          client:client_id (full_name, username)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Marketplace | Cydena"
        description="Discover and book verified cybersecurity talent on demand. Browse professionals or post task bounties."
      />
      <Navigation />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(189_97%_55%/0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="h-3 w-3 mr-1" /> API & MCP Ready
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Verified Cyber Talent.{" "}
              <span className="bg-clip-text text-transparent bg-[image:var(--gradient-cyber)]">
                On Demand.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The marketplace where security teams and AI-driven platforms programmatically 
              discover, book, and engage vetted cybersecurity professionals.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/marketplace/docs">
                <Button variant="outline" size="lg">
                  <BookOpen className="h-4 w-4 mr-2" /> API & MCP Docs
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{talent?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Verified Talent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-xs text-muted-foreground">Specialisms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{bounties?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Open Bounties</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="talent" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="talent">
              <Users className="h-4 w-4 mr-2" /> Browse Talent
            </TabsTrigger>
            <TabsTrigger value="bounties">
              <Target className="h-4 w-4 mr-2" /> Task Bounties
            </TabsTrigger>
          </TabsList>

          {/* Talent Tab */}
          <TabsContent value="talent" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by skill, certification, specialism..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={clearanceFilter} onValueChange={setClearanceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Clearance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clearances</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="BPSS">BPSS</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="DV">DV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {talentLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading talent...</div>
            ) : talent?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No marketplace talent found. Candidates can opt in from their dashboard.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {talent?.map((t: any) => (
                  <Card key={t.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                              {(t.profiles?.full_name || "?")[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${availabilityColors[t.availability_status] || "bg-muted"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{t.profiles?.full_name || "Anonymous"}</h3>
                            <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {t.marketplace_headline || t.title || "Cybersecurity Professional"}
                          </p>
                        </div>
                      </div>

                      {t.profiles?.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" /> {t.profiles.location}
                        </div>
                      )}

                      {t.security_clearance && t.security_clearance !== "none" && (
                        <Badge variant="outline" className="text-xs mb-2 mr-1">
                          {t.security_clearance} Cleared
                        </Badge>
                      )}

                      {t.specializations?.slice(0, 3).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs mr-1 mb-1">
                          {s}
                        </Badge>
                      ))}

                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          {t.day_rate_gbp && (
                            <span className="font-semibold text-primary">£{Number(t.day_rate_gbp).toLocaleString()}/day</span>
                          )}
                          {Number(t.average_rating) > 0 && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                              {Number(t.average_rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {t.response_time_hours}h
                          </span>
                          <BookTalentDialog
                            talentUserId={t.user_id}
                            talentName={t.profiles?.full_name || "This professional"}
                            dayRate={t.day_rate_gbp}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bounties Tab */}
          <TabsContent value="bounties" className="space-y-6">
            {bountiesLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading bounties...</div>
            ) : bounties?.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No open bounties at the moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {bounties?.map((b: any) => (
                  <Card key={b.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={urgencyColors[b.urgency] || ""}>
                              {b.urgency}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {b.source === "mcp" ? "MCP" : b.source === "api" ? "API" : "Platform"}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{b.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Posted by {b.client?.full_name || b.client?.username || "Anonymous"}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{b.description}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {b.category && (
                          <Badge variant="secondary" className="text-xs">{b.category.name}</Badge>
                        )}
                        {b.required_clearance && b.required_clearance !== "none" && (
                          <Badge variant="outline" className="text-xs">
                            {b.required_clearance} Required
                          </Badge>
                        )}
                        {b.location_requirement && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" /> {b.location_requirement}
                            {b.location_city && ` — ${b.location_city}`}
                          </Badge>
                        )}
                      </div>

                      {b.required_certifications?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {b.required_certifications.map((c: string) => (
                            <Badge key={c} className="text-xs bg-primary/10 text-primary border-primary/20">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="font-semibold text-primary">
                          £{Number(b.budget_min_gbp || 0).toLocaleString()} – £{Number(b.budget_max_gbp || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {b.current_applicants}/{b.max_applicants} applicants
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* How It Works */}
        <div className="mt-16 mb-8">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">For Security Teams</h3>
                <p className="text-sm text-muted-foreground">
                  Post your requirement or search our verified talent pool. 
                  Book, engage, and pay with full audit trail.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Code className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">For AI Agents & Platforms</h3>
                <p className="text-sm text-muted-foreground">
                  Connect via MCP server or REST API. Programmatically search and 
                  auto-book verified professionals.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">For Professionals</h3>
                <p className="text-sm text-muted-foreground">
                  Create your profile, get verified against industry standards, and 
                  receive bookings from clients and AI platforms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Task Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories?.map((cat: any) => {
              const Icon = iconMap[cat.icon] || Shield;
              return (
                <Card key={cat.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
