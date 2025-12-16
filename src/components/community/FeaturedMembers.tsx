import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Star, Award, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeaturedMember {
  id: string;
  user_id: string;
  spotlight_text: string | null;
  achievements_highlighted: any;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
    desired_job_title: string;
  };
  source: 'admin' | 'referral';
}

export const FeaturedMembers = () => {
  const [members, setMembers] = useState<FeaturedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFeaturedMembers();
  }, []);

  const loadFeaturedMembers = async () => {
    try {
      // Fetch admin-featured members
      const { data: adminFeatured, error: adminError } = await supabase
        .from('featured_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url,
            desired_job_title
          )
        `)
        .eq('is_active', true)
        .order('feature_date', { ascending: false })
        .limit(3);

      if (adminError) throw adminError;

      // Fetch referral-featured profiles (featured_until in future)
      const { data: referralFeatured, error: referralError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, desired_job_title, featured_until')
        .gt('featured_until', new Date().toISOString())
        .order('featured_until', { ascending: false })
        .limit(3);

      if (referralError) throw referralError;

      // Combine and dedupe (admin-featured takes priority)
      const adminUserIds = new Set(adminFeatured?.map(m => m.user_id) || []);
      
      const combinedMembers: FeaturedMember[] = [
        ...(adminFeatured || []).map(m => ({
          ...m,
          source: 'admin' as const
        })),
        ...(referralFeatured || [])
          .filter(p => !adminUserIds.has(p.id))
          .map(p => ({
            id: p.id,
            user_id: p.id,
            spotlight_text: 'Community Builder - Referred 2+ members!',
            achievements_highlighted: ['Community Builder'],
            profiles: {
              full_name: p.full_name,
              username: p.username,
              avatar_url: p.avatar_url,
              desired_job_title: p.desired_job_title
            },
            source: 'referral' as const
          }))
      ];

      setMembers(combinedMembers.slice(0, 6));
    } catch (error) {
      console.error('Error loading featured members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || members.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Featured Members</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card 
            key={member.id} 
            className="hover:shadow-lg transition-all cursor-pointer border-2 border-yellow-500/20"
            onClick={() => navigate(`/profile/${member.user_id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-yellow-500/20">
                  <AvatarImage src={member.profiles.avatar_url} />
                  <AvatarFallback>
                    {member.profiles.full_name?.charAt(0) || member.profiles.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    @{member.profiles.username}
                    {member.source === 'referral' ? (
                      <Users className="w-4 h-4 text-primary" />
                    ) : (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </CardTitle>
                  {member.profiles.desired_job_title && (
                    <p className="text-xs text-muted-foreground">
                      {member.profiles.desired_job_title}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.spotlight_text && (
                <p className="text-sm text-muted-foreground">
                  {member.spotlight_text}
                </p>
              )}
              {member.achievements_highlighted && Array.isArray(member.achievements_highlighted) && member.achievements_highlighted.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.achievements_highlighted.slice(0, 3).map((achievement: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
