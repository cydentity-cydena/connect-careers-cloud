import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw } from 'lucide-react';
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
    question: "Which nmap flag performs a SYN stealth scan?",
    options: [
      "-sT",
      "-sS",
      "-sU",
      "-sA"
    ],
    correctIndex: 1,
    flagLetter: "N",
    explanation: "-sS performs a SYN stealth scan, sending SYN packets without completing the TCP handshake."
  },
  {
    question: "What port does HTTPS typically run on?",
    options: [
      "80",
      "22",
      "443",
      "8080"
    ],
    correctIndex: 2,
    flagLetter: "E",
    explanation: "HTTPS uses port 443 by default for encrypted web traffic."
  },
  {
    question: "Which tool is commonly used for password cracking with wordlists?",
    options: [
      "Wireshark",
      "Nmap",
      "John the Ripper",
      "Metasploit"
    ],
    correctIndex: 2,
    flagLetter: "V",
    explanation: "John the Ripper is a popular password cracking tool that supports dictionary attacks."
  },
  {
    question: "What does the command 'chmod 777' do?",
    options: [
      "Deletes the file",
      "Encrypts the file",
      "Gives read, write, execute permissions to everyone",
      "Makes the file hidden"
    ],
    correctIndex: 2,
    flagLetter: "E",
    explanation: "chmod 777 sets read (4), write (2), and execute (1) permissions for owner, group, and others."
  },
  {
    question: "Which protocol does ping use?",
    options: [
      "TCP",
      "UDP",
      "ICMP",
      "ARP"
    ],
    correctIndex: 2,
    flagLetter: "R",
    explanation: "Ping uses ICMP (Internet Control Message Protocol) Echo Request and Reply messages."
  },
  {
    question: "What is the default port for SSH?",
    options: [
      "21",
      "22",
      "23",
      "25"
    ],
    correctIndex: 1,
    flagLetter: "G",
    explanation: "SSH (Secure Shell) uses port 22 by default for encrypted remote access."
  },
  {
    question: "Which command displays network connections on Linux?",
    options: [
      "ifconfig",
      "netstat",
      "ping",
      "traceroute"
    ],
    correctIndex: 1,
    flagLetter: "I",
    explanation: "netstat displays active network connections, routing tables, and interface statistics."
  },
  {
    question: "What does XSS stand for?",
    options: [
      "Extra Secure Socket",
      "Cross-Site Scripting",
      "Extended Security System",
      "External Script Source"
    ],
    correctIndex: 1,
    flagLetter: "V",
    explanation: "Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages."
  },
  {
    question: "Which Metasploit command starts a listener for reverse shells?",
    options: [
      "use auxiliary/scanner",
      "exploit/multi/handler",
      "set PAYLOAD",
      "run scanner"
    ],
    correctIndex: 1,
    flagLetter: "E",
    explanation: "exploit/multi/handler is used to catch incoming reverse shell connections in Metasploit."
  },
  {
    question: "What file contains password hashes on Linux?",
    options: [
      "/etc/passwd",
      "/etc/shadow",
      "/etc/hosts",
      "/etc/sudoers"
    ],
    correctIndex: 1,
    flagLetter: "UP",
    explanation: "/etc/shadow stores encrypted password hashes and is only readable by root."
  }
];

// The flag letters spell out: NEVERGIVEUP -> FLAG{NEVERGIVEUP}

interface QuizChallengeProps {
  onComplete: (flag: string) => void;
}

export const QuizChallenge: React.FC<QuizChallengeProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [showWrongReset, setShowWrongReset] = useState(false);
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
      // Wrong answer - show reset message
      setShowWrongReset(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setIsComplete(true);
      const flag = `FLAG{NEVERGIVEUP}`;
      onComplete(flag);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrectAnswers([]);
    setShowWrongReset(false);
    setIsComplete(false);
  };

  if (isComplete) {
    const flag = `FLAG{NEVERGIVEUP}`;
    
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 text-center space-y-4">
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
        </CardContent>
      </Card>
    );
  }

  // Show wrong answer reset screen
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
            Remember: Never give up!
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

          {/* Explanation (shown after answering correctly) */}
          {answered && isCorrect && (
            <div className="p-3 rounded-lg text-xs bg-green-500/10 border border-green-500/20">
              <p className="font-medium mb-1 text-green-400">✓ Correct!</p>
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
