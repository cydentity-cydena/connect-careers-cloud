import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
      // Mock data for now - will connect to real data later
      const mockData: LeaderboardEntry[] = [
        { id: "1", user_id: "1", full_name: "John Smith", title: "Security Analyst", certifications: ["CISSP", "CEH", "SEC+"], score: 95, community_points: 250, rank: 1 },
        { id: "2", user_id: "2", full_name: "Jane Doe", title: "Penetration Tester", certifications: ["OSCP", "CEH"], score: 92, community_points: 215, rank: 2 },
        { id: "3", user_id: "3", full_name: "Alice Johnson", title: "Incident Responder", certifications: ["GPEN", "CySA+"], score: 90, community_points: 180, rank: 3 },
        { id: "4", user_id: "4", full_name: "Bob Smith", title: "SOC Analyst", certifications: ["CySA+", "SEC+"], score: 88, community_points: 165, rank: 4 },
        { id: "5", user_id: "5", full_name: "Carol Davis", title: "Security Analyst", certifications: ["CySA+"], score: 87, community_points: 145, rank: 5 },
        { id: "6", user_id: "6", full_name: "Michael Brown", title: "Security Consultant", certifications: ["CISSP"], score: 85, community_points: 125, rank: 6 },
        { id: "7", user_id: "7", full_name: "Emma Wilson", title: "Penetration Tester", certifications: ["CEH"], score: 84, community_points: 115, rank: 7 },
      ];
      setLeaderboard(mockData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
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
          <h1 className="text-4xl font-bold mb-2">Top Talent Spotlight</h1>
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
              <Card className="w-full border-2 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-lg">
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
            </div>

            {/* 1st Place - Gold */}
            <div className="flex flex-col items-center justify-start animate-slide-up">
              <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
              <Card className="w-full border-2 border-yellow-500 bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-xl transform scale-110">
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
            </div>

            {/* 3rd Place - Bronze */}
            <div className="flex flex-col items-center justify-end animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Card className="w-full border-2 border-orange-600 bg-gradient-to-b from-orange-400 to-orange-600 shadow-lg">
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
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Complete rankings of all candidates</CardDescription>
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
                  <TableRow key={entry.id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">#{entry.rank}</TableCell>
                    <TableCell className="font-semibold">{entry.full_name}</TableCell>
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
