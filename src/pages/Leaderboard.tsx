import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  full_name: string;
  title: string;
  certifications: string[];
  score: number;
  community_points: number;
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
        .select('candidate_id, total_xp, points_balance, level')
        .order('total_xp', { ascending: false })
        .limit(20);

      if (xpError) throw xpError;
      if (!xpData || xpData.length === 0) {
        setLeaderboard([]);
        return;
      }

      const candidateIds = xpData.map(entry => entry.candidate_id);

      // Fetch profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', candidateIds);

      // Fetch candidate profiles
      const { data: candidateProfileData } = await supabase
        .from('candidate_profiles')
        .select('user_id, title')
        .in('user_id', candidateIds);

      // Fetch certifications
      const { data: certData } = await supabase
        .from('certifications')
        .select('candidate_id, name')
        .in('candidate_id', candidateIds);

      // Create lookup maps
      const profileMap = new Map(profileData?.map(p => [p.id, p]) || []);
      const candidateProfileMap = new Map(candidateProfileData?.map(cp => [cp.user_id, cp]) || []);
      const certsByCandidate: Record<string, string[]> = {};
      certData?.forEach(cert => {
        if (!certsByCandidate[cert.candidate_id]) {
          certsByCandidate[cert.candidate_id] = [];
        }
        certsByCandidate[cert.candidate_id].push(cert.name);
      });

      // Transform to leaderboard format
      const leaderboardData: LeaderboardEntry[] = xpData.map((entry, index) => {
        const profile = profileMap.get(entry.candidate_id);
        const candidateProfile = candidateProfileMap.get(entry.candidate_id);
        
        return {
          id: entry.candidate_id,
          user_id: entry.candidate_id,
          full_name: profile?.full_name || 'Unknown',
          title: candidateProfile?.title || 'Cybersecurity Professional',
          certifications: certsByCandidate[entry.candidate_id] || [],
          score: Math.min(100, Math.round(entry.total_xp / 3)),
          community_points: entry.points_balance || 0,
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
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Top 20 Talent Spotlight</h1>
          <p className="text-muted-foreground">
            Each profile is evaluated based on the quality of information, completed courses, and exams passed.
            High-scoring profiles are featured with enhanced visibility to recruiters.
          </p>
        </div>

        {/* Podium - Top 3 */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-16 max-w-4xl mx-auto">
            {/* 2nd Place - Silver */}
            <div className="flex flex-col items-center justify-end animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Link to={`/profiles/${topThree[1]?.user_id}`} className="w-full">
                <Card className="w-full border-2 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <div className="bg-gray-400 w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Medal className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{topThree[1]?.full_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{topThree[1]?.title}</p>
                    <Badge className="bg-gray-500">2nd Place</Badge>
                    <p className="text-2xl font-bold text-gray-800 mt-3">{topThree[1]?.score}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* 1st Place - Gold */}
            <div className="flex flex-col items-center justify-start animate-slide-up">
              <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
              <Link to={`/profiles/${topThree[0]?.user_id}`} className="w-full">
                <Card className="w-full border-2 border-yellow-500 bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-xl transform scale-110 hover:scale-[1.15] transition-transform cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <div className="bg-yellow-600 w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{topThree[0]?.full_name}</h3>
                    <p className="text-sm text-gray-700 mb-2">{topThree[0]?.title}</p>
                    <Badge className="bg-yellow-700">1st Place</Badge>
                    <p className="text-3xl font-bold text-gray-900 mt-3">{topThree[0]?.score}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* 3rd Place - Bronze */}
            <div className="flex flex-col items-center justify-end animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to={`/profiles/${topThree[2]?.user_id}`} className="w-full">
                <Card className="w-full border-2 border-orange-600 bg-gradient-to-b from-orange-400 to-orange-600 shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <div className="bg-orange-700 w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Award className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-white mb-1">{topThree[2]?.full_name}</h3>
                    <p className="text-sm text-orange-100 mb-2">{topThree[2]?.title}</p>
                    <Badge className="bg-orange-800">3rd Place</Badge>
                    <p className="text-2xl font-bold text-white mt-3">{topThree[2]?.score}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle>Top 20 Leaderboard</CardTitle>
            <CardDescription>Rankings of the highest performing candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Desired Job Title</TableHead>
                  <TableHead>Certifications</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Community Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-accent/50 cursor-pointer" onClick={() => window.location.href = `/profiles/${entry.user_id}`}>
                    <TableCell className="font-medium">#{entry.rank}</TableCell>
                    <TableCell className="font-semibold">
                      <Link to={`/profiles/${entry.user_id}`} className="hover:underline">
                        {entry.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>{entry.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">{entry.score}</TableCell>
                    <TableCell className="text-right font-semibold text-secondary">{entry.community_points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;
