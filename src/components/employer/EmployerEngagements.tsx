import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, CreditCard, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  accepted: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-indigo-500/20 text-indigo-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-destructive/20 text-destructive",
  paid: "bg-primary/20 text-primary",
};

export const EmployerEngagements = () => {
  const [payingId, setPayingId] = useState<string | null>(null);

  const { data: engagements, isLoading } = useQuery({
    queryKey: ["employer-engagements"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("marketplace_engagements")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handlePay = async (engagementId: string) => {
    setPayingId(engagementId);
    try {
      const { data, error } = await supabase.functions.invoke("create-marketplace-payment", {
        body: { engagement_id: engagementId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create payment session");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Engagements</h2>
        <p className="text-muted-foreground">
          Track and pay for marketplace engagements with talent
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading engagements...</div>
      ) : !engagements?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Handshake className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <h3 className="font-semibold mb-1">No engagements yet</h3>
            <p className="text-sm text-muted-foreground">
              Book talent from the marketplace or accept bounty applications to create engagements.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {engagements.map((e: any) => (
            <Card key={e.id} className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{e.title}</h3>
                      <Badge className={statusColors[e.status] || "bg-muted text-muted-foreground"}>
                        {e.status?.replace("_", " ")}
                      </Badge>
                    </div>
                    {e.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{e.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        Rate: <strong className="text-foreground">£{Number(e.agreed_rate_gbp || 0).toLocaleString()}</strong>
                      </span>
                      {e.total_estimated_gbp && (
                        <span>
                          Total: <strong className="text-foreground">£{Number(e.total_estimated_gbp).toLocaleString()}</strong>
                        </span>
                      )}
                      <span>Created: {format(new Date(e.created_at), "dd MMM yyyy")}</span>
                    </div>
                  </div>

                  {e.status === "completed" && (
                    <Button
                      onClick={() => handlePay(e.id)}
                      disabled={payingId === e.id}
                      className="flex-shrink-0"
                    >
                      {payingId === e.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Pay Now
                    </Button>
                  )}

                  {e.status === "paid" && (
                    <Badge variant="outline" className="flex-shrink-0 gap-1 text-emerald-400 border-emerald-500/30">
                      <ExternalLink className="h-3 w-3" />
                      Paid
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
