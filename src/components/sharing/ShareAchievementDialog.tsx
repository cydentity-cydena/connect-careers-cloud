import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShareableAchievementCard, AchievementType } from './ShareableAchievementCard';

interface ShareAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: AchievementType;
  title: string;
  subtitle?: string;
  userName: string;
  avatarUrl?: string;
  date?: string;
  xpEarned?: number;
  level?: number;
}

export function ShareAchievementDialog({
  open,
  onOpenChange,
  ...cardProps
}: ShareAchievementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Share Your Achievement 🎉</DialogTitle>
        </DialogHeader>
        <ShareableAchievementCard {...cardProps} />
      </DialogContent>
    </Dialog>
  );
}
