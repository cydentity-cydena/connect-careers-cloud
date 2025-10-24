import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Target, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { SpecializationBadges } from "@/components/profiles/SpecializationBadges";
import { detectSpecializations, type Specialization } from "@/lib/specializations";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  title: string;
  certifications: string[];
  specializations: Specialization[];
  score: number;
  community_points: number;
  xp: number;
  rank: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Fetch candidate XP data
      const { data: xpData, error: xpError } = await supabase
        .from('candidate_xp')
        .select('candidate_id, total_xp, community_points, points_balance, level, community_level')
        .order('total_xp', { ascending: false })
        .limit(20);

      if (xpError) throw xpError;
      if (!xpData || xpData.length === 0) {
        setLeaderboard([]);
        return;
      }

      const candidateIds = xpData.map(entry => entry.candidate_id);

      // Fetch public profile usernames and desired job titles via RPC (RLS-safe)
      const profileResults = await Promise.all(
        candidateIds.map(async (cid) => {
          const { data } = await supabase.rpc('get_public_profile', { profile_id: cid });
          const row = Array.isArray(data) ? data?.[0] : data;
          return { 
            id: cid, 
            username: row?.username ?? null, 
            desired_job_title: (row as any)?.desired_job_title ?? null 
          };
        })
      );

      // Fetch public candidate titles via RPC (RLS-safe)
      const candidateProfileResults = await Promise.all(
        candidateIds.map(async (cid) => {
          const { data } = await supabase.rpc('get_public_candidate_profile', { profile_user_id: cid });
          const row = Array.isArray(data) ? data?.[0] : data;
          return { user_id: cid, title: row?.title ?? null };
        })
      );

      // Fetch certifications
      const { data: certData } = await supabase
        .from('certifications')
        .select('candidate_id, name, issuer')
        .in('candidate_id', candidateIds);

      // Fetch skills
      const { data: skillsData } = await supabase
        .from('candidate_skills')
        .select('candidate_id, skills(name, category)')
        .in('candidate_id', candidateIds);

      // Create lookup maps
      const profileMap = new Map(profileResults.map(p => [p.id, p]));
      const candidateProfileMap = new Map(candidateProfileResults.map(cp => [cp.user_id, cp]));
      const certsByCandidate: Record<string, any[]> = {};
      const skillsByCandidate: Record<string, any[]> = {};
      
      certData?.forEach(cert => {
        if (!certsByCandidate[cert.candidate_id]) {
          certsByCandidate[cert.candidate_id] = [];
        }
        certsByCandidate[cert.candidate_id].push(cert);
      });

      skillsData?.forEach(skill => {
        if (!skillsByCandidate[skill.candidate_id]) {
          skillsByCandidate[skill.candidate_id] = [];
        }
        skillsByCandidate[skill.candidate_id].push(skill);
      });

      // Transform to leaderboard format
      const leaderboardData: LeaderboardEntry[] = xpData.map((entry, index) => {
        const profile = profileMap.get(entry.candidate_id);
        const candidateProfile = candidateProfileMap.get(entry.candidate_id);
        const certs = certsByCandidate[entry.candidate_id] || [];
        const skills = skillsByCandidate[entry.candidate_id] || [];
        
        const specializations = detectSpecializations(skills, certs);
        
        // Use desired_job_title if set, otherwise fallback to current title
        const displayTitle = (profile as any)?.desired_job_title || candidateProfile?.title || 'Cybersecurity Professional';
        
        return {
          id: entry.candidate_id,
          user_id: entry.candidate_id,
          username: profile?.username || 'anonymous',
          title: displayTitle,
          certifications: certs.map(c => c.name),
          specializations,
          score: Math.min(100, Math.round((entry as any).total_xp / 3)),
          community_points: (entry as any).community_points ?? (entry as any).points_balance ?? 0,
          xp: (entry as any).total_xp ?? 0,
          rank: index + 1
        };
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const communityTopThree = [...leaderboard].sort((a, b) => b.community_points - a.community_points).slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Cybersecurity Talent Leaderboard - Top Professionals"
        description="Browse the top 20 cybersecurity professionals on Cydena ranked by certifications (CISSP, CEH, OSCP), skills, and community leadership. Find verified talent."
        keywords="cybersecurity talent rankings, top infosec professionals, CISSP certified experts, penetration tester leaderboard"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-4 md:py-8 animate-fade-in">
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Cybersecurity Talent Leaderboard - Top 20</h1>
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            Rankings by Professional XP (certifications, skills, courses) and Community Impact (helping others, mentoring)
          </p>
          <div className="prose prose-sm max-w-none text-muted-foreground mb-6">
            <p>
              Our leaderboard showcases the top cybersecurity professionals on Cydena based on two key metrics: Professional Experience Points (XP) and Community Leadership. Professional XP measures verified certifications (CISSP, CEH, Security+, OSCP, etc.), completed training courses, and demonstrated technical skills. Community Leadership tracks peer endorsements, mentoring activities, and contributions to helping other cybersecurity professionals succeed.
            </p>
            <p>
              Why does ranking matter? Top-ranked professionals gain increased visibility to employers actively searching for cybersecurity talent. Companies filter candidates by leaderboard position when seeking proven experts for security analyst, penetration tester, SOC analyst, and security engineer roles. A high ranking demonstrates both technical competency and community engagement - qualities employers value highly.
            </p>
            <p>
              Candidates can improve their ranking by uploading verified certifications, completing courses through our training partners (Cydentity Academy, LetsDefend, etc.), engaging in the community, and maintaining an active, comprehensive profile. The leaderboard updates daily, providing real-time recognition for professional development achievements.
            </p>
          </div>
        </div>

        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Professional XP</span>
              <span className="sm:hidden">Pro XP</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Community Leaders</span>
              <span className="sm:hidden">Community</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professional"  className="space-y-8">

        {/* Podium - Top 3 */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 md:mb-16 max-w-4xl mx-auto">
            {/* 1st Place - Gold (First on mobile) */}
            <div className="flex flex-col items-center justify-start animate-slide-up md:order-2">
              <Link to={`/profiles/${topThree[0]?.user_id}`} className="w-full">
                <Card className="w-full border-2 border-yellow-500 bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-xl md:transform md:scale-110 hover:scale-105 md:hover:scale-[1.15] transition-transform cursor-pointer">
                  <CardContent className="pt-4 md:pt-6 text-center">
                    <div className="bg-yellow-600 w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-2 md:mb-3 flex items-center justify-center">
                      <Trophy className="h-8 w-8 md:h-12 md:w-12 text-white" />
                    </div>
                    <h3 className="font-bold text-base md:text-xl text-gray-900 mb-1">@{topThree[0]?.username}</h3>
                    <p className="text-xs md:text-sm text-gray-700 mb-2 line-clamp-1">{topThree[0]?.title}</p>
                    <Badge className="bg-yellow-700 text-xs">1st Place</Badge>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-2 md:mt-3">{topThree[0]?.score}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* 2nd Place - Silver */}
            <div className="flex flex-col items-center justify-end animate-slide-up md:order-1" style={{ animationDelay: '0.1s' }}>
              <Link to={`/profiles/${topThree[1]?.user_id}`} className="w-full">
                <Card className="w-full border-2 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <CardContent className="pt-4 md:pt-6 text-center">
                    <div className="bg-gray-400 w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 flex items-center justify-center">
                      <Medal className="h-7 w-7 md:h-10 md:w-10 text-white" />
                    </div>
                    <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-1">@{topThree[1]?.username}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-1">{topThree[1]?.title}</p>
                    <Badge className="bg-gray-500 text-xs">2nd Place</Badge>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 mt-2 md:mt-3">{topThree[1]?.score}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* 3rd Place - Bronze */}
            <div className="flex flex-col items-center justify-end animate-slide-up md:order-3" style={{ animationDelay: '0.2s' }}>
              <Link to={`/profiles/${topThree[2]?.user_id}`} className="w-full">
                <Card className="w-full border-2 border-orange-600 bg-gradient-to-b from-orange-400 to-orange-600 shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <CardContent className="pt-4 md:pt-6 text-center">
                    <div className="bg-orange-700 w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 flex items-center justify-center">
                      <Award className="h-7 w-7 md:h-10 md:w-10 text-white" />
                    </div>
                    <h3 className="font-bold text-sm md:text-lg text-white mb-1">@{topThree[2]?.username}</h3>
                    <p className="text-xs md:text-sm text-orange-100 mb-2 line-clamp-1">{topThree[2]?.title}</p>
                    <Badge className="bg-orange-800 text-xs">3rd Place</Badge>
                    <p className="text-lg md:text-2xl font-bold text-white mt-2 md:mt-3">{topThree[2]?.score}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Top 20 by Professional XP</CardTitle>
            <CardDescription className="text-sm">Rankings by certifications, courses, and skills</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 md:w-16 text-xs md:text-sm">Rank</TableHead>
                  <TableHead className="text-xs md:text-sm">Name</TableHead>
                  <TableHead className="hidden md:table-cell text-xs md:text-sm">Desired Job Title</TableHead>
                  <TableHead className="hidden xl:table-cell text-xs md:text-sm">Specializations</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs md:text-sm">Certifications</TableHead>
                  <TableHead className="text-right text-xs md:text-sm">Score</TableHead>
                  <TableHead className="hidden sm:table-cell text-right text-xs md:text-sm">XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = `/profiles/${entry.user_id}`}>
                    <TableCell className="font-medium text-xs md:text-sm">#{entry.rank}</TableCell>
                    <TableCell className="font-semibold text-xs md:text-sm">
                      <Link to={`/profiles/${entry.user_id}`} className="hover:underline">
                        @{entry.username}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs md:text-sm">{entry.title}</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <SpecializationBadges specializations={entry.specializations} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {entry.certifications.slice(0, 3).map((cert, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {entry.certifications.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{entry.certifications.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary text-xs md:text-sm">{entry.score}</TableCell>
                    <TableCell className="hidden sm:table-cell text-right font-semibold text-secondary text-xs md:text-sm">{entry.xp.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-8">
            {/* Community Podium - Top 3 */}
            {communityTopThree.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 md:mb-16 max-w-4xl mx-auto">
                {/* 1st Place - Purple */}
                <div className="flex flex-col items-center justify-start animate-slide-up md:order-2">
                  <Link to={`/profiles/${communityTopThree[0]?.user_id}`} className="w-full">
                    <Card className="w-full border-2 border-purple-500 bg-gradient-to-b from-purple-300 to-purple-500 shadow-xl md:transform md:scale-110 hover:scale-105 md:hover:scale-[1.15] transition-transform cursor-pointer">
                      <CardContent className="pt-4 md:pt-6 text-center">
                        <div className="bg-purple-600 w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-2 md:mb-3 flex items-center justify-center">
                          <Users className="h-8 w-8 md:h-12 md:w-12 text-white" />
                        </div>
                        <h3 className="font-bold text-base md:text-xl text-white mb-1">@{communityTopThree[0]?.username}</h3>
                        <p className="text-xs md:text-sm text-purple-100 mb-2 line-clamp-1">{communityTopThree[0]?.title}</p>
                        <Badge className="bg-purple-700 text-xs">Community Leader</Badge>
                        <p className="text-xl md:text-3xl font-bold text-white mt-2 md:mt-3">{communityTopThree[0]?.community_points}</p>
                        <p className="text-xs text-purple-100">community points</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* 2nd Place */}
                <div className="flex flex-col items-center justify-end animate-slide-up md:order-1" style={{ animationDelay: '0.1s' }}>
                  <Link to={`/profiles/${communityTopThree[1]?.user_id}`} className="w-full">
                    <Card className="w-full border-2 border-purple-400 bg-gradient-to-b from-purple-200 to-purple-300 shadow-lg hover:scale-105 transition-transform cursor-pointer">
                      <CardContent className="pt-4 md:pt-6 text-center">
                        <div className="bg-purple-400 w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 flex items-center justify-center">
                          <Users className="h-7 w-7 md:h-10 md:w-10 text-white" />
                        </div>
                        <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-1">@{communityTopThree[1]?.username}</h3>
                        <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-1">{communityTopThree[1]?.title}</p>
                        <Badge className="bg-purple-500 text-xs">2nd Place</Badge>
                        <p className="text-lg md:text-2xl font-bold text-gray-800 mt-2 md:mt-3">{communityTopThree[1]?.community_points}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center justify-end animate-slide-up md:order-3" style={{ animationDelay: '0.2s' }}>
                  <Link to={`/profiles/${communityTopThree[2]?.user_id}`} className="w-full">
                    <Card className="w-full border-2 border-purple-300 bg-gradient-to-b from-purple-100 to-purple-200 shadow-lg hover:scale-105 transition-transform cursor-pointer">
                      <CardContent className="pt-4 md:pt-6 text-center">
                        <div className="bg-purple-300 w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 flex items-center justify-center">
                          <Users className="h-7 w-7 md:h-10 md:w-10 text-white" />
                        </div>
                        <h3 className="font-bold text-sm md:text-lg text-gray-700 mb-1">@{communityTopThree[2]?.username}</h3>
                        <p className="text-xs md:text-sm text-gray-500 mb-2 line-clamp-1">{communityTopThree[2]?.title}</p>
                        <Badge className="bg-purple-400 text-xs">3rd Place</Badge>
                        <p className="text-lg md:text-2xl font-bold text-gray-700 mt-2 md:mt-3">{communityTopThree[2]?.community_points}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            )}

            {/* Community Leaderboard Table */}
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Top 20 Community Leaders</CardTitle>
                <CardDescription className="text-sm">Rankings by peer support, mentoring, and community impact</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 md:w-16 text-xs md:text-sm">Rank</TableHead>
                      <TableHead className="text-xs md:text-sm">Name</TableHead>
                      <TableHead className="hidden md:table-cell text-xs md:text-sm">Desired Job Title</TableHead>
                      <TableHead className="hidden lg:table-cell text-xs md:text-sm">Impact</TableHead>
                      <TableHead className="text-right text-xs md:text-sm">Community Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...leaderboard]
                      .sort((a, b) => b.community_points - a.community_points)
                      .map((entry, index) => (
                        <TableRow key={entry.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = `/profiles/${entry.user_id}`}>
                          <TableCell className="font-medium text-xs md:text-sm">#{index + 1}</TableCell>
                          <TableCell className="font-semibold text-xs md:text-sm">
                            <Link to={`/profiles/${entry.user_id}`} className="hover:underline">
                              @{entry.username}
                            </Link>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs md:text-sm">{entry.title}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {entry.community_points > 1000 && <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">🏆 Leader</Badge>}
                              {entry.community_points > 500 && <Badge variant="secondary" className="text-xs">⭐ Star</Badge>}
                              {entry.community_points > 100 && <Badge variant="secondary" className="text-xs">🤝 Helper</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-purple-600 text-xs md:text-sm">{entry.community_points.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboard;
