import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Linkedin, Twitter, Share2, Check, Facebook, Instagram, Link2 } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  shareText: string;
  shareUrl: string;
  hashtags?: string;
  title?: string;
  onDownload?: () => Promise<string | null>;
  variant?: 'full' | 'compact' | 'icons-only';
  showCard?: boolean;
}

export function SocialShareButtons({
  shareText,
  shareUrl,
  hashtags = '#cybersecurity #infosec #cydena',
  title = 'Share',
  onDownload,
  variant = 'full',
  showCard = true,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToReddit = () => {
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    window.open(redditUrl, '_blank', 'width=600,height=600');
  };

  const shareToInstagram = async () => {
    if (onDownload) {
      setIsGenerating(true);
      const dataUrl = await onDownload();
      setIsGenerating(false);
      if (dataUrl) {
        toast.success('Image downloaded! Open Instagram and share from your camera roll.', { duration: 5000 });
      }
    } else {
      toast.info('Download the image and share it on Instagram', { duration: 3000 });
    }
  };

  const copyShareLink = async () => {
    const fullText = `${shareText} ${shareUrl}`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async () => {
    if (!onDownload) return;
    setIsGenerating(true);
    await onDownload();
    setIsGenerating(false);
  };

  const buttons = (
    <div className={`flex flex-wrap gap-2 ${variant === 'icons-only' ? 'justify-start' : 'justify-center'}`}>
      <Button
        variant="outline"
        size={variant === 'icons-only' ? 'icon' : 'sm'}
        onClick={shareToLinkedIn}
        className={variant === 'icons-only' ? 'h-8 w-8' : 'gap-2'}
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4 text-[#0077B5]" />
        {variant === 'full' && 'LinkedIn'}
      </Button>
      <Button
        variant="outline"
        size={variant === 'icons-only' ? 'icon' : 'sm'}
        onClick={shareToTwitter}
        className={variant === 'icons-only' ? 'h-8 w-8' : 'gap-2'}
        title="Share on X/Twitter"
      >
        <Twitter className="w-4 h-4 text-[#1DA1F2]" />
        {variant === 'full' && 'Twitter'}
      </Button>
      <Button
        variant="outline"
        size={variant === 'icons-only' ? 'icon' : 'sm'}
        onClick={shareToFacebook}
        className={variant === 'icons-only' ? 'h-8 w-8' : 'gap-2'}
        title="Share on Facebook"
      >
        <Facebook className="w-4 h-4 text-[#1877F2]" />
        {variant === 'full' && 'Facebook'}
      </Button>
      <Button
        variant="outline"
        size={variant === 'icons-only' ? 'icon' : 'sm'}
        onClick={shareToReddit}
        className={variant === 'icons-only' ? 'h-8 w-8' : 'gap-2'}
        title="Share on Reddit"
      >
        <svg className="w-4 h-4 text-[#FF4500]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
        {variant === 'full' && 'Reddit'}
      </Button>
      {onDownload && (
        <Button
          variant="outline"
          size={variant === 'icons-only' ? 'icon' : 'sm'}
          onClick={shareToInstagram}
          disabled={isGenerating}
          className={variant === 'icons-only' ? 'h-8 w-8' : 'gap-2'}
          title="Share on Instagram"
        >
          <Instagram className="w-4 h-4 text-[#E4405F]" />
          {variant === 'full' && 'Instagram'}
        </Button>
      )}
      <Button
        variant="outline"
        size={variant === 'icons-only' ? 'icon' : 'sm'}
        onClick={copyShareLink}
        className={variant === 'icons-only' ? 'h-8 w-8' : 'gap-2'}
        title="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
        {variant === 'full' && (copied ? 'Copied!' : 'Copy')}
      </Button>
      {onDownload && (
        <Button
          variant="outline"
          size={variant === 'icons-only' ? 'icon' : 'sm'}
          onClick={downloadImage}
          disabled={isGenerating}
          className={variant === 'icons-only' ? 'h-8 w-8' : 'gap-2'}
          title="Download image"
        >
          <Download className="w-4 h-4" />
          {variant === 'full' && (isGenerating ? 'Generating...' : 'Download')}
        </Button>
      )}
    </div>
  );

  if (!showCard) {
    return buttons;
  }

  return (
    <Card className="p-4 bg-muted/30 border-border/50">
      <p className="text-sm text-muted-foreground mb-3 text-center">{title}</p>
      {buttons}
    </Card>
  );
}
