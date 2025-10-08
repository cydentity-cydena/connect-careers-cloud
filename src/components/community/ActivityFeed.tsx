import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Briefcase, GraduationCap, ThumbsUp, User, Code, BookOpen, Sparkles, Trash2, Edit } from 'lucide-react';
import { PostComments } from './PostComments';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Activity = {
  id: string;
  user_id: string | null;
  activity_type: string;
  title: string;
  description: string | null;
  metadata: any;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
};

const getActivityIcon = (type: string) => {
  const iconClass = "h-5 w-5";
  switch (type) {
    case 'certification': return <Award className={iconClass} />;
    case 'achievement_earned': return <Trophy className={iconClass} />;
    case 'work_added': return <Briefcase className={iconClass} />;
    case 'education_added': return <GraduationCap className={iconClass} />;
    case 'endorsement_received': return <ThumbsUp className={iconClass} />;
    case 'project_added': return <Code className={iconClass} />;
    case 'skill_added': return <BookOpen className={iconClass} />;
    case 'daily_content': return <Sparkles className={iconClass} />;
    default: return <User className={iconClass} />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'certification': return 'bg-primary/10 text-primary';
    case 'achievement_earned': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    case 'work_added': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'education_added': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'endorsement_received': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'project_added': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'daily_content': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const ActivityFeed = ({ limit = 20 }: { limit?: number }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
    checkAdminStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('activity-feed-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: 'is_public=eq.true'
        },
        (payload) => {
          setActivities(prev => [payload.new as Activity, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!roles);
  };

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          id,
          user_id,
          activity_type,
          title,
          description,
          metadata,
          created_at,
          profiles!activity_feed_user_id_fkey (
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivities(data as any || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activity_feed')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      setActivities(prev => prev.filter(a => a.id !== activityId));
      toast({
        title: "Post deleted",
        description: "The post has been removed"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const canModifyPost = (activity: Activity) => {
    return isAdmin || (currentUserId && activity.user_id === currentUserId);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const confirmDelete = (activityId: string) => {
    setPostToDelete(activityId);
    setDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (postToDelete) {
      handleDelete(postToDelete);
    }
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No activity yet. Be the first to share an achievement!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                  <AvatarFallback className={activity.user_id === null ? 'bg-cyan-500/20' : ''}>
                    {activity.user_id === null ? '🤖' : (activity.profiles?.username?.[0]?.toUpperCase() || 'U')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {activity.user_id === null ? 'Cydena AI' : `@${activity.profiles?.username || 'Anonymous'}`}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={`flex items-center gap-1 ${getActivityColor(activity.activity_type)}`}
                      >
                        {getActivityIcon(activity.activity_type)}
                        <span className="text-xs">
                          {activity.activity_type.replace(/_/g, ' ')}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                      {canModifyPost(activity) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(activity.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-1">{activity.title}</h4>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {activity.description}
                    </p>
                  )}
                  
                  {activity.metadata && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.metadata.tags?.map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <PostComments postId={activity.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};