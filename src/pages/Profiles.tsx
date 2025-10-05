import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Lock, Star, Eye } from "lucide-react";
import Navigation from "@/components/Navigation";

interface CandidateProfile {
  id: string;
  username: string;
  title: string;
  ranking: number;
  certifications: string[];
  experience: string;
  avatar: string;
  locked: boolean;
}

const Profiles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real candidate data from database
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      // Fetch candidate XP data
      const { data: xpData, error: xpError } = await supabase
        .from('candidate_xp')
        .select('candidate_id, total_xp')
        .order('total_xp', { ascending: false })
        .limit(20);

      if (xpError) throw xpError;
      if (!xpData || xpData.length === 0) {
        setCandidates([]);
        return;
      }

      const candidateIds = xpData.map(entry => entry.candidate_id);

      // Fetch public profile usernames via RPC (RLS-safe)
      const profileResults = await Promise.all(
        candidateIds.map(async (cid) => {
          const { data } = await supabase.rpc('get_public_profile', { profile_id: cid });
          const row = Array.isArray(data) ? data?.[0] : data;
          return { id: cid, username: row?.username ?? null };
        })
      );

      // Fetch public candidate titles via RPC (and years_experience)
      const candidateProfileResults = await Promise.all(
        candidateIds.map(async (cid) => {
          const { data } = await supabase.rpc('get_public_candidate_profile', { profile_user_id: cid });
          const row = Array.isArray(data) ? data?.[0] : data;
          return { user_id: cid, title: row?.title ?? null, years_experience: row?.years_experience ?? 0 };
        })
      );

      // Fetch certifications
      const { data: certData } = await supabase
        .from('certifications')
        .select('candidate_id, name')
        .in('candidate_id', candidateIds);

      // Create lookup maps
      const profileMap = new Map(profileResults.map((p) => [p.id, p]));
      const candidateProfileMap = new Map(candidateProfileResults.map((cp) => [cp.user_id, cp]));
      const certsByCandidate: Record<string, string[]> = {};
      certData?.forEach(cert => {
        if (!certsByCandidate[cert.candidate_id]) {
          certsByCandidate[cert.candidate_id] = [];
        }
        certsByCandidate[cert.candidate_id].push(cert.name);
      });

      // Transform to candidate profile format
      const candidateData: CandidateProfile[] = xpData.map((entry, index) => {
        const profile = profileMap.get(entry.candidate_id);
        const candidateProfile = candidateProfileMap.get(entry.candidate_id);
        
        return {
          id: entry.candidate_id,
          username: profile?.username || 'user_anonymous',
          title: candidateProfile?.title || 'Cybersecurity Professional',
          ranking: index + 1,
          certifications: certsByCandidate[entry.candidate_id]?.slice(0, 3) || [],
          experience: `${candidateProfile?.years_experience || 0} years`,
          avatar: "🔒",
          locked: index > 2
        };
      });

      setCandidates(candidateData);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.certifications.some((cert) =>
        cert.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-orange-600 text-white";
    return "bg-primary text-primary-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Candidate Profiles</h1>
          <p className="text-muted-foreground">
            Browse and connect with verified cybersecurity professionals
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Loading profiles...</p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by role, certification, experience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate, index) => (
            <Card
              key={candidate.id}
              className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-cyber w-20 h-20 rounded-full flex items-center justify-center text-4xl">
                    {candidate.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">@{candidate.username}</h3>
                      {candidate.ranking <= 3 && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {candidate.title}
                    </p>
                    <Badge className={getRankBadgeColor(candidate.ranking)}>
                      Ranking: {candidate.ranking}
                      {candidate.ranking === 1 && "st"}
                      {candidate.ranking === 2 && "nd"}
                      {candidate.ranking === 3 && "rd"}
                      {candidate.ranking > 3 && "th"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-1">Certifications:</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">Experience:</span>{" "}
                      {candidate.experience}
                    </p>
                  </div>

                  <Button 
                    variant={candidate.locked ? "outline" : "default"} 
                    className="w-full gap-2"
                    onClick={() => navigate(`/profiles/${candidate.id}`)}
                  >
                    {candidate.locked ? (
                      <>
                        <Lock className="h-4 w-4" />
                        View & Unlock Profile
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        View Full Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

            {filteredCandidates.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No candidates found matching your search.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Profiles;
