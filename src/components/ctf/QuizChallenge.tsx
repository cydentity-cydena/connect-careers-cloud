import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  flagLetter: string;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What does SQL injection primarily exploit?",
    options: [
      "Memory buffer overflows",
      "Unsanitized user input in database queries",
      "Weak encryption algorithms",
      "Network packet sniffing"
    ],
    correctIndex: 1,
    flagLetter: "Q",
    explanation: "SQL injection exploits unsanitized user input that gets concatenated into SQL queries."
  },
  {
    question: "Which protocol provides end-to-end encryption for web traffic?",
    options: [
      "HTTP",
      "FTP",
      "HTTPS/TLS",
      "SMTP"
    ],
    correctIndex: 2,
    flagLetter: "U",
    explanation: "HTTPS uses TLS to encrypt data between the browser and server."
  },
  {
    question: "What is the primary purpose of a firewall?",
    options: [
      "Encrypt stored data",
      "Filter network traffic based on rules",
      "Detect malware on endpoints",
      "Backup critical files"
    ],
    correctIndex: 1,
    flagLetter: "I",
    explanation: "Firewalls control incoming and outgoing network traffic based on security rules."
  },
  {
    question: "What type of attack involves flooding a server with requests?",
    options: [
      "Phishing",
      "Man-in-the-Middle",
      "Denial of Service (DoS)",
      "Cross-Site Scripting"
    ],
    correctIndex: 2,
    flagLetter: "Z",
    explanation: "DoS attacks overwhelm a server with traffic to make it unavailable to legitimate users."
  },
  {
    question: "What does 'MFA' stand for in cybersecurity?",
    options: [
      "Multiple Firewall Architecture",
      "Multi-Factor Authentication",
      "Malware Free Application",
      "Master File Access"
    ],
    correctIndex: 1,
    flagLetter: "_",
    explanation: "Multi-Factor Authentication requires two or more verification factors to access a resource."
  },
  {
    question: "Which of these is a common indicator of a phishing email?",
    options: [
      "Professional formatting",
      "Known sender address",
      "Urgent action required with suspicious links",
      "Company letterhead"
    ],
    correctIndex: 2,
    flagLetter: "M",
    explanation: "Phishing emails often create urgency and contain suspicious or spoofed links."
  },
  {
    question: "What is the purpose of hashing passwords?",
    options: [
      "Make them shorter",
      "Store them securely as one-way encrypted values",
      "Speed up login times",
      "Allow password recovery"
    ],
    correctIndex: 1,
    flagLetter: "A",
    explanation: "Hashing creates a one-way transformation so plaintext passwords aren't stored."
  },
  {
    question: "What does 'XSS' stand for?",
    options: [
      "Extra Secure Socket",
      "Cross-Site Scripting",
      "Extended Security System",
      "External Server Service"
    ],
    correctIndex: 1,
    flagLetter: "S",
    explanation: "Cross-Site Scripting allows attackers to inject malicious scripts into web pages."
  },
  {
    question: "Which port is commonly used for SSH?",
    options: [
      "21",
      "22",
      "80",
      "443"
    ],
    correctIndex: 1,
    flagLetter: "T",
    explanation: "SSH (Secure Shell) typically runs on port 22."
  },
  {
    question: "What is a 'zero-day' vulnerability?",
    options: [
      "A bug that takes zero days to fix",
      "A vulnerability exploited before the vendor knows about it",
      "A flaw in day-zero hardware",
      "An expired security certificate"
    ],
    correctIndex: 1,
    flagLetter: "R",
    explanation: "Zero-day vulnerabilities are unknown to the software vendor and have no patch available."
  }
];

// The flag letters spell out: QUIZ_MASTR -> FLAG{QUIZ_MASTER}

interface QuizChallengeProps {
  onComplete: (flag: string) => void;
}

export const QuizChallenge: React.FC<QuizChallengeProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;

  const handleAnswerSelect = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setAnswered(true);
    
    if (isCorrect) {
      setCorrectAnswers(prev => [...prev, currentQuestion.flagLetter]);
    } else {
      setWrongCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setIsComplete(true);
      // Build the flag from correct answers
      if (correctAnswers.length === QUIZ_QUESTIONS.length && wrongCount === 0) {
        const flag = `FLAG{${correctAnswers.join('')}ER}`;
        onComplete(flag);
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrectAnswers([]);
    setWrongCount(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const allCorrect = correctAnswers.length === QUIZ_QUESTIONS.length;
    const flag = `FLAG{QUIZ_MASTER}`;
    
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 text-center space-y-4">
          {allCorrect ? (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
              <h3 className="text-lg font-bold text-green-400">Quiz Completed!</h3>
              <p className="text-sm text-muted-foreground">
                You answered all {QUIZ_QUESTIONS.length} questions correctly!
              </p>
              <div className="p-3 rounded-lg bg-background/50 font-mono text-primary">
                {flag}
              </div>
              <p className="text-xs text-muted-foreground">
                The flag has been filled in below. Click Submit to capture it!
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <h3 className="text-lg font-bold text-red-400">Quiz Failed</h3>
              <p className="text-sm text-muted-foreground">
                You got {correctAnswers.length}/{QUIZ_QUESTIONS.length} correct.
                You need a perfect score to unlock the flag!
              </p>
              <Button onClick={handleReset} variant="outline" size="sm">
                Try Again
              </Button>
            </>
          )}
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
                  ? (correctAnswers[idx] ? "bg-green-500" : "bg-red-500")
                  : idx === currentQuestionIndex 
                    ? "bg-primary" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <Card className="bg-background/50 border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{currentQuestion.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={answered}
                className={cn(
                  "w-full p-3 text-left text-sm rounded-lg border transition-all",
                  "hover:bg-accent/50",
                  selectedAnswer === idx && !answered && "ring-2 ring-primary border-primary",
                  answered && idx === currentQuestion.correctIndex && "bg-green-500/20 border-green-500 text-green-400",
                  answered && selectedAnswer === idx && idx !== currentQuestion.correctIndex && "bg-red-500/20 border-red-500 text-red-400",
                  answered && selectedAnswer !== idx && idx !== currentQuestion.correctIndex && "opacity-50"
                )}
              >
                <span className="font-mono mr-2 text-muted-foreground">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </button>
            ))}
          </div>

          {/* Explanation (shown after answering) */}
          {answered && (
            <div className={cn(
              "p-3 rounded-lg text-xs",
              isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
            )}>
              <p className="font-medium mb-1">
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </p>
              <p className="text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {!answered ? (
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={selectedAnswer === null}
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
