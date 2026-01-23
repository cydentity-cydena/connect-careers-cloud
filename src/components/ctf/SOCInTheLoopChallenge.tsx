import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Terminal, 
  Brain, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Shield,
  Activity,
  Eye
} from "lucide-react";

interface SOCInTheLoopChallengeProps {
  onComplete: (flag: string) => void;
}

const ACCESS_LOG = `192.168.1.10 - - [22/Jan/2026:10:15:01 +0000] "GET /index HTTP/1.1" 200 5123 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
192.168.1.11 - - [22/Jan/2026:10:15:05 +0000] "GET /index.html HTTP/1.1" 200 4987 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"

203.0.113.45 - - [22/Jan/2026:10:16:12 +0000] "POST /login HTTP/1.1" 302 721 "https://example.com/index" "Mozilla/5.0 (X11; Linux x86_64)"
203.0.113.45 - - [22/Jan/2026:10:16:12 +0000] "POST /login HTTP/1.1" 401 889 "-" "Mozilla/5.0 (X11; Linux x86_64)"
POST_DATA: username=admin&password=admin123

198.51.100.23 - - [22/Jan/2026:10:17:44 +0000] "GET /index.php?id=1 HTTP/1.1" 200 5341 "-" "Mozilla/5.0"

198.51.100.23 - - [22/Jan/2026:10:18:02 +0000] "GET /index.php?id=1%20OR%201=1 HTTP/1.1" 403 5409 "-" "Mozilla/5.0"

198.51.100.99 - - [22/Jan/2026:10:18:45 +0000] "GET /index.php?id=1%27%20OR%20%271%27=%271 HTTP/1.1" 404 1024 "-" "Mozilla/5.0"

203.0.115.36 - - [22/Jan/2026:10:19:59 +0000] "POST /search HTTP/1.1" 500 4210 "-" "curl/7.88.1"
POST_DATA: query=' OR '1'='1';--

203.0.113.77 - - [22/Jan/2026:10:20:32 +0000] "POST /login HTTP/1.1" 200 912 "-" "Mozilla/5.0 (X11; Linux x86_64)"
POST_DATA: username=admin' OR '1'='1--&password=test

203.0.113.77 - - [22/Jan/2026:10:21:11 +0000] "POST /login HTTP/1.1" 403 912 "-" "Mozilla/5.0 (X11; Linux x86_64)"
POST_DATA: username=admin&password=admin123

192.168.1.12 - - [22/Jan/2026:10:22:15 +0000] "GET /index HTTP/1.1" 500 5102 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"

198.51.100.88 - - [22/Jan/2026:10:22:41 +0000] "GET /index.php?id=1 UNION SELECT username,password FROM users HTTP/1.1" 200 2048 "-" "Mozilla/5.0"`;

const AI_SUMMARY = `╔══════════════════════════════════════════════════════════════════╗
║                    AI SOC ANALYSIS REPORT                        ║
║                    Generated: 22/Jan/2026 10:30 UTC              ║
╚══════════════════════════════════════════════════════════════════╝

[!] THREAT DETECTION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  HIGH CONFIDENCE: Union-Based SQL Injection Detected
    Source IP: 198.51.100.88
    Target: /index.php
    Pattern: UNION SELECT statement in GET parameter
    Recommendation: Block IP and patch vulnerable endpoint

⚠️  MEDIUM CONFIDENCE: Basic SQLi Attempts
    Source IPs: 198.51.100.23, 198.51.100.99
    Pattern: OR-based injection in URL parameters
    Status: Blocked by WAF (403/404 responses)

ℹ️  LOW PRIORITY: Failed login attempts detected
    Multiple IPs showing credential stuffing patterns
    Recommendation: Monitor but no immediate action

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AI Analysis Complete - Review GET requests for indicators]`;

const FLAG = "FLAG{ai_guided_but_human_verified}";

// Known IPs in the logs for validation
const KNOWN_IPS = [
  "192.168.1.7",   // Example from help
  "192.168.1.10",
  "192.168.1.11",
  "192.168.1.12",
  "203.0.113.45",
  "198.51.100.23",
  "198.51.100.99",
  "203.0.115.36",
  "203.0.113.77",  // CORRECT ANSWER
  "198.51.100.88",
];

const CORRECT_IP = "203.0.113.77";

export function SOCInTheLoopChallenge({ onComplete }: SOCInTheLoopChallengeProps) {
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'input' | 'output' | 'error' | 'success'; content: string }>>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Show initial header
    setTerminalHistory([
      { type: 'output', content: '╔══════════════════════════════════════════════════════════════╗' },
      { type: 'output', content: '║          SOC IN THE LOOP - THREAT HUNTING EXERCISE          ║' },
      { type: 'output', content: '║                   Advanced Challenge (250 pts)               ║' },
      { type: 'output', content: '╚══════════════════════════════════════════════════════════════╝' },
      { type: 'output', content: '' },
      { type: 'output', content: '🎯 MISSION: Find the REAL attack in the access logs.' },
      { type: 'output', content: '' },
      { type: 'output', content: '⚠️  WARNING: The AI SOC assistant may provide misleading guidance.' },
      { type: 'output', content: '    Critical thinking and manual analysis are required.' },
      { type: 'output', content: '' },
      { type: 'output', content: 'TASK:' },
      { type: 'output', content: '  1) Review the AI summary (cat ai_summary.txt)' },
      { type: 'output', content: '  2) Examine the access logs (cat access.log)' },
      { type: 'output', content: '  3) Identify the SUCCESSFUL attack (not blocked ones)' },
      { type: 'output', content: '  4) Submit the attacker\'s IP address' },
      { type: 'output', content: '' },
      { type: 'output', content: 'Commands: cat ai_summary.txt | cat access.log | help | clear' },
      { type: 'output', content: 'Submit answer: Type the attacker\'s IP address directly' },
      { type: 'output', content: '' },
    ]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const addOutput = (content: string, type: 'input' | 'output' | 'error' | 'success' = 'output') => {
    setTerminalHistory(prev => [...prev, { type, content }]);
  };

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addOutput(`soc@analyst:~$ ${trimmed}`, 'input');

    const lower = trimmed.toLowerCase();

    // Exit commands
    if (lower === 'exit' || lower === 'quit') {
      addOutput('Session terminated.');
      return;
    }

    // Help command
    if (lower === 'help') {
      addOutput('');
      addOutput('╔══════════════════════════════════════════════════════════════╗');
      addOutput('║                        HELP MENU                             ║');
      addOutput('╚══════════════════════════════════════════════════════════════╝');
      addOutput('');
      addOutput('Available commands:');
      addOutput('  cat ai_summary.txt  - View AI SOC analysis report');
      addOutput('  cat access.log      - View web server access logs');
      addOutput('  clear               - Clear terminal screen');
      addOutput('  help                - Show this help menu');
      addOutput('');
      addOutput('To submit your answer:');
      addOutput('  Type the attacker\'s IP address directly (e.g., 192.168.1.7)');
      addOutput('');
      addOutput('💡 TIP: Look for SUCCESSFUL attacks (HTTP 200), not blocked ones.');
      addOutput('');
      return;
    }

    // Clear command
    if (lower === 'clear') {
      setTerminalHistory([]);
      return;
    }

    // Cat AI summary
    if (lower === 'cat ai_summary.txt') {
      addOutput('');
      AI_SUMMARY.split('\n').forEach(line => addOutput(line));
      addOutput('');
      return;
    }

    // Cat access log
    if (lower === 'cat access.log') {
      addOutput('');
      addOutput('=== ACCESS LOG - /var/log/httpd/access.log ===');
      addOutput('');
      ACCESS_LOG.split('\n').forEach(line => {
        // Highlight suspicious lines
        if (line.includes('POST_DATA:')) {
          addOutput(`  ${line}`);
        } else {
          addOutput(line);
        }
      });
      addOutput('');
      addOutput('=== END OF LOG ===');
      addOutput('');
      return;
    }

    // Check if it's an IP address submission
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipRegex.test(trimmed)) {
      setAttempts(prev => prev + 1);
      
      if (trimmed === CORRECT_IP) {
        setSolved(true);
        addOutput('');
        addOutput('╔══════════════════════════════════════════════════════════════╗', 'success');
        addOutput('║                    🎉 CORRECT! 🎉                            ║', 'success');
        addOutput('╚══════════════════════════════════════════════════════════════╝', 'success');
        addOutput('', 'success');
        addOutput(`FLAG: ${FLAG}`, 'success');
        addOutput('', 'success');
        addOutput('ANALYSIS:', 'success');
        addOutput('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
        addOutput('The AI incorrectly flagged 198.51.100.88 (UNION SELECT) as the', 'success');
        addOutput('primary threat. However, that request returned HTTP 200 with data', 'success');
        addOutput('which could suggest the server responded, but examining the', 'success');
        addOutput('POST requests reveals the REAL successful attack:', 'success');
        addOutput('', 'success');
        addOutput('  203.0.113.77 sent a Boolean-based SQLi in the login POST:', 'success');
        addOutput('  username=admin\' OR \'1\'=\'1-- → HTTP 200 (SUCCESS!)', 'success');
        addOutput('', 'success');
        addOutput('The AI focused on GET requests and missed the POST payload.', 'success');
        addOutput('This demonstrates why human verification is critical in SOC work.', 'success');
        addOutput('', 'success');
        
        onComplete(FLAG);
        return;
      }
      
      // Wrong IP but known in logs
      if (KNOWN_IPS.includes(trimmed)) {
        addOutput('', 'error');
        addOutput('❌ Incorrect IP address.', 'error');
        addOutput('', 'error');
        
        // Provide targeted hints based on which IP they guessed
        if (trimmed === "198.51.100.88") {
          addOutput('💡 Hint: The AI flagged this as UNION-based SQLi, but did the', 'output');
          addOutput('   attack actually SUCCEED? Check HTTP response codes carefully.', 'output');
          addOutput('   Also, look at POST payloads, not just GET requests.', 'output');
        } else if (trimmed === "198.51.100.23" || trimmed === "198.51.100.99") {
          addOutput('💡 Hint: These attempts received 403/404 responses.', 'output');
          addOutput('   A SUCCESSFUL attack would return HTTP 200.', 'output');
          addOutput('   Check POST payloads for successful injection.', 'output');
        } else if (trimmed === "203.0.115.36") {
          addOutput('💡 Hint: This request returned HTTP 500 (server error).', 'output');
          addOutput('   The attack caused an error, not a successful bypass.', 'output');
          addOutput('   Look for HTTP 200 responses with suspicious payloads.', 'output');
        } else {
          addOutput('💡 Hint: Check POST payloads for anomalies.', 'output');
          addOutput('   Focus on requests that returned HTTP 200 (success).', 'output');
        }
        addOutput('', 'output');
        return;
      }
      
      // Unknown IP
      addOutput('', 'error');
      addOutput('❌ IP not found in access logs. Try again.', 'error');
      addOutput('', 'error');
      return;
    }

    // Unknown command
    addOutput('', 'error');
    addOutput(`Command not recognized: ${trimmed}`, 'error');
    addOutput('Type \'help\' for available commands.', 'error');
    addOutput('', 'error');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCommand(currentInput);
    setCurrentInput("");
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Challenge Header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
        <Shield className="h-8 w-8 text-red-400" />
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            SOC In The Loop
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Advanced</Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-assisted threat hunting with a twist — the AI isn't always right.
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
          <Brain className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">AI Analysis</p>
          <p className="text-sm font-medium">Available</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Trust Level</p>
          <p className="text-sm font-medium">Verify!</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-center">
          <Activity className="h-5 w-5 text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Attempts</p>
          <p className="text-sm font-medium">{attempts}</p>
        </div>
      </div>

      {/* Terminal */}
      <Card className="bg-black border-green-500/30">
        <CardHeader className="py-2 px-4 border-b border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-green-400" />
            <span className="text-sm font-mono text-green-400">SOC Analyst Terminal</span>
            <div className="flex-1" />
            {solved && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Solved
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea 
            className="h-80 p-4 font-mono text-sm cursor-text"
            ref={terminalRef}
            onClick={handleTerminalClick}
          >
            {terminalHistory.map((entry, i) => (
              <div 
                key={i} 
                className={`whitespace-pre-wrap ${
                  entry.type === 'input' ? 'text-cyan-400' :
                  entry.type === 'error' ? 'text-red-400' :
                  entry.type === 'success' ? 'text-green-400' :
                  'text-gray-300'
                }`}
              >
                {entry.content}
              </div>
            ))}
            
            {!solved && (
              <form onSubmit={handleSubmit} className="flex items-center mt-2">
                <span className="text-cyan-400">soc@analyst:~$ </span>
                <Input
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="flex-1 bg-transparent border-none text-gray-300 font-mono p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder=""
                  autoFocus
                />
              </form>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <div className="p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium">Quick Reference</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div><code className="text-primary">cat ai_summary.txt</code> — AI report</div>
          <div><code className="text-primary">cat access.log</code> — Server logs</div>
          <div><code className="text-primary">help</code> — Show commands</div>
          <div><code className="text-primary">clear</code> — Clear screen</div>
        </div>
      </div>
    </div>
  );
}
