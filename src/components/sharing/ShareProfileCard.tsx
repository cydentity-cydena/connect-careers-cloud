import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Linkedin, Twitter, Share2, Check, Shield, Award, Star, Facebook, Instagram, Trophy, Calendar, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ShareProfileCardProps {
  userName: string;
  title?: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  certCount: number;
  certNames?: string[];
  specializations?: string[];
  skills?: string[];
  isHrReady?: boolean;
  profileUrl?: string;
  ctfRank?: number | null;
  achievementsCount?: number;
  memberSince?: Date | null;
}

// Calculate XP needed per level (simple formula)
const getXpForLevel = (level: number) => level * 100;

export function ShareProfileCard({
  userName,
  title,
  avatarUrl,
  level,
  totalXp,
  certCount,
  certNames = [],
  specializations = [],
  skills = [],
  isHrReady,
  profileUrl,
  ctfRank,
  achievementsCount = 0,
  memberSince,
}: ShareProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      // Ensure the "export mode" render commits before rasterizing
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      // Ensure web fonts are fully loaded before rasterizing (prevents layout shifts in the export)
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // One more frame to let text/layout settle after fonts
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
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

  // Format member since date
  const formatMemberSince = (date: Date | null) => {
    if (!date) return null;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="space-y-4">
      {/* The Card to be captured */}
      <div
        ref={cardRef}
        className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl"
        style={{ aspectRatio: '1/1' }}
      >
        {/* Background gradient - deep navy to purple */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #2d1b4e 50%, #1a1a2e 75%, #0f0f23 100%)'
          }}
        />
        
        {/* Purple glow accents */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/4 w-64 h-64 rounded-full blur-3xl"
            style={{
              left: '50%',
              marginLeft: '-128px',
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)' }}
          />
        </div>

        {/* Hex pattern - more visible */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='43.3' viewBox='0 0 50 43.3' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L50 14.43v14.43L25 43.3 0 28.86V14.43z' fill='none' stroke='%239333ea' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '50px 43.3px'
          }}
        />

        {/* Content */}
        <div className="relative h-full p-5 pb-8 flex flex-col">
          {/* Header with logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '12px', gap: '8px' }}>
            <img
              src="/logos/cydena-logo.png"
              alt="Cydena"
              style={{ height: '20px', width: 'auto' }}
            />
            {isHrReady && (
              isGenerating ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#4ade80',
                    fontSize: '10px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Check style={{ width: '10px', height: '10px', flexShrink: 0 }} />
                  <span>HR-Ready</span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: '24px',
                    padding: '0 10px',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Check style={{ width: '10px', height: '10px', flexShrink: 0, transform: 'translateY(-0.5px)' }} />
                  <span style={{ display: 'block', lineHeight: 1, transform: 'translateY(-0.5px)' }}>HR-Ready</span>
                </div>
              )
            )}
            {memberSince && (
              isGenerating ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '10px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Calendar style={{ width: '10px', height: '10px', flexShrink: 0 }} />
                  <span>{formatMemberSince(memberSince)}</span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: '24px',
                    padding: '0 10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Calendar style={{ width: '10px', height: '10px', flexShrink: 0, transform: 'translateY(-0.5px)' }} />
                  <span style={{ display: 'block', lineHeight: 1, transform: 'translateY(-0.5px)' }}>{formatMemberSince(memberSince)}</span>
                </div>
              )
            )}
          </div>

          {/* Profile section */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* Level badge */}
            <div className="relative mb-4">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6366f1 100%)',
                  padding: '3px'
                }}
              >
                <div className="w-full h-full rounded-full bg-[#1a1a2e] flex items-center justify-center">
                  <div 
                    className="w-16 h-16 rounded-full flex flex-col items-center justify-center"
                    style={{
                      background: 'linear-gradient(180deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)'
                    }}
                  >
                    <span className="text-white/80 text-[9px] font-medium tracking-wider">LVL</span>
                    <span className="text-white font-bold text-xl leading-none">{level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Username */}
            <h2 className="text-white font-bold text-xl mb-0.5 tracking-wide">{userName}</h2>
            {title && (
              <p className="text-purple-300/90 text-xs font-medium mb-2">{title}</p>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-center space-x-4 mb-2">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
                  <span className="font-bold text-lg text-cyan-400">{totalXp.toLocaleString()}</span>
                </div>
                <span className="text-white/40 text-[10px] tracking-wider">XP</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Award className="w-4 h-4 text-yellow-400" strokeWidth={1.5} />
                  <span className="font-bold text-lg text-yellow-400">{certCount}</span>
                </div>
                <span className="text-white/40 text-[10px] tracking-wider">Certs</span>
              </div>
              {achievementsCount > 0 && (
                <>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Zap className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
                      <span className="font-bold text-lg text-purple-400">{achievementsCount}</span>
                    </div>
                    <span className="text-white/40 text-[10px] tracking-wider">Badges</span>
                  </div>
                </>
              )}
              {ctfRank && ctfRank <= 100 && (
                <>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Trophy className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                      <span className="font-bold text-lg text-orange-400">#{ctfRank}</span>
                    </div>
                    <span className="text-white/40 text-[10px] tracking-wider">CTF</span>
                  </div>
                </>
              )}
            </div>

            {/* Top Certifications */}
            {certNames.length > 0 && (
              <div className="mb-2">
                <p className="text-white/50 text-[9px] uppercase tracking-widest mb-1">Top Certifications</p>
                <p className="text-white/90 text-xs font-medium">
                  {certNames.slice(0, 3).join(' • ')}
                </p>
              </div>
            )}

            {/* Skills Tags */}
            {skills.length > 0 && (
              isGenerating ? (
                <div
                  style={{
                    marginBottom: '8px',
                    color: 'rgba(103, 232, 249, 0.9)',
                    fontSize: '10px',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {skills.slice(0, 3).join(' • ')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                  {skills.slice(0, 3).map((skill, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '20px',
                        padding: '0 6px',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        color: 'rgba(103, 232, 249, 0.9)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '9999px',
                        fontSize: '9px',
                        fontWeight: 500,
                      }}
                    >
                      <span style={{ display: 'block', lineHeight: 1, transform: 'translateY(-0.5px)' }}>{skill}</span>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Specializations */}
            {specializations.length > 0 && (
              isGenerating ? (
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '10px',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {specializations.slice(0, 2).join(' • ')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px' }}>
                  {specializations.slice(0, 2).map((spec, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        height: '20px',
                        padding: '0 6px',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: '9999px',
                        fontSize: '9px',
                        fontWeight: 500,
                      }}
                    >
                      <Shield style={{ width: '8px', height: '8px', color: '#a855f7', flexShrink: 0, transform: 'translateY(-0.5px)' }} />
                      <span style={{ display: 'block', lineHeight: 1, transform: 'translateY(-0.5px)' }}>{spec}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-white/30 text-[10px] tracking-widest">
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
