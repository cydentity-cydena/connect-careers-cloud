import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { RotateCcw, CheckCircle2, Crown, Lightbulb } from "lucide-react";

interface ChessPuzzle {
  position: string; // Simple visual representation
  question: string;
  correctMove: string;
  hint: string;
  flagLetter: string;
}

// Each puzzle's correct move destination file spells: CHECKMATE -> C H E C K M A T E
// But we'll use first letter of the answer for simplicity
const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    position: "White to move. Black King on h8, White Queen on f6, White King on g6.",
    question: "What's the checkmate move? (e.g., Qg7#)",
    correctMove: "Qg7#",
    hint: "The Queen delivers mate by covering all escape squares",
    flagLetter: "G"
  },
  {
    position: "White to move. Black King on e8, White Rook on a1, White King on e6.",
    question: "What move forces checkmate in one?",
    correctMove: "Ra8#",
    hint: "Use the back rank",
    flagLetter: "A"
  },
  {
    position: "White to move. Black King on g8, White Queen on h5, White Bishop on c2.",
    question: "Find the checkmate with the Queen.",
    correctMove: "Qf7#",
    hint: "The Bishop supports the Queen's attack",
    flagLetter: "M"
  },
  {
    position: "White to move. Black King on e8, White Knight on d6, White Queen on e2.",
    question: "Deliver checkmate with the Queen.",
    correctMove: "Qe7#",
    hint: "The Knight controls key escape squares",
    flagLetter: "E"
  },
];

interface ChessChallengeProps {
  onComplete: (flag: string) => void;
}

const ChessChallenge = ({ onComplete }: ChessChallengeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [moveInput, setMoveInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [solvedLetters, setSolvedLetters] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const normalizeMove = (move: string): string => {
    return move.trim().toLowerCase().replace(/[+#]/g, '').replace(/\s/g, '');
  };

  const handleSubmitMove = () => {
    if (!moveInput.trim()) return;

    const currentPuzzle = CHESS_PUZZLES[currentIndex];
    const normalizedInput = normalizeMove(moveInput);
    const normalizedCorrect = normalizeMove(currentPuzzle.correctMove);

    if (normalizedInput === normalizedCorrect) {
      const newSolvedLetters = [...solvedLetters, currentPuzzle.flagLetter];
      setSolvedLetters(newSolvedLetters);
      setShowHint(false);
      
      if (currentIndex === CHESS_PUZZLES.length - 1) {
        setIsComplete(true);
        const flag = `FLAG{${newSolvedLetters.join("")}}`;
        toast.success("♔ Checkmate! You've solved all puzzles!");
        onComplete(flag);
      } else {
        toast.success(`♔ Correct! Puzzle ${currentIndex + 1}/${CHESS_PUZZLES.length} solved`);
        setCurrentIndex(currentIndex + 1);
      }
      setMoveInput("");
    } else {
      setAttempts(attempts + 1);
      toast.error("♟ Incorrect move. Try again!");
      if (attempts >= 2 && !showHint) {
        setShowHint(true);
      }
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSolvedLetters([]);
    setMoveInput("");
    setShowHint(false);
    setAttempts(0);
  };

  const progress = (currentIndex / CHESS_PUZZLES.length) * 100;

  if (isComplete) {
    return (
      <div className="space-y-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">All Puzzles Solved!</span>
        </div>
        <div className="font-mono text-lg text-center py-2 bg-background/50 rounded">
          FLAG{`{${solvedLetters.join("")}}`}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          The correct moves revealed the hidden message. Submit this flag above!
        </p>
      </div>
    );
  }

  const currentPuzzle = CHESS_PUZZLES[currentIndex];

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Puzzle {currentIndex + 1} of {CHESS_PUZZLES.length}</span>
          <span>{attempts} attempts</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Revealed letters */}
      <div className="flex gap-1 justify-center flex-wrap">
        {CHESS_PUZZLES.map((_, idx) => (
          <div
            key={idx}
            className={`w-8 h-8 rounded flex items-center justify-center font-mono text-sm font-bold ${
              idx < solvedLetters.length
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : idx === currentIndex
                ? "bg-primary/20 text-primary border border-primary/30 animate-pulse"
                : "bg-muted/30 text-muted-foreground border border-muted/50"
            }`}
          >
            {idx < solvedLetters.length ? solvedLetters[idx] : "?"}
          </div>
        ))}
      </div>

      {/* Chess Position */}
      <div className="p-4 bg-muted/20 rounded-lg border border-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Chess Puzzle #{currentIndex + 1}</span>
        </div>
        
        {/* Position description */}
        <div className="p-3 mb-3 bg-background/50 rounded border font-mono text-xs">
          {currentPuzzle.position}
        </div>
        
        <p className="text-sm font-medium">{currentPuzzle.question}</p>
        
        {showHint && (
          <p className="text-xs text-yellow-400 mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
            <Lightbulb className="h-3 w-3 inline mr-1" />
            {currentPuzzle.hint}
          </p>
        )}
      </div>

      {/* Move input */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter move (e.g., Qg7#)"
          value={moveInput}
          onChange={(e) => setMoveInput(e.target.value)}
          className="font-mono"
          onKeyDown={(e) => e.key === "Enter" && handleSubmitMove()}
        />
        <Button onClick={handleSubmitMove} size="sm" disabled={!moveInput.trim()}>
          Submit
        </Button>
        <Button onClick={handleReset} size="sm" variant="outline" title="Reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center">
        {!showHint && attempts > 0 ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground"
            onClick={() => setShowHint(true)}
          >
            Need a hint?
          </Button>
        ) : (
          <span />
        )}
        <p className="text-xs text-muted-foreground">
          Solve each puzzle - the moves reveal the flag!
        </p>
      </div>
    </div>
  );
};

export default ChessChallenge;
