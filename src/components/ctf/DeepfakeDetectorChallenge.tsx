import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  User,
  Clock,
  FileText,
  Eye,
  Volume2
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransactionRequest {
  id: number;
  requestor: string;
  role: string;
  amount: string;
  recipient: string;
  timestamp: string;
  isDeepfake: boolean;
  videoArtifacts: string[];
  audioArtifacts: string[];
  behavioralFlags: string[];
  evidence: {
    videoAnalysis: string;
    audioAnalysis: string;
    contextClues: string;
  };
}

interface DeepfakeDetectorChallengeProps {
  onComplete: (flag: string) => void;
}

const transactions: TransactionRequest[] = [
  {
    id: 1,
    requestor: "Sarah Chen",
    role: "CFO",
    amount: "$2,450,000",
    recipient: "Vendor: TechSupply International",
    timestamp: "2024-03-15 09:23:41 EST",
    isDeepfake: true,
    videoArtifacts: ["Blinking rate: 2.1/min (avg: 15-20/min)", "Lip sync delay: 180ms", "Edge blur around hairline"],
    audioArtifacts: ["Breathing pattern irregular", "Background noise mismatch", "Voice pitch variance: ±12Hz (unusual)"],
    behavioralFlags: ["Request outside normal business hours for CFO", "New vendor not in approved list", "Urgency emphasized 3x"],
    evidence: {
      videoAnalysis: "The video shows Sarah Chen at what appears to be her home office. However, the blinking frequency is abnormally low (2.1 per minute vs. typical 15-20), and there's visible artifacting around the hairline during head movements. The lip movements are slightly delayed from the audio.",
      audioAnalysis: "The audio exhibits subtle but detectable anomalies. The breathing patterns don't match natural speech cadence, and there's a +/-12Hz variance in voice pitch that suggests AI synthesis. Background noise appears layered in post-processing.",
      contextClues: "This request came at 9:23 AM EST, but Sarah Chen's calendar shows she was presenting at a board meeting at this time. The vendor 'TechSupply International' was registered just 3 days ago."
    }
  },
  {
    id: 2,
    requestor: "Michael Torres",
    role: "VP of Operations",
    amount: "$127,500",
    recipient: "Vendor: Industrial Parts Co",
    timestamp: "2024-03-15 14:12:08 EST",
    isDeepfake: false,
    videoArtifacts: ["Blinking rate: 17/min (normal)", "No lip sync delay", "Natural head movements"],
    audioArtifacts: ["Consistent breathing", "Ambient office sounds match visuals", "Voice stable"],
    behavioralFlags: ["Routine purchase order", "Approved vendor", "Standard approval chain"],
    evidence: {
      videoAnalysis: "Video analysis shows natural characteristics: consistent blinking (17/min), smooth facial movements, and proper lighting on all facial features. No edge artifacts or temporal inconsistencies detected.",
      audioAnalysis: "Audio is clean with natural speech patterns. Background office ambient matches the visual environment. No synthesis markers detected in spectral analysis.",
      contextClues: "Michael Torres is at his desk during his normal working hours. Industrial Parts Co has been an approved vendor for 4 years with regular transactions."
    }
  },
  {
    id: 3,
    requestor: "Jennifer Walsh",
    role: "CEO",
    amount: "$5,000,000",
    recipient: "Acquisition: Stealth Holdings LLC",
    timestamp: "2024-03-15 22:47:33 EST",
    isDeepfake: true,
    videoArtifacts: ["Eye reflection inconsistency", "Skin texture too smooth", "Micro-expression timing off"],
    audioArtifacts: ["Unnatural pauses at odd points", "Consonant sounds slightly distorted", "No natural filler words"],
    behavioralFlags: ["Late night urgent request", "No prior discussion of acquisition", "Requested silence until complete"],
    evidence: {
      videoAnalysis: "Multiple deepfake indicators present: The eye reflections don't match the stated lighting environment. Skin texture appears algorithmically smoothed, losing natural pore detail. Micro-expressions that typically accompany speech are delayed by ~200ms.",
      audioAnalysis: "Speech patterns are too perfect—no 'um', 'uh' or natural hesitation. Consonant sounds, especially 's' and 't', show digital compression artifacts not present in genuine recordings. Pauses occur mid-thought rather than between sentences.",
      contextClues: "Request was made at 10:47 PM with extreme urgency. No board discussion, email trail, or legal review exists for this 'acquisition'. Stealth Holdings LLC was incorporated in Delaware 48 hours ago."
    }
  },
  {
    id: 4,
    requestor: "David Park",
    role: "Head of Procurement",
    amount: "$89,000",
    recipient: "Vendor: Office Solutions Inc",
    timestamp: "2024-03-15 11:05:22 EST",
    isDeepfake: false,
    videoArtifacts: ["Natural eye movement patterns", "Appropriate facial asymmetry", "Real-time environmental response"],
    audioArtifacts: ["Natural speech rhythm with filler words", "Consistent vocal tone", "Real background audio"],
    behavioralFlags: ["Standard Q1 supply order", "Pre-approved budget item", "Normal approval workflow"],
    evidence: {
      videoAnalysis: "Genuine video characteristics: Natural asymmetric facial features, appropriate eye tracking, and real-time responses to environmental factors (adjusted glasses, reacted to notification sound).",
      audioAnalysis: "Authentic speech with natural hesitations ('uh... let me pull that up'), consistent voice quality, and genuine background office sounds that match visual cues.",
      contextClues: "Quarterly office supply order within pre-approved budget. David Park is at his regular workstation during business hours. Vendor has 6-year relationship with company."
    }
  },
  {
    id: 5,
    requestor: "Sarah Chen",
    role: "CFO",
    amount: "$890,000",
    recipient: "Tax Authority: Urgent Compliance Fee",
    timestamp: "2024-03-15 16:33:19 EST",
    isDeepfake: true,
    videoArtifacts: ["Identical head position to video #1", "Same background despite 'different location'", "Temporal artifacts at 0:08, 0:23, 0:41"],
    audioArtifacts: ["Recycled phrases from previous calls", "Audio quality mismatch with video", "Clipping on loud sounds"],
    behavioralFlags: ["Second urgent request from CFO today", "Government doesn't request payments this way", "Threatening language used"],
    evidence: {
      videoAnalysis: "This video shares 94% visual similarity with transaction #1 despite claiming to be from a 'different location'. The same deepfake source material was used. Temporal glitches visible at specific timestamps where the AI struggled with transitions.",
      audioAnalysis: "Spectral analysis reveals reused audio segments from transaction #1. The phrase 'we need to act immediately' appears identically in both. Audio compression levels don't match the video quality.",
      contextClues: "This is the second 'urgent' request from 'Sarah Chen' today, but the real CFO has confirmed she made no such requests. No government agency demands immediate wire transfers for 'compliance fees'. The threatening language ('legal action within 24 hours') is a classic fraud indicator."
    }
  }
];

export const DeepfakeDetectorChallenge = ({ onComplete }: DeepfakeDetectorChallengeProps) => {
  const [currentCase, setCurrentCase] = useState(0);
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'flagged' | null>>({});
  const [showEvidence, setShowEvidence] = useState(false);
  const [analysisTab, setAnalysisTab] = useState<'video' | 'audio' | 'context'>('video');
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  const transaction = transactions[currentCase];
  const totalCases = transactions.length;
  const reviewedCount = Object.keys(decisions).length;

  const makeDecision = (decision: 'approved' | 'flagged') => {
    const isCorrect = (decision === 'flagged') === transaction.isDeepfake;
    
    setDecisions(prev => ({ ...prev, [transaction.id]: decision }));
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Check if all cases reviewed
    if (reviewedCount + 1 === totalCases) {
      const finalScore = score + (isCorrect ? 1 : 0);
      setGameComplete(true);
      
      // Need 4/5 correct to get the flag
      if (finalScore >= 4) {
        setTimeout(() => {
          onComplete('FLAG{deepfake_detector_elite}');
        }, 1500);
      }
    } else {
      // Move to next unreviewed case
      setTimeout(() => {
        const nextUnreviewed = transactions.findIndex((t, idx) => idx > currentCase && !decisions[t.id]);
        if (nextUnreviewed !== -1) {
          setCurrentCase(nextUnreviewed);
        } else {
          const firstUnreviewed = transactions.findIndex(t => !decisions[t.id] && t.id !== transaction.id);
          if (firstUnreviewed !== -1) {
            setCurrentCase(firstUnreviewed);
          }
        }
        setShowEvidence(false);
        setAnalysisTab('video');
      }, 500);
    }
  };

  const getDecisionBadge = (id: number) => {
    const decision = decisions[id];
    if (!decision) return null;
    
    const tx = transactions.find(t => t.id === id);
    const isCorrect = (decision === 'flagged') === tx?.isDeepfake;
    
    if (decision === 'flagged') {
      return (
        <Badge variant={isCorrect ? "destructive" : "outline"} className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Flagged {isCorrect ? '✓' : '✗'}
        </Badge>
      );
    }
    return (
      <Badge variant={isCorrect ? "default" : "outline"} className="gap-1 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        Approved {isCorrect ? '✓' : '✗'}
      </Badge>
    );
  };

  if (gameComplete) {
    const passed = score >= 4;
    return (
      <Card className="bg-background/80 backdrop-blur border-primary/30">
        <CardHeader className="text-center">
          <CardTitle className={`text-2xl ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? '🛡️ Fraud Investigation Complete!' : '❌ Investigation Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-6xl mb-4">
            {passed ? '🎉' : '💸'}
          </div>
          <p className="text-lg">
            You correctly identified <span className="text-primary font-bold">{score}</span> out of <span className="font-bold">{totalCases}</span> transaction requests.
          </p>
          
          {passed ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-4">
              <p className="text-green-400 font-medium">
                Excellent work, fraud analyst! You've protected the company from deepfake attacks.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The flag will be submitted automatically...
              </p>
            </div>
          ) : (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mt-4">
              <p className="text-red-400 font-medium">
                The fraudsters got through. $7.34 million was wired to criminal accounts.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You need at least 4/5 correct to pass. Refresh to try again.
              </p>
            </div>
          )}
          
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Case Results:</h4>
            {transactions.map(tx => {
              const decision = decisions[tx.id];
              const isCorrect = decision && ((decision === 'flagged') === tx.isDeepfake);
              return (
                <div key={tx.id} className="flex items-center justify-between text-sm bg-background/50 rounded p-2">
                  <span>{tx.requestor} - {tx.amount}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={tx.isDeepfake ? "destructive" : "secondary"} className="text-xs">
                      {tx.isDeepfake ? 'DEEPFAKE' : 'GENUINE'}
                    </Badge>
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-950/50 to-background border-red-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🏦 FinSecure Fraud Detection Portal</h3>
                <p className="text-sm text-muted-foreground">Wire Transfer Authorization Review</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Cases Reviewed</div>
              <div className="text-xl font-bold text-primary">{reviewedCount}/{totalCases}</div>
            </div>
          </div>
          <Progress value={(reviewedCount / totalCases) * 100} className="mt-3 h-2" />
        </CardContent>
      </Card>

      {/* Case Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {transactions.map((tx, idx) => (
          <Button
            key={tx.id}
            variant={currentCase === idx ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCurrentCase(idx);
              setShowEvidence(false);
            }}
            className={`flex-shrink-0 ${decisions[tx.id] ? 'opacity-60' : ''}`}
          >
            Case #{tx.id}
            {getDecisionBadge(tx.id)}
          </Button>
        ))}
      </div>

      {/* Current Transaction */}
      <Card className="bg-background/80 backdrop-blur border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Transaction Request #{transaction.id}
            </CardTitle>
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              <Clock className="h-3 w-3 mr-1" />
              Pending Review
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Requestor</div>
              <div className="font-semibold">{transaction.requestor}</div>
              <div className="text-sm text-muted-foreground">{transaction.role}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Amount</div>
              <div className="font-bold text-xl text-green-400 flex items-center gap-1">
                <DollarSign className="h-5 w-5" />
                {transaction.amount}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Recipient</div>
              <div className="font-medium">{transaction.recipient}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Timestamp</div>
              <div className="font-mono text-sm">{transaction.timestamp}</div>
            </div>
          </div>

          {/* Video Call Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center border border-primary/30">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
            <div className="relative z-10 text-center p-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/50">
                <Video className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-medium">{transaction.requestor}</p>
              <p className="text-sm text-muted-foreground">{transaction.role}</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Video Call Recording
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  Duration: 2:34
                </div>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <Button 
            onClick={() => setShowEvidence(!showEvidence)} 
            variant="secondary" 
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showEvidence ? 'Hide' : 'Run'} AI Analysis
          </Button>

          {/* Evidence Panel */}
          {showEvidence && (
            <Card className="bg-muted/20 border-primary/20">
              <CardContent className="p-4 space-y-4">
                <Tabs value={analysisTab} onValueChange={(v) => setAnalysisTab(v as typeof analysisTab)}>
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="video" className="gap-1">
                      <Video className="h-3 w-3" />
                      Video
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="gap-1">
                      <Volume2 className="h-3 w-3" />
                      Audio
                    </TabsTrigger>
                    <TabsTrigger value="context" className="gap-1">
                      <FileText className="h-3 w-3" />
                      Context
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="video" className="space-y-3 mt-4">
                    <h4 className="font-semibold text-sm">Video Analysis Report</h4>
                    <p className="text-sm text-muted-foreground">
                      {transaction.evidence.videoAnalysis}
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">Detected Artifacts:</div>
                      {transaction.videoArtifacts.map((artifact, i) => (
                        <div key={i} className="text-xs bg-background/50 rounded px-2 py-1 font-mono">
                          • {artifact}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="audio" className="space-y-3 mt-4">
                    <h4 className="font-semibold text-sm">Audio Analysis Report</h4>
                    <p className="text-sm text-muted-foreground">
                      {transaction.evidence.audioAnalysis}
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">Detected Artifacts:</div>
                      {transaction.audioArtifacts.map((artifact, i) => (
                        <div key={i} className="text-xs bg-background/50 rounded px-2 py-1 font-mono">
                          • {artifact}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="context" className="space-y-3 mt-4">
                    <h4 className="font-semibold text-sm">Contextual Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      {transaction.evidence.contextClues}
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">Behavioral Flags:</div>
                      {transaction.behavioralFlags.map((flag, i) => (
                        <div key={i} className="text-xs bg-background/50 rounded px-2 py-1 font-mono">
                          • {flag}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Decision Buttons */}
          {!decisions[transaction.id] && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button
                onClick={() => makeDecision('approved')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Transfer
              </Button>
              <Button
                onClick={() => makeDecision('flagged')}
                variant="destructive"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Flag as Fraud
              </Button>
            </div>
          )}

          {decisions[transaction.id] && (
            <div className="text-center py-2 text-muted-foreground">
              Decision recorded. Select another case or complete review.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
