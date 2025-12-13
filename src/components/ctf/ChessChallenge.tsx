import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { RotateCcw, CheckCircle2, XCircle } from "lucide-react";

// The secret moves - first letters spell NEVERGIVEUP
const CHESS_MOVES = ["Nc3", "e4", "Vc4", "Er5", "Rf1", "Gg3", "Ia4", "Ve2", "Ee4", "Up8", "Pb2"];

interface ChessChallengeProps {
  onComplete: (flag: string) => void;
}

const ChessChallenge = ({ onComplete }: ChessChallengeProps) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveInput, setMoveInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [decodedLetters, setDecodedLetters] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmitMove = () => {
    if (!moveInput.trim()) return;

    const expectedMove = CHESS_MOVES[currentMoveIndex];
    const isCorrect = moveInput.trim().toLowerCase() === expectedMove.toLowerCase();

    if (isCorrect) {
      const newLetter = expectedMove[0].toLowerCase();
      const newDecodedLetters = [...decodedLetters, newLetter];
      setDecodedLetters(newDecodedLetters);
      
      if (currentMoveIndex === CHESS_MOVES.length - 1) {
        // Completed all moves!
        setIsComplete(true);
        const flag = `FLAG{${newDecodedLetters.join("")}}`;
        toast.success("🎉 You decoded the message!");
        onComplete(flag);
      } else {
        toast.success(`✓ Correct! Move ${currentMoveIndex + 1}/${CHESS_MOVES.length}`);
        setCurrentMoveIndex(currentMoveIndex + 1);
      }
      setMoveInput("");
    } else {
      // Wrong move - reset!
      setAttempts(attempts + 1);
      toast.error("❌ Wrong move! Resetting...");
      setCurrentMoveIndex(0);
      setDecodedLetters([]);
      setMoveInput("");
    }
  };

  const handleReset = () => {
    setCurrentMoveIndex(0);
    setDecodedLetters([]);
    setMoveInput("");
  };

  const progress = (currentMoveIndex / CHESS_MOVES.length) * 100;

  if (isComplete) {
    return (
      <div className="space-y-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">Challenge Complete!</span>
        </div>
        <div className="font-mono text-lg text-center py-2 bg-background/50 rounded">
          FLAG{`{${decodedLetters.join("")}}`}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Submit this flag above to earn your points!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Move {currentMoveIndex + 1} of {CHESS_MOVES.length}</span>
          <span>{attempts} resets</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Decoded letters so far */}
      <div className="flex gap-1 justify-center flex-wrap">
        {CHESS_MOVES.map((_, idx) => (
          <div
            key={idx}
            className={`w-8 h-8 rounded flex items-center justify-center font-mono text-sm font-bold ${
              idx < decodedLetters.length
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : idx === currentMoveIndex
                ? "bg-primary/20 text-primary border border-primary/30 animate-pulse"
                : "bg-muted/30 text-muted-foreground border border-muted/50"
            }`}
          >
            {idx < decodedLetters.length ? decodedLetters[idx].toUpperCase() : "?"}
          </div>
        ))}
      </div>

      {/* Chess board hint */}
      <div className="text-center p-3 bg-muted/20 rounded-lg border border-muted/30">
        <p className="text-xs text-muted-foreground mb-1">Intercept #{currentMoveIndex + 1}</p>
        <p className="text-sm">
          What chess move starts with <span className="font-bold text-primary">{CHESS_MOVES[currentMoveIndex][0].toUpperCase()}</span> 
          {" "}and targets position <span className="font-mono font-bold">{CHESS_MOVES[currentMoveIndex].slice(1)}</span>?
        </p>
      </div>

      {/* Move input */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter move (e.g., Nc3)"
          value={moveInput}
          onChange={(e) => setMoveInput(e.target.value)}
          className="font-mono"
          onKeyDown={(e) => e.key === "Enter" && handleSubmitMove()}
        />
        <Button onClick={handleSubmitMove} size="sm" disabled={!moveInput.trim()}>
          Submit
        </Button>
        <Button onClick={handleReset} size="sm" variant="outline">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {attempts > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          💡 Tip: The move format is like "Nc3" - a piece letter + position
        </p>
      )}
    </div>
  );
};

export default ChessChallenge;
