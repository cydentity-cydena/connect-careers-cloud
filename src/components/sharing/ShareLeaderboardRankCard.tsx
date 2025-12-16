import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Linkedin, Twitter, Share2, Check, Facebook, Instagram, Trophy, Medal, Award, Users, Shield, Flame } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type LeaderboardType = 'professional' | 'community' | 'securityiq';

interface ShareLeaderboardRankCardProps {
  rank: 1 | 2 | 3;
  username: string;
  title?: string;
  score: number;
  scoreLabel: string;
  leaderboardType: LeaderboardType;
  isHrReady?: boolean;
  streak?: number;
}

const rankConfig = {
  1: {
    label: '1st Place',
    emoji: '🥇',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    iconBg: '#b45309',
    Icon: Trophy,
    borderColor: '#f59e0b',
    textColor: '#1a1a2e',
  },
  2: {
    label: '2nd Place',
    emoji: '🥈',
    gradient: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #6b7280 100%)',
    iconBg: '#4b5563',
    Icon: Medal,
    borderColor: '#9ca3af',
    textColor: '#1a1a2e',
  },
  3: {
    label: '3rd Place',
    emoji: '🏆',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)',
    iconBg: '#9a3412',
    Icon: Award,
    borderColor: '#ea580c',
    textColor: '#ffffff',
  },
};

const leaderboardConfig = {
  professional: {
    title: 'Professional XP Leaderboard',
    icon: Trophy,
    hashtag: '#cybersecurity #infosec #toptalent',
  },
  community: {
    title: 'Community Leaders',
    icon: Users,
    hashtag: '#cybersecurity #community #leadership',
  },
  securityiq: {
    title: 'Security IQ Leaderboard',
    icon: Shield,
    hashtag: '#cybersecurity #securityiq #dailychallenge',
  },
};

export function ShareLeaderboardRankCard({
  rank,
  username,
  title,
  score,
  scoreLabel,
  leaderboardType,
  isHrReady,
  streak,
}: ShareLeaderboardRankCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const config = rankConfig[rank];
  const lbConfig = leaderboardConfig[leaderboardType];
  const Icon = config.Icon;

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `cydena-leaderboard-${rank}-${username}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Image downloaded!');
  };

  const shareToLinkedIn = () => {
    const text = `${config.emoji} I ranked ${config.label} on Cydena's ${lbConfig.title}!\n\n📊 ${score.toLocaleString()} ${scoreLabel}\n\n${lbConfig.hashtag}`;
    const url = 'https://cydena.com/leaderboard';
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const shareToTwitter = () => {
    const text = `${config.emoji} I ranked ${config.label} on @Cydena's ${lbConfig.title}!\n\n📊 ${score.toLocaleString()} ${scoreLabel}\n\n${lbConfig.hashtag}`;
    const url = 'https://cydena.com/leaderboard';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const url = 'https://cydena.com/leaderboard';
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${config.emoji} I ranked ${config.label} on Cydena's ${lbConfig.title}! ${score.toLocaleString()} ${scoreLabel}`)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToInstagram = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = `cydena-leaderboard-instagram.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Image downloaded! Open Instagram and share from your camera roll.', { duration: 5000 });
  };

  const copyShareLink = async () => {
    const shareText = `${config.emoji} I ranked ${config.label} on Cydena's ${lbConfig.title}! ${score.toLocaleString()} ${scoreLabel} - https://cydena.com/leaderboard`;
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 gap-1 text-xs bg-white/20 border-white/30 hover:bg-white/30"
        >
          <Share2 className="h-3 w-3" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Achievement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* The Card to be captured */}
          <div
            ref={cardRef}
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ aspectRatio: '1/1' }}
          >
            {/* Background */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #2d1b4e 50%, #1a1a2e 75%, #0f0f23 100%)'
              }}
            />
            
            {/* Glow accents */}
            <div className="absolute inset-0">
              <div 
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${config.borderColor}40 0%, transparent 70%)` }}
              />
            </div>

            {/* Hex pattern */}
            <div 
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='43.3' viewBox='0 0 50 43.3' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L50 14.43v14.43L25 43.3 0 28.86V14.43z' fill='none' stroke='%239333ea' stroke-width='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: '50px 43.3px'
              }}
            />

            {/* Content */}
            <div className="relative h-full p-5 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <img 
                  src="/logos/cydena-logo.png" 
                  alt="Cydena" 
                  className="h-5 w-auto"
                />
                <Badge 
                  className="text-[10px] px-2 py-0.5"
                  style={{ 
                    background: `${config.borderColor}30`, 
                    color: config.borderColor,
                    borderColor: `${config.borderColor}50`
                  }}
                >
                  {lbConfig.title}
                </Badge>
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {/* Rank badge */}
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                  style={{ background: config.gradient }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: config.iconBg }}
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                </div>

                {/* Rank label */}
                <Badge 
                  className="text-sm px-3 py-1 mb-3 font-bold"
                  style={{ 
                    background: config.gradient,
                    color: config.textColor,
                    border: 'none'
                  }}
                >
                  {config.label}
                </Badge>

                {/* Username */}
                <h2 className="text-white font-bold text-xl mb-1">@{username}</h2>
                {title && (
                  <p className="text-purple-300/90 text-xs font-medium mb-3">{title}</p>
                )}

                {/* Score */}
                <div className="text-center mb-3">
                  <p 
                    className="text-4xl font-bold"
                    style={{ color: config.borderColor }}
                  >
                    {score.toLocaleString()}
                  </p>
                  <p className="text-white/60 text-xs uppercase tracking-wider">{scoreLabel}</p>
                </div>

                {/* Extra badges */}
                <div className="flex items-center gap-2">
                  {isHrReady && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-2 py-0.5">
                      <Check className="w-2.5 h-2.5 mr-1" />
                      HR-Ready
                    </Badge>
                  )}
                  {streak && streak > 0 && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] px-2 py-0.5">
                      <Flame className="w-2.5 h-2.5 mr-1" />
                      {streak} Day Streak
                    </Badge>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2">
                <p className="text-white/30 text-[10px] tracking-widest">
                  cydena.com/leaderboard
                </p>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <Card className="p-4 bg-muted/30 border-border/50">
            <p className="text-sm text-muted-foreground mb-3 text-center">Share your ranking</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={shareToLinkedIn}
                className="gap-2"
              >
                <Linkedin className="w-4 h-4 text-[#0077B5]" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareToTwitter}
                className="gap-2"
              >
                <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareToFacebook}
                className="gap-2"
              >
                <Facebook className="w-4 h-4 text-[#1877F2]" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareToInstagram}
                disabled={isGenerating}
                className="gap-2"
              >
                <Instagram className="w-4 h-4 text-[#E4405F]" />
                Instagram
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadImage}
                disabled={isGenerating}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Download'}
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
