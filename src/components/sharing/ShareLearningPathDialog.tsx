import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Youtube, Star, Play, Trophy } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SocialShareButtons } from './SocialShareButtons';

interface ShareLearningPathDialogProps {
  title: string;
  channelName: string;
  category: string;
  difficulty: string;
  totalXp: number;
  videoCount: number;
  completedCount: number;
  pathId: string;
  userName?: string;
  trigger?: React.ReactNode;
}

const difficultyColors: Record<string, { bg: string; text: string }> = {
  beginner: { bg: '#22c55e', text: '#ffffff' },
  intermediate: { bg: '#eab308', text: '#1a1a2e' },
  advanced: { bg: '#ef4444', text: '#ffffff' },
};

export function ShareLearningPathDialog({
  title,
  channelName,
  category,
  difficulty,
  totalXp,
  videoCount,
  completedCount,
  pathId,
  userName,
  trigger,
}: ShareLearningPathDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const progress = videoCount > 0 ? Math.round((completedCount / videoCount) * 100) : 0;
  const isComplete = completedCount === videoCount && videoCount > 0;
  const diffColors = difficultyColors[difficulty] || difficultyColors.beginner;

  const shareUrl = `https://cydena.com/learning-paths/${pathId}`;
  
  const shareText = isComplete
    ? `🎉 I just completed "${title}" on Cydena! Earned ${totalXp} XP learning from ${channelName}. Check it out!`
    : `📚 I'm learning "${title}" on Cydena - ${progress}% complete! Join me in mastering cybersecurity for free.`;

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      
      // Download the image
      const link = document.createElement('a');
      link.download = `cydena-learning-path-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Image downloaded!');
      
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
      return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <>
                <Trophy className="h-5 w-5 text-yellow-500" />
                Share Your Completion!
              </>
            ) : (
              <>
                <Share2 className="h-5 w-5" />
                Share This Learning Path
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* The Card to be captured */}
          <div
            ref={cardRef}
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ aspectRatio: '1.91/1' }}
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
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-30"
                style={{ background: '#ef4444' }}
              />
              <div 
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20"
                style={{ background: '#9333ea' }}
              />
            </div>

            {/* Content */}
            <div className="relative h-full p-5 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <img 
                  src="/logos/cydena-logo.png" 
                  alt="Cydena" 
                  className="h-5 w-auto"
                />
                <Badge 
                  className="text-[10px] px-2 py-0.5 capitalize"
                  style={{ 
                    background: `${diffColors.bg}30`, 
                    color: diffColors.bg,
                    borderColor: `${diffColors.bg}50`
                  }}
                >
                  {difficulty}
                </Badge>
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col justify-center">
                {/* YouTube icon + Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-red-500/20 shrink-0">
                    <Youtube className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight line-clamp-2">
                      {title}
                    </h2>
                    <p className="text-purple-300/80 text-sm mt-1">{channelName}</p>
                  </div>
                </div>

                {/* Category badge */}
                <Badge className="w-fit mb-3 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs capitalize">
                  {category.replace(/-/g, ' ')}
                </Badge>

                {/* Progress or completion */}
                {isComplete ? (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold">Completed!</span>
                    {userName && (
                      <span className="text-white/60 text-sm">by @{userName}</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60 flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        {completedCount}/{videoCount} videos
                      </span>
                      <span className="text-white font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-500 font-semibold text-sm">{totalXp} XP</span>
                </div>
                <p className="text-white/40 text-[10px] tracking-wider">
                  cydena.com/learning-paths
                </p>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <SocialShareButtons
            shareText={shareText}
            shareUrl={shareUrl}
            hashtags="#cybersecurity #learning #infosec #cydena"
            title={isComplete ? "Celebrate your achievement!" : "Invite others to learn"}
            onDownload={generateImage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
