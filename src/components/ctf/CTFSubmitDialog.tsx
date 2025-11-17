import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CTFSubmitDialogProps {
  challenge: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CTFSubmitDialog({ challenge, open, onOpenChange }: CTFSubmitDialogProps) {
  const [flag, setFlag] = useState('');
  const [unlockedHints, setUnlockedHints] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (submittedFlag: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('ctf-submit-flag', {
        body: {
          challengeId: challenge.id,
          flag: submittedFlag,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.correct) {
        toast({
          title: '🎉 Correct!',
          description: `You earned ${data.pointsAwarded} points!`,
        });
        queryClient.invalidateQueries({ queryKey: ['ctf-user-submissions'] });
        queryClient.invalidateQueries({ queryKey: ['ctf-user-stats'] });
        onOpenChange(false);
      } else {
        toast({
          title: '❌ Incorrect',
          description: 'Try again! Check your flag format.',
          variant: 'destructive',
        });
      }
      setFlag('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit flag',
        variant: 'destructive',
      });
    },
  });

  const unlockHint = (index: number) => {
    setUnlockedHints([...unlockedHints, index]);
    toast({
      title: 'Hint Unlocked',
      description: `You spent ${challenge.hints[index].cost} points`,
    });
  };

  const hints = challenge.hints || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl">{challenge.title}</DialogTitle>
            <Badge className="text-lg">{challenge.points} pts</Badge>
          </div>
          <DialogDescription className="text-base">
            {challenge.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Challenge Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge className="ml-2" variant="outline">
                    {challenge.difficulty}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <Badge className="ml-2" variant="outline">
                    {challenge.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hints */}
          {hints.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Hints
              </h3>
              {hints.map((hint: any, index: number) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    {unlockedHints.includes(index) ? (
                      <p className="text-sm">{hint.hint}</p>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unlockHint(index)}
                      >
                        Unlock Hint {index + 1} ({hint.cost} points)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Submit Flag */}
          <div className="space-y-3">
            <h3 className="font-semibold">Submit Flag</h3>
            <div className="flex gap-2">
              <Input
                placeholder="FLAG{...}"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && flag.trim()) {
                    submitMutation.mutate(flag.trim());
                  }
                }}
              />
              <Button
                onClick={() => submitMutation.mutate(flag.trim())}
                disabled={!flag.trim() || submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Flags are case-sensitive and must match exactly
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
