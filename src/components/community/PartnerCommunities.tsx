import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, Shield, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PartnerCommunity {
  id: string;
  name: string;
  description: string | null;
  platform: string;
  invite_url: string;
  logo_url: string | null;
  member_count: number | null;
  specializations: string[] | null;
  is_verified: boolean;
}

export function PartnerCommunities() {
  const { data: communities, isLoading } = useQuery({
    queryKey: ["partner-communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_communities")
        .select("*")
        .eq("is_active", true)
        .order("member_count", { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data as PartnerCommunity[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Partner Communities</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/50">
              <CardHeader className="pb-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-5 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <Card className="bg-card/50 border-dashed">
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Partner Communities Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            We're building partnerships with cybersecurity Discord communities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Partner Communities</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Join thriving cybersecurity communities
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map((community) => (
          <Card key={community.id} className="bg-card/50 hover:bg-card/80 transition-colors group">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {community.logo_url ? (
                  <img
                    src={community.logo_url}
                    alt={community.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    {community.name}
                    {community.is_verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {community.platform}
                    </Badge>
                    {community.member_count && (
                      <span className="text-xs">
                        • {community.member_count.toLocaleString()} members
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {community.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {community.description}
                </p>
              )}
              
              {community.specializations && community.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {community.specializations.slice(0, 3).map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {community.specializations.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{community.specializations.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                asChild
              >
                <a href={community.invite_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Community
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
