import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trophy, Zap, Star, X, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ReferralBlitzBanner = () => {
  const [userCount, setUserCount] = useState(0);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  
  const TARGET = 500;
  const progress = Math.min((userCount / TARGET) * 100, 100);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("referral-blitz-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Get user count using the SECURITY DEFINER function that bypasses RLS
    const { data: stats } = await supabase.rpc("get_community_stats");
    if (stats && stats.length > 0) {
      setUserCount(Number(stats[0].active_members) || 0);
    }

    // Get current user's referral code
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: codeData } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .single();
      
      if (codeData) {
        setReferralCode(codeData.code);
      }
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("referral-blitz-dismissed", "true");
    setIsDismissed(true);
  };

  const generateReferralCode = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to get your referral link.",
          variant: "destructive",
        });
        return;
      }

      // Generate the referral code using the RPC function
      const { data: generatedCode, error: rpcError } = await supabase
        .rpc('generate_referral_code', { p_user_id: user.id });

      if (rpcError) throw rpcError;

      // Insert the code into referral_codes table
      const { error: insertError } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: generatedCode
        });

      if (insertError) throw insertError;

      setReferralCode(generatedCode);
      
      // Auto-copy the link
      const link = `https://cydena.com/auth?ref=${generatedCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      
      toast({
        title: "Referral link created!",
        description: "Your link has been copied to clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error: any) {
      console.error("Error generating referral code:", error);
      toast({
        title: "Error",
        description: "Failed to generate referral link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralCode) return;
    
    const link = `https://cydena.com/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share it with your network to earn rewards.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (isDismissed || userCount >= TARGET) return null;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-cyan-500/5 to-emerald-500/5">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors z-10"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Progress section */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg">🚀 Help Us Hit 500 Members</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current members</span>
                <span className="font-bold text-primary">{userCount} / {TARGET}</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Only <span className="font-semibold text-foreground">{TARGET - userCount}</span> spots to go!
              </p>
            </div>
          </div>
          
          {/* Rewards section */}
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-sm">Invite 2+ people & get:</p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-xs">
                <Trophy className="h-3 w-3 text-amber-500" />
                <span>Community Builder Badge</span>
              </div>
              <div className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded-full text-xs">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span>500 Bonus XP</span>
              </div>
              <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full text-xs">
                <Star className="h-3 w-3 text-cyan-500" />
                <span>Featured Profile</span>
              </div>
            </div>
          </div>
          
          {/* CTA section */}
          <div className="flex flex-col gap-2">
            {referralCode ? (
              <Button 
                onClick={copyReferralLink}
                variant="cyber"
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Referral Link
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={generateReferralCode}
                variant="cyber"
                disabled={generating}
              >
                {generating ? "Generating..." : "Get Your Referral Link"}
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Share & earn rewards
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
