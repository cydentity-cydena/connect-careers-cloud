import { useState, useRef, useEffect, useCallback } from 'react';
import { d } from "@/lib/ctfDecode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  User,
  Clock,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Radio
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransactionRequest {
  id: number;
  amount: string;
  recipient: string;
  timestamp: string;
  isDeepfake: boolean;
  audioFile: string;
}

interface DeepfakeDetectorChallengeProps {
  onComplete: (flag: string) => void;
}

const transactions: TransactionRequest[] = [
  {
    id: 1,
    amount: "$127,500",
    recipient: "Vendor: Industrial Parts Co",
    timestamp: "2024-03-15 14:12:08 EST",
    isDeepfake: false,
    audioFile: "/audio/ctf/call1_real.wav"
  },
  {
    id: 2,
    amount: "$142,800",
    recipient: "Vendor: TechSupply International",
    timestamp: "2024-03-15 09:23:41 EST",
    isDeepfake: true,
    audioFile: "/audio/ctf/call2_fake.wav"
  },
  {
    id: 3,
    amount: "$118,250",
    recipient: "Vendor: Stealth Holdings LLC",
    timestamp: "2024-03-15 22:47:33 EST",
    isDeepfake: true,
    audioFile: "/audio/ctf/call3_fake.wav"
  }
];

// Audio Visualizer Component
const AudioVisualizer = ({ 
  audioRef, 
  isPlaying,
  mode 
}: { 
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  mode: 'waveform' | 'spectrum';
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = mode === 'spectrum' ? 256 : 2048;
      
      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      sourceRef.current = source;
    } catch (e) {
      console.log('Audio context already initialized or error:', e);
    }
  }, [audioRef, mode]);

  const draw = useCallback(() => {
    if (!canvasRef.current || !analyzerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationRef.current = requestAnimationFrame(render);
      
      if (mode === 'spectrum') {
        analyzer.getByteFrequencyData(dataArray);
      } else {
        analyzer.getByteTimeDomainData(dataArray);
      }

      ctx.fillStyle = 'rgb(10, 10, 20)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mode === 'spectrum') {
        // Spectrum analyzer - frequency bars
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          
          // Color gradient based on frequency
          const hue = (i / bufferLength) * 120 + 180; // Cyan to green
          ctx.fillStyle = `hsl(${hue}, 80%, ${50 + (dataArray[i] / 255) * 30}%)`;
          
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        // Draw frequency labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px monospace';
        ctx.fillText('0Hz', 5, canvas.height - 5);
        ctx.fillText('8kHz', canvas.width / 2 - 15, canvas.height - 5);
        ctx.fillText('16kHz', canvas.width - 35, canvas.height - 5);
      } else {
        // Waveform oscilloscope
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 255, 150)';
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Draw center line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    };

    render();
  }, [mode]);

  useEffect(() => {
    if (isPlaying) {
      initAudio();
      draw();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, initAudio, draw]);

  // Draw static state when not playing
  useEffect(() => {
    if (!isPlaying && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgb(10, 10, 20)';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw center line for waveform
        if (mode === 'waveform') {
          ctx.strokeStyle = 'rgba(0, 255, 150, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, canvasRef.current.height / 2);
          ctx.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
          ctx.stroke();
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▶ Play audio to analyze', canvasRef.current.width / 2, canvasRef.current.height / 2 + 4);
      }
    }
  }, [isPlaying, mode]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={120}
      className="w-full h-[120px] rounded border border-primary/30 bg-black"
    />
  );
};

export const DeepfakeDetectorChallenge = ({ onComplete }: DeepfakeDetectorChallengeProps) => {
  const [currentCase, setCurrentCase] = useState(0);
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'flagged' | null>>({});
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<'waveform' | 'spectrum'>('waveform');
  const audioRef = useRef<HTMLAudioElement>(null);

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
      
      // Need all 3 correct to get the flag
      if (finalScore === 3) {
        setTimeout(() => {
          onComplete(d('fWV0aWxlX3JvdGNldGVkX2VrYWZwZWVke0dBTEY='));
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
        // Stop audio when moving to next case
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
      }, 500);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
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
      <Badge variant={isCorrect ? "default" : "outline"} className="gap-1 bg-emerald-600">
        <CheckCircle className="h-3 w-3" />
        Approved {isCorrect ? '✓' : '✗'}
      </Badge>
    );
  };

  if (gameComplete) {
    const passed = score === 3;
    return (
      <Card className="bg-background/80 backdrop-blur border-primary/30">
        <CardHeader className="text-center">
          <CardTitle className={`text-2xl ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {passed ? '🛡️ Fraud Investigation Complete!' : '❌ Investigation Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-6xl mb-4">
            {passed ? '🎉' : '💸'}
          </div>
          <p className="text-lg">
            You correctly identified <span className="text-primary font-bold">{score}</span> out of <span className="font-bold">{totalCases}</span> calls.
          </p>
          
          {passed ? (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-4 mt-4">
              <p className="text-emerald-400 font-medium">
                Excellent forensic analysis! You've protected the company from deepfake fraud.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The flag will be submitted automatically...
              </p>
            </div>
          ) : (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mt-4">
              <p className="text-red-400 font-medium">
                The fraudsters got through. Millions were wired to criminal accounts.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You need 3/3 correct to pass. Refresh to try again.
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
                  <span>Call #{tx.id} - {tx.amount}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={tx.isDeepfake ? "destructive" : "secondary"} className="text-xs">
                      {tx.isDeepfake ? 'DEEPFAKE' : 'GENUINE'}
                    </Badge>
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
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
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-lg">🏦 FinSecure Voice Fraud Detection</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Analyze calls from Sarah Chen for deepfakes</p>
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-xs sm:text-sm text-muted-foreground">Calls Analyzed</div>
              <div className="text-lg sm:text-xl font-bold text-primary">{reviewedCount}/{totalCases}</div>
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
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              setIsPlaying(false);
            }}
            className={`flex-shrink-0 ${decisions[tx.id] ? 'opacity-60' : ''}`}
          >
            Call #{tx.id}
            {getDecisionBadge(tx.id)}
          </Button>
        ))}
      </div>

      {/* Current Transaction */}
      <Card className="bg-background/80 backdrop-blur border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Voice Call #{transaction.id}
            </CardTitle>
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              <Clock className="h-3 w-3 mr-1" />
              Pending Review
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Request Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Caller</div>
              <div className="font-semibold">Sarah Chen</div>
              <div className="text-sm text-muted-foreground">Finance Department</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Amount Requested</div>
              <div className="font-bold text-lg sm:text-xl text-emerald-400 flex items-center gap-1">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                {transaction.amount}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">Recipient</div>
              <div className="font-medium text-sm sm:text-base break-words">{transaction.recipient}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">Timestamp</div>
              <div className="font-mono text-xs sm:text-sm">{transaction.timestamp}</div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-black/50 rounded-lg p-4 border border-primary/20">
            <audio 
              ref={audioRef}
              src={transaction.audioFile}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              crossOrigin="anonymous"
            />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Voice Recording</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleAudio}
                  className="h-9 w-9 rounded-full p-0"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={restartAudio}
                  className="h-8 w-8 rounded-full p-0"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Visualizer Mode Toggle */}
            <Tabs value={visualizerMode} onValueChange={(v) => setVisualizerMode(v as 'waveform' | 'spectrum')}>
              <TabsList className="grid grid-cols-2 w-full mb-3">
                <TabsTrigger value="waveform" className="gap-1 text-xs">
                  <Activity className="h-3 w-3" />
                  Waveform
                </TabsTrigger>
                <TabsTrigger value="spectrum" className="gap-1 text-xs">
                  <Radio className="h-3 w-3" />
                  Spectrum
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Audio Visualizer */}
            <AudioVisualizer 
              audioRef={audioRef} 
              isPlaying={isPlaying} 
              mode={visualizerMode}
            />

            <div className="mt-3 text-xs text-muted-foreground text-center space-y-1">
              <p className="leading-tight">🔍 <strong>Waveform:</strong> Look for unnatural amplitude patterns, robotic consistency</p>
              <p className="leading-tight">📊 <strong>Spectrum:</strong> Synthetic voices often lack natural frequency variation</p>
            </div>
          </div>

          {/* Hints */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-xs text-amber-400">
              <strong>💡 Forensic Tips:</strong> AI-generated audio often has unnaturally smooth waveforms, 
              lacks micro-variations in pitch, and may show unusual frequency patterns in the spectrum analyzer. 
              Real human speech has natural imperfections and breathing patterns.
            </p>
          </div>

          {/* Decision Buttons */}
          {!decisions[transaction.id] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => makeDecision('approved')}
                className="bg-emerald-600 hover:bg-emerald-700 text-sm px-3"
              >
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Genuine - Approve</span>
              </Button>
              <Button
                onClick={() => makeDecision('flagged')}
                variant="destructive"
                className="text-sm px-3"
              >
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Deepfake - Reject</span>
              </Button>
            </div>
          )}

          {decisions[transaction.id] && (
            <div className="text-center py-2 text-muted-foreground">
              Decision recorded. Select another call or complete analysis.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
