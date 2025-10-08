import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ActivityFeed } from '@/components/community/ActivityFeed';
import { SkillPathways } from '@/components/community/SkillPathways';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { GenerateContentButton } from '@/components/community/GenerateContentButton';
import SEO from '@/components/SEO';
import { TrendingUp, Map, Users, ArrowLeft } from 'lucide-react';

const Community = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Community | Cydena" 
        description="Connect with cybersecurity professionals, track your skill progression, and celebrate achievements in the Cydena community."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community</h1>
            <p className="text-muted-foreground text-lg">
              Connect, learn, and grow with the cybersecurity community
            </p>
          </div>
          <div className="flex gap-2">
            <GenerateContentButton />
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
                      <span className="font-semibold">2,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Certs Earned</span>
                      <span className="font-semibold">1,203</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Projects Shared</span>
                      <span className="font-semibold">589</span>
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