import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type Course = {
  id: string;
  title: string;
  url: string;
  partner_slug: string;
  sequence_order: number;
  is_required: boolean;
  reward_amount?: number;
  is_free?: boolean;
};

type PathwayCoursesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathwayName: string;
  courses: Course[];
};

export const PathwayCoursesDialog = ({ 
  open, 
  onOpenChange, 
  pathwayName, 
  courses 
}: PathwayCoursesDialogProps) => {
  const sortedCourses = [...courses].sort((a, b) => a.sequence_order - b.sequence_order);

  const handleStartCourse = (course: Course) => {
    const url = course.url;
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success('Course opened in new tab. Good luck!');
    } else {
      toast.error('Invalid course URL. Please contact support.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="border-green-500 text-green-600">
              100% FREE
            </Badge>
          </div>
          <DialogTitle>{pathwayName} - Learning Path</DialogTitle>
          <DialogDescription>
            Complete these free courses in order to master this pathway
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {sortedCourses.map((course, index) => (
            <div 
              key={course.id} 
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-sm">{course.title}</h4>
                  <div className="flex items-center gap-1">
                    {course.is_required && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                    {course.reward_amount && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        +{course.reward_amount} XP
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Provider: <span className="font-medium">{course.partner_slug}</span>
                  {course.is_free && (
                    <span className="ml-2 text-green-600 font-medium">• FREE</span>
                  )}
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStartCourse(course)}
                  className="gap-2"
                >
                  Start Course
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {sortedCourses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No courses configured for this pathway yet.</p>
            <p className="text-sm mt-2">Check back soon for updates!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
