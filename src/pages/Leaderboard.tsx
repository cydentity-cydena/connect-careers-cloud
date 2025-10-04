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

      // Fetch public profile names via RPC (RLS-safe)
      const profileResults = await Promise.all(
        candidateIds.map(async (cid) => {
          const { data } = await supabase.rpc('get_public_profile', { profile_id: cid });
          const row = Array.isArray(data) ? data?.[0] : data;
          return { id: cid, full_name: row?.full_name ?? null };
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
        .select('candidate_id, name')
        .in('candidate_id', candidateIds);

      // Create lookup maps
      const profileMap = new Map(profileResults.map(p => [p.id, p]));
      const candidateProfileMap = new Map(candidateProfileResults.map(cp => [cp.user_id, cp]));
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

      <main className="container mx-auto px-4 py-4 md:py-8 animate-fade-in">
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Top 20 Talent Spotlight</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Each profile is evaluated based on the quality of information, completed courses, and exams passed.
            High-scoring profiles are featured with enhanced visibility to recruiters.
          </p>
        </div>

        {/* Podium - Top 3 */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 md:mb-16 max-w-4xl mx-auto">
            {/* 1st Place - Gold (First on mobile) */}
            <div className="flex flex-col items-center justify-start animate-slide-up md:order-2">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 mb-2" />
              <Link to={`/profiles/${topThree[0]?.user_id}`} className="w-full">
                <Card className="w-full border-2 border-yellow-500 bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-xl md:transform md:scale-110 hover:scale-105 md:hover:scale-[1.15] transition-transform cursor-pointer">
                  <CardContent className="pt-4 md:pt-6 text-center">
                    <div className="bg-yellow-600 w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-2 md:mb-3 flex items-center justify-center">
                      <Trophy className="h-8 w-8 md:h-12 md:w-12 text-white" />
                    </div>
                    <h3 className="font-bold text-base md:text-xl text-gray-900 mb-1">{topThree[0]?.full_name}</h3>
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
                    <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-1">{topThree[1]?.full_name}</h3>
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
                    <h3 className="font-bold text-sm md:text-lg text-white mb-1">{topThree[2]?.full_name}</h3>
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
            <CardTitle className="text-xl md:text-2xl">Top 20 Leaderboard</CardTitle>
            <CardDescription className="text-sm">Rankings of the highest performing candidates</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 md:w-16 text-xs md:text-sm">Rank</TableHead>
                  <TableHead className="text-xs md:text-sm">Name</TableHead>
                  <TableHead className="hidden md:table-cell text-xs md:text-sm">Desired Job Title</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs md:text-sm">Certifications</TableHead>
                  <TableHead className="text-right text-xs md:text-sm">Score</TableHead>
                  <TableHead className="hidden sm:table-cell text-right text-xs md:text-sm">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-accent/50 cursor-pointer" onClick={() => window.location.href = `/profiles/${entry.user_id}`}>
                    <TableCell className="font-medium text-xs md:text-sm">#{entry.rank}</TableCell>
                    <TableCell className="font-semibold text-xs md:text-sm">
                      <Link to={`/profiles/${entry.user_id}`} className="hover:underline">
                        {entry.full_name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs md:text-sm">{entry.title}</TableCell>
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
                    <TableCell className="hidden sm:table-cell text-right font-semibold text-secondary text-xs md:text-sm">{entry.community_points}</TableCell>
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
