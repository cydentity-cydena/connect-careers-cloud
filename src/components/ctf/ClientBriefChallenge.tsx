import { useState, useRef, useEffect } from "react";
import { CheckCircle2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FLAG = "FLAG{scope_boundaries_verified_and_risks_acknowledged}";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswers: number[]; // indices of correct options
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Based on the Client Brief, which IP range is authorised for testing?",
    options: [
      "192.168.110.0/24",
      "10.10.110.0/24",
      "10.10.110.0/24 except 10.10.110.1",
      "10.10.110.0/24 except 10.10.110.2",
      "192.168.110.0/24 except 192.168.110.2",
    ],
    correctAnswers: [1], // 10.10.110.0/24
  },
  {
    id: 2,
    text: "Based on the Client Brief, which domain is in scope?",
    options: [
      "financialaudit.com",
      "financialaudit.com.gb",
      "financialaudit.gr",
      "financialaudit.org",
    ],
    correctAnswers: [0], // financialaudit.com
  },
  {
    id: 3,
    text: "Based on the Client Brief, which risks are acknowledged?",
    options: [
      "Application crashes",
      "System Instability",
      "Limited Exposure of Sensitive Data during Proof-of-Concept Validation",
      "System Unavailability",
      "Temporary Service Degradation",
      "Triggering of Security Monitoring Alerts",
      "Incident Response Processes",
      "Account Lockouts",
      "Automated Defensive Countermeasures",
      "Data Loss",
      "All of the Above",
    ],
    correctAnswers: [0, 1, 2, 3, 4, 5, 6, 7, 8], // All except "Data Loss" and "All of the Above"
  },
  {
    id: 4,
    text: "What is the authorised IP scope, excluding any exclusions?",
    options: [
      "192.168.210.0/24",
      "10.10.110.0/24",
      "192.168.110.0/24",
      "10.10.110.0/24 except 10.10.110.1",
      "192.168.210.0/24 except 192.168.210.1",
    ],
    correctAnswers: [1], // 10.10.110.0/24
  },
  {
    id: 5,
    text: "What is the authorised domain scope?",
    options: [
      "financialaudit.edu",
      "financialaudit.co",
      "financialaudit.gb",
      "financialaudit.io",
      "financialaudit.com",
    ],
    correctAnswers: [4], // financialaudit.com
  },
  {
    id: 6,
    text: "What is the authorised testing window?",
    options: [
      "01/2026 – 02/2026",
      "02/2026 – 03/2026",
      "03/2026 – 04/2026",
      "05/2026 – 06/2026",
      "07/2026 – 08/2026",
    ],
    correctAnswers: [3], // 05/2026 – 06/2026
  },
];

const CLIENT_BRIEF = {
  sections: [
    {
      title: "1. Objective",
      content: "The purpose of this engagement is to identify security vulnerabilities within the agreed-upon systems and assess the potential impact of exploitation. Our goal is to provide actionable recommendations to strengthen your security posture.",
    },
    {
      title: "2. Scope of Testing",
      content: "The assessment will include the following assets:",
      bullets: [
        "financialaudit.com",
        "IP Ranges: 10.10.110.0/24 except 10.10.110.1 which is a firewall.",
        "Testing type: Black Box",
        "Testing window: 05/2026 – 06/2026",
      ],
    },
    {
      title: "3. Methodology",
      content: "Testing will follow industry-recognized standards such as:",
      bullets: [
        "OWASP Testing Guide",
        "PTES (Penetration Testing Execution Standard)",
        "NIST guidelines (where applicable)",
      ],
      footer: "Activities may include reconnaissance, vulnerability identification, controlled exploitation, and impact analysis. No denial-of-service testing will be performed unless explicitly agreed upon in writing.",
    },
    {
      title: "4. Rules of Engagement",
      bullets: [
        "Written authorization has been obtained before testing.",
        "Testing will be conducted during approved hours.",
        "Any critical findings will be reported immediately.",
        "Sensitive data accessed during testing will be handled confidentially and securely.",
      ],
    },
    {
      title: "5. Risk Acknowledgment",
      content: "The Client acknowledges that penetration testing involves simulated attack techniques which inherently carry certain risks, including but not limited to:",
      bullets: [
        "Temporary service degradation or system unavailability",
        "Application crashes or system instability",
        "Triggering of security monitoring alerts or incident response processes",
        "Account lockouts or automated defensive countermeasures",
        "Limited exposure of sensitive data during proof-of-concept validation",
      ],
      footer: "While PENTEST LTD will take all reasonable precautions to minimize disruption and avoid unnecessary impact, some operational risk is inherent in security testing activities. Penetration testing provides a point-in-time assessment and does not guarantee the identification of all vulnerabilities or future security posture.",
    },
    {
      title: "6. Deliverables",
      content: "At the conclusion of the engagement, you will receive:",
      bullets: [
        "Executive summary (non-technical overview)",
        "Detailed technical findings",
        "Risk ratings and business impact",
        "Proof-of-concept evidence (where applicable)",
        "Remediation recommendations",
      ],
    },
    {
      title: "7. Point of Contact",
      contacts: [
        { role: "Primary Contact", name: "Emma Johnson", title: "Senior Penetration Tester", phone: "+4496123123", email: "emma.johnson@mail.com" },
        { role: "Escalation Contact", name: "Chris Stevenson", title: "Penetration Tester", phone: "+4496123456", email: "chris.stevenson@mail.com" },
      ],
    },
  ],
};

interface ClientBriefChallengeProps {
  onComplete: (flag: string) => void;
}

const ClientBriefChallenge = ({ onComplete }: ClientBriefChallengeProps) => {
  const [briefOpen, setBriefOpen] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [isComplete, setIsComplete] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);

  const question = QUESTIONS[currentQuestion];
  const isMultiSelect = question.correctAnswers.length > 1;

  useEffect(() => {
    questionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentQuestion]);

  const toggleOption = (optIdx: number) => {
    if (submitted[currentQuestion]) return;
    setSelected(prev => {
      const current = prev[currentQuestion] || [];
      if (isMultiSelect) {
        return {
          ...prev,
          [currentQuestion]: current.includes(optIdx)
            ? current.filter(i => i !== optIdx)
            : [...current, optIdx],
        };
      }
      return { ...prev, [currentQuestion]: [optIdx] };
    });
  };

  const handleSubmit = () => {
    const sel = selected[currentQuestion] || [];
    if (sel.length === 0) return;

    const correct = question.correctAnswers;
    const isCorrect =
      sel.length === correct.length &&
      sel.every(s => correct.includes(s)) &&
      correct.every(c => sel.includes(c));

    setSubmitted(prev => ({ ...prev, [currentQuestion]: true }));
    setResults(prev => ({ ...prev, [currentQuestion]: isCorrect }));

    // Check if all questions answered correctly
    const newResults = { ...results, [currentQuestion]: isCorrect };
    const allCorrect = QUESTIONS.every((_, i) => newResults[i] === true);
    if (allCorrect) {
      setIsComplete(true);
      onComplete(FLAG);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRetry = () => {
    setSelected(prev => ({ ...prev, [currentQuestion]: [] }));
    setSubmitted(prev => ({ ...prev, [currentQuestion]: false }));
    setResults(prev => {
      const n = { ...prev };
      delete n[currentQuestion];
      return n;
    });
  };

  const solvedCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Professional Practice & Legal Framework
        </span>
        <span className="flex items-center gap-1.5">
          {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
          {solvedCount}/{QUESTIONS.length} correct
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors cursor-pointer ${
              results[i] === true
                ? "bg-green-500"
                : results[i] === false
                ? "bg-destructive"
                : i === currentQuestion
                ? "bg-primary/60"
                : "bg-muted/50"
            }`}
            onClick={() => setCurrentQuestion(i)}
          />
        ))}
      </div>

      {/* Client Brief (collapsible) */}
      <Card className="border-primary/20">
        <button
          className="w-full flex items-center justify-between p-4 text-left"
          onClick={() => setBriefOpen(!briefOpen)}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Client Brief — PENTEST LTD</span>
          </div>
          {briefOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {briefOpen && (
          <CardContent className="pt-0 space-y-4 max-h-72 overflow-y-auto text-xs leading-relaxed">
            <p className="text-muted-foreground italic">
              Dear Client, thank you for engaging us to perform a penetration test. This brief outlines the scope, objectives, methodology, and expectations for the upcoming assessment.
            </p>
            {CLIENT_BRIEF.sections.map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold text-foreground mb-1">{section.title}</h4>
                {section.content && <p className="text-muted-foreground mb-1">{section.content}</p>}
                {section.bullets && (
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5 ml-2">
                    {section.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
                {section.footer && (
                  <p className="text-muted-foreground mt-1">{section.footer}</p>
                )}
                {section.contacts && (
                  <div className="space-y-1 mt-1">
                    {section.contacts.map((c, j) => (
                      <p key={j} className="text-muted-foreground">
                        <span className="font-medium text-foreground">{c.role}:</span> {c.name} / {c.title} / {c.phone} / {c.email}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <p className="text-muted-foreground italic">
              Kind regards, Emma Johnson — Senior Penetration Tester, PENTEST LTD
            </p>
          </CardContent>
        )}
      </Card>

      {/* Question */}
      <div ref={questionRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary">
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </span>
          {isMultiSelect && (
            <span className="text-xs text-muted-foreground">Select all that apply</span>
          )}
        </div>

        <p className="text-sm font-medium">{question.text}</p>

        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected = (selected[currentQuestion] || []).includes(idx);
            const isSubmitted = submitted[currentQuestion];
            const isCorrectAnswer = question.correctAnswers.includes(idx);

            let optionClass = "border-border hover:border-primary/50 cursor-pointer";
            if (isSelected && !isSubmitted) {
              optionClass = "border-primary bg-primary/10 cursor-pointer";
            }
            if (isSubmitted) {
              if (isCorrectAnswer && isSelected) {
                optionClass = "border-green-500 bg-green-500/10";
              } else if (isCorrectAnswer && !isSelected) {
                optionClass = "border-green-500/50 bg-green-500/5";
              } else if (!isCorrectAnswer && isSelected) {
                optionClass = "border-destructive bg-destructive/10";
              } else {
                optionClass = "border-border opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => toggleOption(idx)}
                disabled={isSubmitted}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${optionClass} disabled:cursor-default`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded ${
                      isMultiSelect ? "rounded-sm" : "rounded-full"
                    } border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40"
                    } ${isSubmitted && isCorrectAnswer ? "border-green-500 bg-green-500" : ""} ${
                      isSubmitted && !isCorrectAnswer && isSelected ? "border-destructive bg-destructive" : ""
                    }`}
                  >
                    {(isSelected || (isSubmitted && isCorrectAnswer)) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentQuestion === QUESTIONS.length - 1}
            >
              Next
            </Button>
          </div>

          {!submitted[currentQuestion] ? (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={(selected[currentQuestion] || []).length === 0}
            >
              Submit Answer
            </Button>
          ) : results[currentQuestion] ? (
            <span className="text-xs text-green-500 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Correct
            </span>
          ) : (
            <Button size="sm" variant="outline" onClick={handleRetry}>
              Try Again
            </Button>
          )}
        </div>
      </div>

      {/* Completion */}
      {isComplete && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-400">All questions answered correctly!</p>
          <p className="text-xs text-muted-foreground mt-1">Flag submitted automatically.</p>
        </div>
      )}
    </div>
  );
};

export default ClientBriefChallenge;
