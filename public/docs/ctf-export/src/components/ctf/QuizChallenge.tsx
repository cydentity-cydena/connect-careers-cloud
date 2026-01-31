import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  question: string;
  answer: string;
  hint: string;
}

// Answers spell out: N-E-V-E-R-G-I-V-E-U-P = NEVERGIVEUP
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Which popular open-source tool is used for network discovery and security auditing through port scanning?",
    answer: "nmap",
    hint: "It's a 4-letter tool that starts with 'n'."
  },
  {
    question: "What Linux command prints all environment variables to the terminal?",
    answer: "env",
    hint: "A 3-letter command that shows your shell's variables."
  },
  {
    question: "Which modal text editor, famous for its steep learning curve, is installed by default on most Unix systems?",
    answer: "vim",
    hint: "An improved version of 'vi'."
  },
  {
    question: "What bash command outputs a string or variable value to the terminal?",
    answer: "echo",
    hint: "It 'repeats' what you tell it."
  },
  {
    question: "What is the name of the superuser account on Unix/Linux systems with UID 0?",
    answer: "root",
    hint: "The most powerful account on the system."
  },
  {
    question: "Which command-line utility searches for text patterns using regular expressions?",
    answer: "grep",
    hint: "Global Regular Expression Print."
  },
  {
    question: "What legacy Linux command is used to configure network interfaces (now replaced by 'ip')?",
    answer: "ifconfig",
    hint: "Short for 'interface configuration'."
  },
  {
    question: "What technology creates a secure encrypted tunnel over the internet for private network access?",
    answer: "vpn",
    hint: "Virtual Private ___."
  },
  {
    question: "What is the term for the unauthorized transfer of data out of a compromised network or system?",
    answer: "exfiltration",
    hint: "The opposite of infiltration, but for data."
  },
  {
    question: "Which transport layer protocol is connectionless and commonly used for streaming and gaming?",
    answer: "udp",
    hint: "User Datagram Protocol."
  },
  {
    question: "Which ICMP-based command is used to test network connectivity to a remote host?",
    answer: "ping",
    hint: "Named after sonar sound."
  }
];

interface QuizChallengeProps {
  onComplete: (flag: string) => void;
}

export const QuizChallenge: React.FC<QuizChallengeProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [collectedLetters, setCollectedLetters] = useState<string[]>([]);
  const [showWrongReset, setShowWrongReset] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const correct = userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
    setAnswered(true);
    setIsCorrect(correct);
    
    if (correct) {
      const firstLetter = currentQuestion.answer[0].toUpperCase();
      setCollectedLetters(prev => [...prev, firstLetter]);
    } else {
      setShowWrongReset(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setShowHint(false);
      setAnswered(false);
      setIsCorrect(false);
    } else {
      setIsComplete(true);
      const flag = 'FLAG{NEVERGIVEUP}';
      onComplete(flag);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setShowHint(false);
    setAnswered(false);
    setIsCorrect(false);
    setCollectedLetters([]);
    setShowWrongReset(false);
    setIsComplete(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !answered) {
      handleSubmitAnswer();
    }
  };

  if (isComplete) {
    const flag = 'FLAG{NEVERGIVEUP}';
    
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
          <h3 className="text-lg font-bold text-green-400">Quiz Completed!</h3>
          <p className="text-sm text-muted-foreground">
            You answered all {QUIZ_QUESTIONS.length} questions correctly!
          </p>
          <div className="p-2 rounded bg-background/30 font-mono text-xs text-muted-foreground">
            {collectedLetters.join(' → ')}
          </div>
          <div className="p-3 rounded-lg bg-background/50 font-mono text-primary">
            {flag}
          </div>
          <p className="text-xs text-muted-foreground">
            The flag has been filled in below. Click Submit to capture it!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showWrongReset) {
    return (
      <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
        <CardContent className="p-4 text-center space-y-4">
          <XCircle className="h-12 w-12 mx-auto text-red-500" />
          <h3 className="text-lg font-bold text-red-400">Wrong Answer!</h3>
          <p className="text-sm text-muted-foreground">
            You must get all questions correct. The quiz will reset.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Hint: Each answer reveals a letter of the flag...
          </p>
          <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</span>
        <div className="flex gap-1">
          {QUIZ_QUESTIONS.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full",
                idx < currentQuestionIndex 
                  ? "bg-green-500"
                  : idx === currentQuestionIndex 
                    ? "bg-primary" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Collected letters so far */}
      {collectedLetters.length > 0 && (
        <div className="p-2 rounded bg-background/30 text-center">
          <span className="text-xs text-muted-foreground">Collected: </span>
          <span className="font-mono text-primary font-bold">
            {collectedLetters.join('')}
          </span>
        </div>
      )}

      {/* Question */}
      <Card className="bg-background/50 border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{currentQuestion.question}</p>
          </div>

          {/* Answer input */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Type your answer..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={answered}
              className={cn(
                "font-mono",
                answered && isCorrect && "border-green-500 bg-green-500/10"
              )}
            />
            
            {!answered && !showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Need a hint?
              </button>
            )}
            
            {showHint && !answered && (
              <p className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded">
                💡 {currentQuestion.hint}
              </p>
            )}
          </div>

          {/* Success message */}
          {answered && isCorrect && (
            <div className="p-3 rounded-lg text-xs bg-green-500/10 border border-green-500/20">
              <p className="font-medium text-green-400">
                ✓ Correct! The answer "{currentQuestion.answer}" gives you the letter "{currentQuestion.answer[0].toUpperCase()}"
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {!answered ? (
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={!userAnswer.trim()}
                size="sm"
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="sm">
                {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "See Results"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
