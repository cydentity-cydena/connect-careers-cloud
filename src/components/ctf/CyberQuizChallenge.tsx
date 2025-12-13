import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { RotateCcw, CheckCircle2, Shield } from "lucide-react";

interface QuizQuestion {
  question: string;
  answer: string;
  hint: string;
}

// Answers spell NEVERGIVEUP
const QUIZ_QUESTIONS: QuizQuestion[] = [
  { 
    question: "What network scanning tool shares its name with a sci-fi movie about machines?", 
    answer: "nmap",
    hint: "Think 'Network Mapper'"
  },
  { 
    question: "The reconnaissance phase of gathering system info is called ___?", 
    answer: "enumeration",
    hint: "Systematically listing resources"
  },
  { 
    question: "A weakness or flaw in a system that can be exploited is called a ___?", 
    answer: "vulnerability",
    hint: "CVE stands for Common ___ and Exposures"
  },
  { 
    question: "Malicious code that takes advantage of a vulnerability is called an ___?", 
    answer: "exploit",
    hint: "Metasploit is a framework for these"
  },
  { 
    question: "The information gathering phase before an attack is called ___?", 
    answer: "reconnaissance",
    hint: "Also known as 'recon'"
  },
  { 
    question: "What encryption tool uses the OpenPGP standard for securing emails?", 
    answer: "gpg",
    hint: "GNU Privacy ___"
  },
  { 
    question: "SQL ___ is a technique to attack databases through user input?", 
    answer: "injection",
    hint: "Inserting malicious SQL code"
  },
  { 
    question: "Malware that replicates by attaching to programs is called a ___?", 
    answer: "virus",
    hint: "Biological term for infectious agent"
  },
  { 
    question: "AES and RSA are examples of ___ algorithms?", 
    answer: "encryption",
    hint: "Converting plaintext to ciphertext"
  },
  { 
    question: "What transport protocol doesn't guarantee packet delivery? (3 letters)", 
    answer: "udp",
    hint: "User Datagram Protocol"
  },
  { 
    question: "Social engineering attacks via fake emails are called ___?", 
    answer: "phishing",
    hint: "Like 'fishing' for credentials"
  },
];

interface CyberQuizChallengeProps {
  onComplete: (flag: string) => void;
}

const CyberQuizChallenge = ({ onComplete }: CyberQuizChallengeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [decodedLetters, setDecodedLetters] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmitAnswer = () => {
    if (!answerInput.trim()) return;

    const currentQuestion = QUIZ_QUESTIONS[currentIndex];
    const isCorrect = answerInput.trim().toLowerCase() === currentQuestion.answer.toLowerCase();

    if (isCorrect) {
      const newLetter = currentQuestion.answer[0].toLowerCase();
      const newDecodedLetters = [...decodedLetters, newLetter];
      setDecodedLetters(newDecodedLetters);
      setShowHint(false);
      
      if (currentIndex === QUIZ_QUESTIONS.length - 1) {
        setIsComplete(true);
        const flag = `FLAG{${newDecodedLetters.join("")}}`;
        toast.success("🎉 You cracked the code!");
        onComplete(flag);
      } else {
        toast.success(`✓ Correct! Question ${currentIndex + 1}/${QUIZ_QUESTIONS.length}`);
        setCurrentIndex(currentIndex + 1);
      }
      setAnswerInput("");
    } else {
      setAttempts(attempts + 1);
      toast.error("❌ Wrong answer! Progress reset...");
      setCurrentIndex(0);
      setDecodedLetters([]);
      setAnswerInput("");
      setShowHint(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setDecodedLetters([]);
    setAnswerInput("");
    setShowHint(false);
  };

  const progress = (currentIndex / QUIZ_QUESTIONS.length) * 100;

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

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}</span>
          <span>{attempts} resets</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Decoded letters so far */}
      <div className="flex gap-1 justify-center flex-wrap">
        {QUIZ_QUESTIONS.map((_, idx) => (
          <div
            key={idx}
            className={`w-7 h-7 rounded flex items-center justify-center font-mono text-xs font-bold ${
              idx < decodedLetters.length
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : idx === currentIndex
                ? "bg-primary/20 text-primary border border-primary/30 animate-pulse"
                : "bg-muted/30 text-muted-foreground border border-muted/50"
            }`}
          >
            {idx < decodedLetters.length ? decodedLetters[idx].toUpperCase() : "?"}
          </div>
        ))}
      </div>

      {/* Question */}
      <div className="p-4 bg-muted/20 rounded-lg border border-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Security Question #{currentIndex + 1}</span>
        </div>
        <p className="text-sm font-medium">{currentQuestion.question}</p>
        
        {showHint && (
          <p className="text-xs text-yellow-400 mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
            💡 {currentQuestion.hint}
          </p>
        )}
      </div>

      {/* Answer input */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter your answer..."
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          className="font-mono"
          onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
        />
        <Button onClick={handleSubmitAnswer} size="sm" disabled={!answerInput.trim()}>
          Submit
        </Button>
        <Button onClick={handleReset} size="sm" variant="outline" title="Reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center">
        {!showHint ? (
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
        {attempts > 2 && (
          <p className="text-xs text-muted-foreground">
            Keep trying! Each answer's first letter reveals part of the flag.
          </p>
        )}
      </div>
    </div>
  );
};

export default CyberQuizChallenge;
