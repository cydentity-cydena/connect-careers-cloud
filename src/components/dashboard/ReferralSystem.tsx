import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Users, Gift, Check } from 'lucide-react';

export const ReferralSystem = () => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, rewarded: 0 });
  const { toast } = useToast();

  const referralUrl = `${window.location.origin}/auth?ref=${referralCode}`;

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create referral code
      let { data: existingCode } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .single();

      if (!existingCode) {
        const { data: generatedCode } = await supabase
          .rpc('generate_referral_code', { p_user_id: user.id });

        const { error } = await supabase
          .from('referral_codes')
          .insert({
            user_id: user.id,
            code: generatedCode
          });

        if (error) throw error;
        setReferralCode(generatedCode);
      } else {
        setReferralCode(existingCode.code);
      }

      // Get referral stats
      const { data: referrals } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_id', user.id);

      if (referrals) {
        setStats({
          total: referrals.length,
          completed: referrals.filter(r => r.status === 'completed' || r.status === 'rewarded').length,
          rewarded: referrals.filter(r => r.status === 'rewarded').length
        });
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join Cydena - Cybersecurity Career Platform");
    const body = encodeURIComponent(
      `I'm using Cydena to advance my cybersecurity career, and I think you'd love it too!\n\n` +
      `Join using my referral link and we'll both get bonus XP:\n${referralUrl}\n\n` +
      `Cydena helps cybersecurity professionals showcase verified skills, connect with top employers, and access exclusive training opportunities.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(referralUrl);
    const title = encodeURIComponent("Join me on Cydena - Cybersecurity Career Platform");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Refer Friends & Earn Rewards
        </CardTitle>
        <CardDescription>
          Share Cydena with your network and earn XP for every friend who joins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rewards Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Sign Up</p>
            </div>
            <p className="text-2xl font-bold text-primary">+50 XP</p>
            <p className="text-xs text-muted-foreground">When friend joins</p>
          </div>
          
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Profile Complete</p>
            </div>
            <p className="text-2xl font-bold text-primary">+100 XP</p>
            <p className="text-xs text-muted-foreground">Bonus when they complete profile</p>
          </div>

          <div className="p-3 bg-accent/50 rounded-lg border border-accent">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="h-4 w-4 text-accent-foreground" />
              <p className="text-sm font-medium">Their Bonus</p>
            </div>
            <p className="text-2xl font-bold text-accent-foreground">+25 XP</p>
            <p className="text-xs text-muted-foreground">Welcome bonus for joining</p>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Your Referral Stats</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Referred</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-foreground">{stats.rewarded}</p>
              <p className="text-xs text-muted-foreground">Bonuses Earned</p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={referralUrl}
              readOnly
              className="flex-1"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={shareViaEmail}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              onClick={shareOnLinkedIn}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-medium mb-1">💡 Pro Tips</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Share on LinkedIn to reach cybersecurity professionals</li>
            <li>• Mention specific benefits like verified certifications</li>
            <li>• Earn bonus XP when your referrals complete their profiles</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};