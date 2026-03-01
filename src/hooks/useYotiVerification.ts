import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type VerificationType = "identity" | "rtw";
export type VerificationStatus = "pending" | "in_progress" | "completed" | "failed" | "expired" | null;

export function useYotiVerification(userId: string | undefined) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  // Fetch latest verification status for both types
  const { data: verifications, isLoading } = useQuery({
    queryKey: ["yoti-verifications", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("yoti_verifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const getLatest = (type: VerificationType) => {
    if (!verifications) return null;
    return verifications.find((v: any) => v.verification_type === type) || null;
  };

  const identityVerification = getLatest("identity");
  const rtwVerification = getLatest("rtw");

  const createSession = async (type: VerificationType) => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("yoti-create-session", {
        body: { verification_type: type },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["yoti-verifications", userId] });
      return data;
    } catch (err: any) {
      toast.error("Failed to create verification session", { description: err.message });
      return null;
    } finally {
      setCreating(false);
    }
  };

  const simulateComplete = async (verificationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("yoti-check-status", {
        body: { verification_id: verificationId, simulate_complete: true },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["yoti-verifications", userId] });
      toast.success("Verification completed successfully!");
      return data;
    } catch (err: any) {
      toast.error("Verification check failed", { description: err.message });
      return null;
    }
  };

  return {
    identityVerification,
    rtwVerification,
    isLoading,
    creating,
    createSession,
    simulateComplete,
    identityStatus: (identityVerification?.status || null) as VerificationStatus,
    rtwStatus: (rtwVerification?.status || null) as VerificationStatus,
  };
}
