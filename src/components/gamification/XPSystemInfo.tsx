import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const XPSystemInfo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Understanding Your Progress</DialogTitle>
          <DialogDescription>
            Learn how the XP, Points, Level, and Profile Completion systems work
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* XP Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-secondary/10 px-3 py-1 rounded">
                <span className="text-sm font-bold text-secondary">550 XP</span>
              </div>
              <h3 className="font-semibold">Total XP (Experience Points)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your permanent progression score that never decreases. Earn XP by completing courses, 
              getting endorsements, adding certifications, and participating in the community.
            </p>
          </div>

          {/* Level Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 px-3 py-1 rounded">
                <span className="text-sm font-bold text-primary">Level 6</span>
              </div>
              <h3 className="font-semibold">Level</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your level automatically increases as you earn more XP:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Level 1: 0-99 XP</li>
              <li>• Level 2: 100-249 XP</li>
              <li>• Level 3: 250-499 XP</li>
              <li>• Level 4: 500-999 XP</li>
              <li>• Level 5: 1,000-1,999 XP</li>
              <li>• Level 6: 2,000-3,999 XP</li>
              <li>• Level 7: 4,000-7,999 XP</li>
              <li>• Level 8: 8,000-15,999 XP</li>
              <li>• Level 9: 16,000-31,999 XP</li>
              <li>• Level 10: 32,000+ XP</li>
            </ul>
          </div>

          {/* Points Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-accent/10 px-3 py-1 rounded">
                <span className="text-sm font-bold text-accent">550 Points</span>
              </div>
              <h3 className="font-semibold">Points (Spendable Currency)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your spendable currency balance. Use points to unlock premium training courses. 
              When you spend points, your XP stays the same, but your points balance decreases.
            </p>
          </div>

          {/* Profile Completion Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-muted/50 px-3 py-1 rounded">
                <span className="text-sm font-bold">85%</span>
              </div>
              <h3 className="font-semibold">Profile Completion</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Shows how complete your profile is. Add more information, skills, certifications, 
              and experience to reach 100% completion and stand out to employers.
            </p>
          </div>

          {/* How to Earn Section */}
          <div className="space-y-2">
            <h3 className="font-semibold">How to Earn XP & Points</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Complete training courses</li>
              <li>• Add certifications to your profile</li>
              <li>• Participate in the community</li>
              <li>• Get peer endorsements</li>
              <li>• Take skills assessments</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
