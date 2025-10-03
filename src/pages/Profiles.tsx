import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Lock, Star, Eye } from "lucide-react";
import Navigation from "@/components/Navigation";

interface CandidateProfile {
  id: string;
  name: string;
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

  // Mock data - will connect to real database later
  const candidates: CandidateProfile[] = [
    {
      id: "1",
      name: "John Doe",
      title: "Security Analyst",
      ranking: 1,
      certifications: ["CompTIA Security+", "CISSP", "CEH"],
      experience: "5 years",
      avatar: "🔒",
      locked: false
    },
    {
      id: "2",
      name: "Jane Smith",
      title: "Penetration Tester",
      ranking: 2,
      certifications: ["OSCP", "CEH", "CompTIA PenTest+"],
      experience: "4 years",
      avatar: "🔒",
      locked: false
    },
    {
      id: "3",
      name: "Michael Johnson",
      title: "Incident Responder",
      ranking: 3,
      certifications: ["GCIH", "GCFA", "CompTIA CySA+"],
      experience: "3 years",
      avatar: "🔒",
      locked: false
    },
    {
      id: "4",
      name: "Emily Davis",
      title: "SOC Analyst",
      ranking: 4,
      certifications: ["CompTIA Security+", "CompTIA CySA+", "CISSP"],
      experience: "2 years",
      avatar: "🔒",
      locked: true
    },
    {
      id: "5",
      name: "Daniel Brown",
      title: "Risk Manager",
      ranking: 5,
      certifications: ["CRISC", "CISM", "CompTIA Security+"],
      experience: "6 years",
      avatar: "🔒",
      locked: true
    },
    {
      id: "6",
      name: "Olivia Martinez",
      title: "Security Consultant",
      ranking: 6,
      certifications: ["CISSP", "CISM"],
      experience: "7 years",
      avatar: "🔒",
      locked: true
    },
  ];

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                      <h3 className="font-bold text-lg">{candidate.name}</h3>
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
      </main>
    </div>
  );
};

export default Profiles;
