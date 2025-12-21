import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityFeed } from '@/components/community/ActivityFeed';
import { SkillPathways } from '@/components/community/SkillPathways';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { GenerateContentButton } from '@/components/community/GenerateContentButton';
import { WeeklyChallenges } from '@/components/community/WeeklyChallenges';
import { FeaturedMembers } from '@/components/community/FeaturedMembers';
import { PartnerCommunities } from '@/components/community/PartnerCommunities';
import { XPNotification } from '@/components/community/XPNotification';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { TrendingUp, Map, Users, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Community = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    activeMembers: 0,
    certsEarned: 0,
    projectsShared: 0
  });

  useEffect(() => {
    const init = async () => {
      await checkAccessAndRedirect();
      await fetchStats();
    };
    init();
  }, []);

  const fetchStats = async () => {
    try {
      // Use security definer function to get accurate counts
      const { data, error } = await supabase
        .rpc('get_community_stats');

      if (error) throw error;

      if (data && data.length > 0) {
        setStats({
          activeMembers: Number(data[0].active_members),
          certsEarned: Number(data[0].certs_earned),
          projectsShared: Number(data[0].projects_shared)
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkAccessAndRedirect = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAuthorized(true);
      return;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roles = data?.map(r => r.role) || [];
    
    // Admins and staff always have access, regardless of other roles
    if (roles.includes('admin') || roles.includes('staff')) {
      setIsAdmin(roles.includes('admin'));
      setIsAuthorized(true);
      return;
    }
    
    // Redirect employers and recruiters away from community
    if (roles.includes('employer') || roles.includes('recruiter')) {
      window.location.href = '/dashboard';
      return;
    }

    setIsAuthorized(true);
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Cybersecurity Community - Connect with Security Professionals"
        description="Join the Cydena community of cybersecurity professionals. Share knowledge, track skill pathways, earn achievements, and connect with peers in infosec."
        keywords="cybersecurity community, infosec networking, security professionals forum, cyber skills tracking"
      />
      
      <Navigation />
      
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 overflow-x-hidden">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 break-words leading-tight">
                Cybersecurity Community
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg break-words">
                Connect, learn, and grow with the cybersecurity community
              </p>
            </div>
            <div className="flex flex-row gap-2 w-full sm:w-auto">
              {isAdmin && <GenerateContentButton />}
              <CreatePostDialog />
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex mb-4 sm:mb-6 md:mb-8">
            <TabsTrigger value="feed" className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Activity Feed</span>
            </TabsTrigger>
            <TabsTrigger value="pathways" className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
              <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Skill Pathways</span>
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
              onClick={() => navigate('/learning-paths')}
            >
              <Youtube className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Learning Paths</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4 sm:space-y-6">
            {/* Partner Communities */}
            <PartnerCommunities />
            
            {/* Weekly Challenges */}
            <WeeklyChallenges />
            
            {/* Featured Members */}
            <FeaturedMembers />
            
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed limit={20} />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-card border rounded-lg p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <h3 className="font-semibold text-sm sm:text-base">Community Stats</h3>
                  </div>
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Active Members</span>
                      <span className="font-semibold text-sm sm:text-base">{stats.activeMembers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Projects Shared</span>
                      <span className="font-semibold text-sm sm:text-base">{stats.projectsShared.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pathways" className="space-y-4 sm:space-y-6 overflow-x-hidden">
            <div className="bg-card border rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words">Your Career Pathways</h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground break-words">
                Explore structured learning paths to advance your cybersecurity career. 
                Track your progress and see what skills you need to reach the next level.
              </p>
            </div>
            <SkillPathways />
          </TabsContent>
        </Tabs>
        
        {/* XP Notification System */}
        <XPNotification />
      </div>
    </div>
  );
};

export default Community;