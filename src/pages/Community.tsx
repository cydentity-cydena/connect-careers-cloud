import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityFeed } from '@/components/community/ActivityFeed';
import { SkillPathways } from '@/components/community/SkillPathways';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { GenerateContentButton } from '@/components/community/GenerateContentButton';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { TrendingUp, Map, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Community = () => {
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
      // Count active members (users with candidate role)
      const membersQuery = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'candidate');

      // Count certifications earned
      const certsQuery = await supabase
        .from('certifications')
        .select('id');

      // Count projects shared (posts with type 'project')
      const projectsQuery = await supabase
        .from('activity_feed' as any)
        .select('id')
        .eq('type', 'project');

      setStats({
        activeMembers: membersQuery.data?.length ?? 0,
        certsEarned: certsQuery.data?.length ?? 0,
        projectsShared: projectsQuery.data?.length ?? 0
      });
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
      .eq('user_id', user.id)
      .maybeSingle();

    const userRole = data?.role;
    
    // Redirect employers and recruiters away from community
    if (userRole === 'employer' || userRole === 'recruiter') {
      window.location.href = '/dashboard';
      return;
    }

    setIsAdmin(userRole === 'admin');
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
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Cybersecurity Community - Connect with Security Professionals</h1>
            <p className="text-muted-foreground text-lg">
              Connect, learn, and grow with the cybersecurity community
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && <GenerateContentButton />}
            <CreatePostDialog />
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex mb-8">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Activity Feed</span>
            </TabsTrigger>
            <TabsTrigger value="pathways" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span>Skill Pathways</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed limit={20} />
              </div>
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Community Stats</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Members</span>
                      <span className="font-semibold">{stats.activeMembers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Certs Earned</span>
                      <span className="font-semibold">{stats.certsEarned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Projects Shared</span>
                      <span className="font-semibold">{stats.projectsShared.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pathways" className="space-y-6">
            <div className="bg-card border rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">Your Career Pathways</h2>
              <p className="text-muted-foreground">
                Explore structured learning paths to advance your cybersecurity career. 
                Track your progress and see what skills you need to reach the next level.
              </p>
            </div>
            <SkillPathways />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;