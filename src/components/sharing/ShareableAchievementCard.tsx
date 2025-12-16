import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Linkedin, Twitter, Share2, Check, Award, Shield, Trophy, Zap, Facebook, Instagram } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export type AchievementType = 'certification' | 'ctf' | 'level_up' | 'hr_ready' | 'badge';

interface ShareableAchievementCardProps {
  type: AchievementType;
  title: string;
  subtitle?: string;
  userName: string;
  avatarUrl?: string;
  date?: string;
  xpEarned?: number;
  level?: number;
  badgeColor?: string;
}

const achievementConfig = {
  certification: {
    icon: Award,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    bgGradient: 'from-amber-950/90 via-orange-950/90 to-red-950/90',
    label: 'Certification Earned',
    emoji: '🏆'
  },
  ctf: {
    icon: Shield,
    gradient: 'from-cyan-500 via-blue-500 to-purple-500',
    bgGradient: 'from-cyan-950/90 via-blue-950/90 to-purple-950/90',
    label: 'CTF Challenge Completed',
    emoji: '🎯'
  },
  level_up: {
    icon: Zap,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    bgGradient: 'from-green-950/90 via-emerald-950/90 to-teal-950/90',
    label: 'Level Up!',
    emoji: '⚡'
  },
  hr_ready: {
    icon: Check,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgGradient: 'from-violet-950/90 via-purple-950/90 to-fuchsia-950/90',
    label: 'HR-Ready Verified',
    emoji: '✅'
  },
  badge: {
    icon: Trophy,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    bgGradient: 'from-pink-950/90 via-rose-950/90 to-red-950/90',
    label: 'Badge Unlocked',
    emoji: '🎖️'
  }
};

export function ShareableAchievementCard({
  type,
  title,
  subtitle,
  userName,
  avatarUrl,
  date,
  xpEarned,
  level,
}: ShareableAchievementCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = achievementConfig[type];
  const Icon = config.icon;

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
    link.download = `cydena-${type}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Image downloaded!');
  };

  const shareToLinkedIn = () => {
    const text = `${config.emoji} ${config.label}: ${title}\n\nJust earned this on @Cydena - the cybersecurity talent platform!\n\n#cybersecurity #infosec #career #cydena`;
    const url = 'https://cydena.com';
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const shareToTwitter = () => {
    const text = `${config.emoji} ${config.label}: ${title}\n\nJust earned this on @Cydena!\n\n#cybersecurity #infosec`;
    const url = 'https://cydena.com';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const url = 'https://cydena.com';
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${config.emoji} ${config.label}: ${title} - Just earned this on Cydena!`)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToInstagram = async () => {
    // Instagram doesn't have a web share API - download image for manual sharing
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = `cydena-${type}-instagram.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Image downloaded! Open Instagram and share from your camera roll.', { duration: 5000 });
  };

  const copyShareLink = async () => {
    const shareText = `${config.emoji} ${config.label}: ${title} - Check out my achievement on Cydena! https://cydena.com`;
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* The Card to be captured */}
      <div
        ref={cardRef}
        className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl"
        style={{ aspectRatio: '1.91/1' }}
      >
        {/* Background with gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient}`} />
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between">
          {/* Top section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={userName}
                  className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-lg">{userName}</p>
                {date && (
                  <p className="text-white/60 text-sm">{date}</p>
                )}
              </div>
            </div>
            
            {/* Achievement icon */}
            <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Middle section - Achievement */}
          <div className="flex-1 flex flex-col justify-center py-2">
            <Badge className={`w-fit mb-2 bg-gradient-to-r ${config.gradient} text-white border-0 text-xs px-3 py-1`}>
              {config.label}
            </Badge>
            <h2 className="text-white font-bold text-2xl leading-tight mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/70 text-sm">{subtitle}</p>
            )}
          </div>

          {/* Bottom section */}
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              {xpEarned && (
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-sm">+{xpEarned} XP</span>
                </div>
              )}
              {level && (
                <div className="flex items-center gap-1">
                  <span className="text-white/60 text-sm">Level</span>
                  <span className="text-white font-bold">{level}</span>
                </div>
              )}
            </div>
            
            {/* Cydena branding */}
            <div className="flex items-center gap-2">
              <img 
                src="/logos/cydena-logo.png" 
                alt="Cydena" 
                className="h-6 w-auto brightness-0 invert opacity-80"
              />
              <span className="text-white/80 font-semibold text-sm">cydena.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <p className="text-sm text-muted-foreground mb-3 text-center">Share your achievement</p>
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
  );
}
