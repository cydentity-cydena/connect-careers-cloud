import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

type Course = {
  id: string;
  title: string;
  url: string;
  partner_slug: string;
  sequence_order: number;
  is_required: boolean;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pathwayName} - Learning Path</DialogTitle>
          <DialogDescription>
            Complete these courses in order to master this pathway
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
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{course.title}</h4>
                  {course.is_required && (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Provider: {course.partner_slug}
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(course.url, '_blank')}
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
