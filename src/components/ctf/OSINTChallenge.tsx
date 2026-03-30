import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, FileText, Search, AlertTriangle, ChevronRight, Eye, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onComplete?: (flag: string) => void;
}

/* ───── static data for each sub-challenge ───── */

const WHOIS_DATA = `Domain Name: cydena-dynamics.com
Registrar: EuroDNS Ltd.
Creation Date: 2022-04-12

Registrant Organization: Cydena Dynamics Ltd
Registrant Country: GB

Admin Email: info@cydena-dynamics.com
Tech Email: platform-ops@cydena-dynamics.com

Name Server: ns1.cydena-dynamics.com
Name Server: ns2.cydena-dynamics.com`;

const DNS_ZONE_DATA = `$ORIGIN cydena-dynamics.com.

@       IN  SOA ns1.cydena-dynamics.com. admin.cydena-dynamics.com. (
            2024021201
            3600
            1800
            604800
            86400 )

@       IN  NS  ns1.cydena-dynamics.com.
@       IN  NS  ns2.cydena-dynamics.com.

@       IN  A   198.51.100.10
mail    IN  A   198.51.100.20
vpn     IN  A   10.10.10.5
dev     IN  A   10.10.10.10
intranet IN A   10.10.10.15

@       IN  MX  10 mail.cydena-dynamics.com.

@       IN  TXT "v=spf1 include:mail.cydena-dynamics.com -all"
@       IN  TXT "CI Migration: moved from build01.internal"`;

const EMAIL_HEADER_1 = `Return-Path: <ceo@cydena-dynamics.com>
Received: from mail.cydena.local (mail.cydena.local [10.0.0.20])
        by mx.google.com with ESMTP id abc123
        for <external@recipient.com>;
        Tue, 6 Feb 2026 09:15:22 +0000
Received: from workstation-23 (10.0.0.45)
        by mail.cydena.local (Postfix)
        id 4F3A22D2;
        Tue, 6 Feb 2026 09:14:58 +0000
Message-ID: <20260206091458.4F3A22D2@mail.cydena.local>
X-Mailer: Outlook 2016`;

const EMAIL_HEADER_2 = `Return-Path: <ceo@cydena-dynamics.com>
Received: from mail.cydena.local (mail.cydena.local [10.10.10.20])
        by mx.google.com with ESMTP id abc123;
        Tue, 6 Feb 2026 09:15:22 +0000

Received: from build02 (10.10.10.45)
        by mail.cydena.local (Postfix)
        id 8A22D3;
        Tue, 6 Feb 2026 09:14:58 +0000

Message-ID: <20260206091458@mail.cydena.local>`;

interface SubChallenge {
  id: number;
  title: string;
  objective: string;
  documents: { name: string; content: string; icon: string }[];
  flag: string;
  hint: string;
  flagFormat: string;
}

const SUB_CHALLENGES: SubChallenge[] = [
  {
    id: 1,
    title: "WHOIS Intelligence",
    objective: "Analyse the WHOIS record for cydena-dynamics.com. Identify the email prefix used by the technical team — this reveals an operational role that should not be publicly exposed.",
    documents: [{ name: "whois-cydena-dynamics.txt", content: WHOIS_DATA, icon: "🔍" }],
    flag: "FLAG{devops-internal}",
    hint: "Look at the Tech Email field. The local-part before the @ symbol reveals the internal team or function responsible for infrastructure.",
    flagFormat: "FLAG{email-prefix}",
  },
  {
    id: 2,
    title: "DNS Zone Analysis",
    objective: "Examine the DNS zone file for cydena-dynamics.com. Identify a leaked internal hostname referenced in a TXT record that reveals their CI/CD migration history.",
    documents: [{ name: "cydena-dynamics-zone.txt", content: DNS_ZONE_DATA, icon: "🌐" }],
    flag: "FLAG{git.northbridge.local}",
    hint: "TXT records can contain freeform text. Look for a migration note that mentions a previous internal hostname.",
    flagFormat: "FLAG{hostname}",
  },
  {
    id: 3,
    title: "Email Header Analysis I",
    objective: "Analyse the raw email headers. Identify the internal mail server hostname — a hostname using a non-public TLD that appears in the routing path.",
    documents: [{ name: "email_header.txt", content: EMAIL_HEADER_1, icon: "📧" }],
    flag: "FLAG{mail.cydena.local}",
    hint: "A hostname using a non-public TLD appears in the routing path. That internal mail server hostname is what you're looking for.",
    flagFormat: "FLAG{hostname}",
  },
  {
    id: 4,
    title: "Email Header Analysis II",
    objective: "Examine a second email header. Notice the change in internal systems — identify the originating build server's FQDN by combining its hostname with the internal domain suffix.",
    documents: [
      { name: "email_header_v2.txt", content: EMAIL_HEADER_2, icon: "📧" },
      { name: "dns_zone_reference.txt", content: DNS_ZONE_DATA, icon: "🌐" },
    ],
    flag: "FLAG{build02.cydena.local}",
    hint: "Notice the change in internal domain suffix between older and newer systems. What naming pattern is being used now?",
    flagFormat: "FLAG{hostname.domain}",
  },
];

export default function OSINTChallenge({ onComplete }: Props) {
  const [currentTask, setCurrentTask] = useState(0);
  const [solvedTasks, setSolvedTasks] = useState<Set<number>>(new Set());
  const [flagInput, setFlagInput] = useState("");
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [activeDoc, setActiveDoc] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const task = SUB_CHALLENGES[currentTask];
  const allSolved = solvedTasks.size === SUB_CHALLENGES.length;

  useEffect(() => {
    setActiveDoc(0);
    setFlagInput("");
  }, [currentTask]);

  const handleSubmit = () => {
    const trimmed = flagInput.trim();
    if (!trimmed) return;

    const taskAttempts = (attempts[currentTask] || 0) + 1;
    setAttempts((p) => ({ ...p, [currentTask]: taskAttempts }));

    if (trimmed === task.flag) {
      const newSolved = new Set(solvedTasks);
      newSolved.add(currentTask);
      setSolvedTasks(newSolved);
      toast.success(`Task ${currentTask + 1} solved!`, { description: task.flag });
      setFlagInput("");

      if (newSolved.size === SUB_CHALLENGES.length) {
        // Submit the final flag (task 4's flag) to mark challenge complete
        setTimeout(() => onComplete?.(SUB_CHALLENGES[SUB_CHALLENGES.length - 1].flag), 600);
      } else {
        // Auto-advance to next unsolved
        const next = SUB_CHALLENGES.findIndex((_, i) => !newSolved.has(i));
        if (next !== -1) setTimeout(() => setCurrentTask(next), 800);
      }
    } else {
      toast.error("Incorrect flag", {
        description: taskAttempts >= 3 ? "Try using the hint button." : `Attempt ${taskAttempts}`,
      });
      if (taskAttempts >= 3) {
        setShowHint((p) => ({ ...p, [currentTask]: true }));
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Task navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {SUB_CHALLENGES.map((sc, i) => (
          <Button
            key={sc.id}
            variant={currentTask === i ? "default" : solvedTasks.has(i) ? "outline" : "ghost"}
            size="sm"
            className={`gap-1.5 ${solvedTasks.has(i) ? "border-green-500/50 text-green-500" : ""}`}
            onClick={() => setCurrentTask(i)}
          >
            {solvedTasks.has(i) ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <span className="text-xs font-mono">{i + 1}</span>
            )}
            {sc.title}
          </Button>
        ))}
        <Badge variant="secondary" className="ml-auto">
          {solvedTasks.size}/{SUB_CHALLENGES.length} solved
        </Badge>
      </div>

      {/* All solved banner */}
      {allSolved && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-400">All OSINT tasks complete!</p>
          <p className="text-sm text-muted-foreground mt-1">Challenge solved — great reconnaissance work.</p>
        </div>
      )}

      {/* Main content */}
      {!allSolved && (
      <div className="grid md:grid-cols-2 gap-4 min-h-0">
          {/* Document viewer */}
          <Card className="bg-card/50 border-border/50 min-w-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm flex items-center gap-2 shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                  Evidence Documents
                </CardTitle>
                {task.documents.length > 1 && (
                  <div className="flex gap-1 flex-wrap justify-end">
                    {task.documents.map((doc, i) => (
                      <Button
                        key={i}
                        variant={activeDoc === i ? "secondary" : "ghost"}
                        size="sm"
                        className="text-xs h-7 max-w-[160px] truncate"
                        onClick={() => setActiveDoc(i)}
                      >
                        {doc.icon} {doc.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {task.documents.length === 1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {task.documents[0].icon} {task.documents[0].name}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px] rounded-md border border-border/30 bg-black/40 p-1">
                <div className="overflow-x-auto">
                  <pre className="text-xs font-mono text-green-400/90 whitespace-pre p-3 leading-relaxed min-w-max">
                    {task.documents[activeDoc]?.content}
                  </pre>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Task panel */}
          <div className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">
                    Task {currentTask + 1}: {task.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{task.objective}</p>
                <p className="text-xs text-muted-foreground/70">
                  Flag format: <code className="text-primary/80">{task.flagFormat}</code>
                </p>

                {/* Hint */}
                {showHint[currentTask] && (
                  <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <p className="text-yellow-200/90">{task.hint}</p>
                    </div>
                  </div>
                )}

                {!showHint[currentTask] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => setShowHint((p) => ({ ...p, [currentTask]: true }))}
                  >
                    <Eye className="h-3 w-3 mr-1" /> Show hint
                  </Button>
                )}

                {/* Flag input */}
                {!solvedTasks.has(currentTask) ? (
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      placeholder="FLAG{...}"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className="font-mono text-sm bg-background/50"
                    />
                    <Button onClick={handleSubmit} size="sm">
                      Submit
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Solved — {task.flag}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips card */}
            <Card className="bg-card/30 border-border/30">
              <CardContent className="pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> OSINT Methodology
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                    Read every field — admin contacts, TXT records, and routing headers leak operational details
                  </li>
                  <li className="flex items-start gap-1.5">
                    <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                    Private IP ranges (10.x, 172.16-31.x, 192.168.x) indicate internal infrastructure
                  </li>
                  <li className="flex items-start gap-1.5">
                    <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                    Non-public TLDs (.local, .internal) reveal internal hostnames
                  </li>
                  <li className="flex items-start gap-1.5">
                    <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                    Email headers are read bottom-to-top — the lowest "Received" line is closest to the origin
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
