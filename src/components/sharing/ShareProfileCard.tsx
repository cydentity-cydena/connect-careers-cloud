import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Linkedin, Twitter, Share2, Check, Shield, Award, Star, Facebook, Instagram } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ShareProfileCardProps {
  userName: string;
  title?: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  certCount: number;
  specializations?: string[];
  isHrReady?: boolean;
  profileUrl?: string;
}

export function ShareProfileCard({
  userName,
  title,
  avatarUrl,
  level,
  totalXp,
  certCount,
  specializations = [],
  isHrReady,
  profileUrl,
}: ShareProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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
    link.download = `cydena-profile-${userName}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Image downloaded!');
  };

  const shareToLinkedIn = () => {
    const text = `🛡️ Check out my cybersecurity profile on Cydena!\n\n📊 Level ${level} | ${certCount} Certifications | ${totalXp.toLocaleString()} XP\n\n#cybersecurity #infosec #career #opentowork`;
    const url = profileUrl || 'https://cydena.com';
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const shareToTwitter = () => {
    const text = `🛡️ My cybersecurity profile on @Cydena\n\n📊 Level ${level} | ${certCount} Certs | ${totalXp.toLocaleString()} XP\n\n#cybersecurity #infosec`;
    const url = profileUrl || 'https://cydena.com';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const url = profileUrl || 'https://cydena.com';
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`🛡️ Check out my cybersecurity profile on Cydena! Level ${level} | ${certCount} Certifications`)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToInstagram = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = `cydena-profile-instagram.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Image downloaded! Open Instagram and share from your camera roll.', { duration: 5000 });
  };

  const copyShareLink = async () => {
    const shareText = `🛡️ Check out my cybersecurity profile on Cydena! Level ${level} | ${certCount} Certifications | ${totalXp.toLocaleString()} XP - ${profileUrl || 'https://cydena.com'}`;
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
        style={{ aspectRatio: '1/1' }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Hex pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}
        />

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col">
          {/* Header with logo */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logos/cydena-logo.png" 
                alt="Cydena" 
                className="h-5 w-auto brightness-0 invert opacity-80"
              />
              <span className="text-white/60 text-xs font-medium">CYDENA.COM</span>
            </div>
            {isHrReady && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <Check className="w-3 h-3 mr-1" />
                HR-Ready
              </Badge>
            )}
          </div>

          {/* Profile section */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={userName}
                  className="w-24 h-24 rounded-full border-4 border-purple-500/50 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-purple-500/50 bg-purple-500/20 flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Level badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full px-3 py-1">
                <span className="text-white font-bold text-sm">LVL {level}</span>
              </div>
            </div>

            {/* Name and title */}
            <h2 className="text-white font-bold text-2xl mb-1">{userName}</h2>
            {title && (
              <p className="text-purple-300 text-sm mb-4">{title}</p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-400">
                  <Star className="w-4 h-4" />
                  <span className="font-bold text-lg">{totalXp.toLocaleString()}</span>
                </div>
                <span className="text-white/50 text-xs">XP</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <Award className="w-4 h-4" />
                  <span className="font-bold text-lg">{certCount}</span>
                </div>
                <span className="text-white/50 text-xs">Certs</span>
              </div>
            </div>

            {/* Specializations */}
            {specializations.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {specializations.slice(0, 3).map((spec, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="bg-white/5 text-white/80 border-white/20 text-xs"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {spec}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/40 text-xs">
              Cybersecurity Talent Platform
            </p>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <p className="text-sm text-muted-foreground mb-3 text-center">Share your profile</p>
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
