import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { RotateCcw, CheckCircle2, Crown, Lightbulb } from "lucide-react";

interface ChessPuzzle {
  position: string;
  board: string; // ASCII representation
  question: string;
  correctMove: string;
  hint: string;
  flagLetter: string;
}

// Valid checkmate-in-one puzzles - destination files spell FACE
const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    position: "Scholar's Mate pattern",
    board: `  a b c d e f g h
8 . . . q k . . .
7 . . . p . p . .
6 . . . . . . . .
5 . . . . . . . Q
4 . . B . . . . .
3 . . . . . . . .
2 . . . . . . . .
1 . . . . . . . .`,
    question: "White to move. Black King e8, Black Queen d8, pawns d7/f7. White Queen h5, White Bishop c4. Find the checkmate!",
    correctMove: "Qxf7#",
    hint: "The Bishop on c4 protects a critical square on the a2-g8 diagonal",
    flagLetter: "F"
  },
  {
    position: "Back Rank Mate",
    board: `  a b c d e f g h
8 . . . . . . . k
7 . . . . . . p p
6 . . . . . . . .
5 . . . . . . . .
4 . . . . . . . .
3 . . . . . . . .
2 . . . . . . . .
1 R . . . . . . .`,
    question: "White to move. Black King h8, pawns g7/h7. White Rook a1. Deliver checkmate!",
    correctMove: "Ra8#",
    hint: "The pawns trap the King - use the back rank",
    flagLetter: "A"
  },
  {
    position: "Rook and King Coordination",
    board: `  a b c d e f g h
8 k . . . . . . .
7 . . . . . . . .
6 K . . . . . . .
5 . . . . . . . .
4 . . . . . . . .
3 . . . . . . . .
2 . . . . . . . .
1 . . R . . . . .`,
    question: "White to move. Black King a8, White King a6, White Rook c1. Find the checkmate!",
    correctMove: "Rc8#",
    hint: "The White King controls the escape squares on the 7th rank",
    flagLetter: "C"
  },
  {
    position: "Queen Back Rank",
    board: `  a b c d e f g h
8 . . . . . r . k
7 . . . . . p p p
6 . . . . . . . .
5 . . . . . . . .
4 . . . . . . . .
3 . . . . . . . .
2 . . . . . . . .
1 . . . . Q . . .`,
    question: "White to move. Black King g8, Black Rook f8, pawns f7/g7/h7. White Queen e1. Deliver checkmate!",
    correctMove: "Qe8#",
    hint: "The Queen attacks along the entire 8th rank",
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
    return move.trim().toLowerCase().replace(/[+#x]/g, '').replace(/\s/g, '');
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
      setAttempts(0);
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
          The destination squares revealed the flag. Submit above!
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

      {/* Revealed letters - destination files spell the flag */}
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
          <span className="text-xs text-muted-foreground">Chess Puzzle #{currentIndex + 1}: {currentPuzzle.position}</span>
        </div>
        
        {/* ASCII Board */}
        <pre className="p-3 mb-3 bg-background/50 rounded border font-mono text-xs leading-relaxed overflow-x-auto">
          {currentPuzzle.board}
        </pre>
        
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
          placeholder="Enter move (e.g., Qxf7# or Qf7)"
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
          Destination squares reveal the flag!
        </p>
      </div>
    </div>
  );
};

export default ChessChallenge;
