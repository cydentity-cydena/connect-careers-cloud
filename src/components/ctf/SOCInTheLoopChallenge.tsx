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

const ACCESS_LOG = `# Server: web-prod-01 | Log period: 22/Jan/2026 10:00-11:00 UTC
# Format: IP - - [timestamp] "request" status size "referer" "user-agent"

192.168.1.10 - - [22/Jan/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 5123 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.11 - - [22/Jan/2026:10:00:02 +0000] "GET /static/css/main.css HTTP/1.1" 200 12847 "https://corp.example.com/" "Mozilla/5.0"
192.168.1.11 - - [22/Jan/2026:10:00:02 +0000] "GET /static/js/app.js HTTP/1.1" 200 89234 "https://corp.example.com/" "Mozilla/5.0"
10.0.0.5 - - [22/Jan/2026:10:00:05 +0000] "GET /healthcheck HTTP/1.1" 200 15 "-" "ELB-HealthChecker/2.0"
192.168.1.12 - - [22/Jan/2026:10:00:08 +0000] "GET /api/v1/users/me HTTP/1.1" 401 89 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X)"
192.168.1.12 - - [22/Jan/2026:10:00:09 +0000] "POST /api/v1/auth/login HTTP/1.1" 200 1247 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X)"
POST_DATA: username=jsmith&password=********

# Automated scanner noise begins
198.51.100.23 - - [22/Jan/2026:10:05:12 +0000] "GET /admin HTTP/1.1" 403 512 "-" "Mozilla/5.0"
198.51.100.23 - - [22/Jan/2026:10:05:13 +0000] "GET /wp-admin HTTP/1.1" 404 0 "-" "Mozilla/5.0"
198.51.100.23 - - [22/Jan/2026:10:05:13 +0000] "GET /phpmyadmin HTTP/1.1" 404 0 "-" "Mozilla/5.0"
198.51.100.23 - - [22/Jan/2026:10:05:14 +0000] "GET /.env HTTP/1.1" 403 0 "-" "Mozilla/5.0"
198.51.100.23 - - [22/Jan/2026:10:05:15 +0000] "GET /config.php HTTP/1.1" 404 0 "-" "Mozilla/5.0"

# Normal user activity
192.168.1.15 - - [22/Jan/2026:10:06:22 +0000] "GET /dashboard HTTP/1.1" 200 8934 "-" "Mozilla/5.0 (Windows NT 10.0)"
192.168.1.15 - - [22/Jan/2026:10:06:45 +0000] "POST /api/v1/reports/generate HTTP/1.1" 202 156 "-" "Mozilla/5.0"
10.0.0.5 - - [22/Jan/2026:10:07:00 +0000] "GET /healthcheck HTTP/1.1" 200 15 "-" "ELB-HealthChecker/2.0"

# SQLi attempts - GET based (noisy, obvious)
198.51.100.88 - - [22/Jan/2026:10:10:01 +0000] "GET /products?id=1 HTTP/1.1" 200 2341 "-" "sqlmap/1.7"
198.51.100.88 - - [22/Jan/2026:10:10:02 +0000] "GET /products?id=1' HTTP/1.1" 500 1024 "-" "sqlmap/1.7"
198.51.100.88 - - [22/Jan/2026:10:10:03 +0000] "GET /products?id=1%20AND%201=1 HTTP/1.1" 403 512 "-" "sqlmap/1.7"
198.51.100.88 - - [22/Jan/2026:10:10:04 +0000] "GET /products?id=1%20UNION%20SELECT%20NULL HTTP/1.1" 403 512 "-" "sqlmap/1.7"
198.51.100.88 - - [22/Jan/2026:10:10:05 +0000] "GET /products?id=1%20UNION%20SELECT%20username,password%20FROM%20users HTTP/1.1" 403 512 "-" "sqlmap/1.7"
198.51.100.88 - - [22/Jan/2026:10:10:06 +0000] "GET /products?id=1;DROP%20TABLE%20users HTTP/1.1" 403 512 "-" "sqlmap/1.7"

# More normal traffic
192.168.1.20 - - [22/Jan/2026:10:12:00 +0000] "GET /api/v1/notifications HTTP/1.1" 200 456 "-" "Mozilla/5.0"
192.168.1.21 - - [22/Jan/2026:10:12:15 +0000] "POST /api/v1/messages HTTP/1.1" 201 89 "-" "Mozilla/5.0"
10.0.0.5 - - [22/Jan/2026:10:14:00 +0000] "GET /healthcheck HTTP/1.1" 200 15 "-" "ELB-HealthChecker/2.0"

# Credential stuffing attempt
203.0.113.45 - - [22/Jan/2026:10:15:01 +0000] "POST /api/v1/auth/login HTTP/1.1" 401 89 "-" "python-requests/2.28.0"
POST_DATA: username=admin&password=admin123
203.0.113.45 - - [22/Jan/2026:10:15:02 +0000] "POST /api/v1/auth/login HTTP/1.1" 401 89 "-" "python-requests/2.28.0"
POST_DATA: username=admin&password=password
203.0.113.45 - - [22/Jan/2026:10:15:03 +0000] "POST /api/v1/auth/login HTTP/1.1" 401 89 "-" "python-requests/2.28.0"
POST_DATA: username=admin&password=123456
203.0.113.45 - - [22/Jan/2026:10:15:04 +0000] "POST /api/v1/auth/login HTTP/1.1" 429 56 "-" "python-requests/2.28.0"

# More scanner activity
198.51.100.99 - - [22/Jan/2026:10:18:22 +0000] "GET /api/v1/users?id=1%27%20OR%20%271%27=%271 HTTP/1.1" 403 512 "-" "Nikto/2.1.6"
198.51.100.99 - - [22/Jan/2026:10:18:23 +0000] "GET /api/v1/users?id=1%22%20OR%20%221%22=%221 HTTP/1.1" 403 512 "-" "Nikto/2.1.6"
198.51.100.99 - - [22/Jan/2026:10:18:24 +0000] "GET /api/v1/users?id=1%20AND%20SLEEP(5) HTTP/1.1" 403 512 "-" "Nikto/2.1.6"

# XSS attempts
203.0.115.36 - - [22/Jan/2026:10:20:01 +0000] "GET /search?q=<script>alert(1)</script> HTTP/1.1" 403 512 "-" "Mozilla/5.0"
203.0.115.36 - - [22/Jan/2026:10:20:02 +0000] "GET /search?q=%3Cscript%3Ealert(document.cookie)%3C/script%3E HTTP/1.1" 403 512 "-" "Mozilla/5.0"
203.0.115.36 - - [22/Jan/2026:10:20:03 +0000] "POST /api/v1/comments HTTP/1.1" 400 128 "-" "Mozilla/5.0"
POST_DATA: body=<img src=x onerror=alert(1)>

# Normal authenticated user session
192.168.1.30 - - [22/Jan/2026:10:21:00 +0000] "GET /dashboard HTTP/1.1" 200 8934 "-" "Mozilla/5.0"
192.168.1.30 - - [22/Jan/2026:10:21:15 +0000] "GET /api/v1/analytics HTTP/1.1" 200 15678 "-" "Mozilla/5.0"
10.0.0.5 - - [22/Jan/2026:10:21:00 +0000] "GET /healthcheck HTTP/1.1" 200 15 "-" "ELB-HealthChecker/2.0"

# *** THE REAL ATTACK - subtle, blends with normal traffic ***
203.0.113.77 - - [22/Jan/2026:10:22:44 +0000] "GET /api/v1/auth/check HTTP/1.1" 200 45 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
203.0.113.77 - - [22/Jan/2026:10:22:45 +0000] "POST /api/v1/auth/login HTTP/1.1" 200 1893 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
POST_DATA: username=admin'/*&password=*/OR/**/1=1--+-

# More noise after the attack
192.168.1.31 - - [22/Jan/2026:10:23:00 +0000] "GET /api/v1/settings HTTP/1.1" 200 2341 "-" "Mozilla/5.0"
198.51.100.88 - - [22/Jan/2026:10:23:15 +0000] "GET /products?id=1%20UNION%20ALL%20SELECT%201,2,3 HTTP/1.1" 403 512 "-" "sqlmap/1.7"
198.51.100.88 - - [22/Jan/2026:10:23:16 +0000] "GET /products?id=-1%20UNION%20SELECT%20@@version HTTP/1.1" 403 512 "-" "sqlmap/1.7"
10.0.0.5 - - [22/Jan/2026:10:28:00 +0000] "GET /healthcheck HTTP/1.1" 200 15 "-" "ELB-HealthChecker/2.0"

# Directory traversal attempts
45.33.32.156 - - [22/Jan/2026:10:30:01 +0000] "GET /static/../../../etc/passwd HTTP/1.1" 400 0 "-" "curl/7.88.1"
45.33.32.156 - - [22/Jan/2026:10:30:02 +0000] "GET /api/v1/files?path=....//....//etc/passwd HTTP/1.1" 403 512 "-" "curl/7.88.1"

# SSRF attempt
172.16.0.50 - - [22/Jan/2026:10:35:00 +0000] "GET /api/v1/fetch?url=http://169.254.169.254/latest/meta-data/ HTTP/1.1" 403 512 "-" "Mozilla/5.0"

# Late credential stuffing
203.0.113.45 - - [22/Jan/2026:10:40:01 +0000] "POST /api/v1/auth/login HTTP/1.1" 401 89 "-" "python-requests/2.28.0"
POST_DATA: username=root&password=toor

# End of log segment`;

const AI_SUMMARY = `╔══════════════════════════════════════════════════════════════════╗
║                    AI SOC ANALYSIS REPORT v2.4.1                 ║
║               Generated: 22/Jan/2026 11:00:05 UTC                ║
║                    Confidence Model: GPT-SOC-4                   ║
╚══════════════════════════════════════════════════════════════════╝

[EXECUTIVE SUMMARY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total events analyzed: 847
Suspicious events: 23
Blocked by WAF: 19
Requires investigation: 4

[!] CRITICAL THREAT DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 PRIORITY 1: Automated SQL Injection Campaign
   Source IP: 198.51.100.88
   Tool Signature: sqlmap/1.7 (confirmed)
   Attack Vector: UNION-based blind SQLi
   Targets: /products endpoint
   Total Attempts: 12
   Status: BLOCKED by WAF rules
   
   Evidence:
   - Multiple UNION SELECT payloads detected
   - Systematic parameter fuzzing observed
   - Tool fingerprint matches known attack framework
   
   RECOMMENDATION: Add IP to permanent blocklist
   RISK LEVEL: HIGH (automated attack tool)

[!] HIGH PRIORITY THREATS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟠 PRIORITY 2: Secondary SQLi Scanner
   Source IP: 198.51.100.99
   Tool Signature: Nikto/2.1.6
   Status: All attempts blocked (403)
   
🟠 PRIORITY 3: XSS Probing
   Source IP: 203.0.115.36
   Pattern: Script injection attempts
   Status: Blocked by input validation

🟡 PRIORITY 4: Credential Stuffing
   Source IP: 203.0.113.45
   Pattern: Automated login attempts
   Status: Rate limited (429)

[ℹ] LOW PRIORITY / INFORMATIONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Directory enumeration from 198.51.100.23 - common scanner noise
• Path traversal attempts from 45.33.32.156 - blocked
• SSRF probe from 172.16.0.50 - blocked
• Normal authentication activity observed from internal IPs

[✓] AUTOMATED RESPONSE ACTIONS TAKEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• WAF rules triggered: 19 blocks
• Rate limiting activated for 203.0.113.45
• Alert sent to security team for 198.51.100.88

[CONCLUSION]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary threat actor identified as 198.51.100.88 running sqlmap.
All injection attempts were successfully blocked by WAF.
No evidence of successful compromise detected.
System integrity: MAINTAINED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AI Analysis Complete - Recommended Action: Monitor and blocklist]
[Model confidence: 94.7%]`;

const FLAG = "FLAG{ai_guided_but_human_verified}";

// Known IPs in the logs for validation
const KNOWN_IPS = [
  "192.168.1.10",
  "192.168.1.11",
  "192.168.1.12",
  "192.168.1.15",
  "192.168.1.20",
  "192.168.1.21",
  "192.168.1.30",
  "192.168.1.31",
  "10.0.0.5",       // Health checker
  "198.51.100.23",  // Scanner
  "198.51.100.88",  // SQLmap - AI flags this
  "198.51.100.99",  // Nikto
  "203.0.113.45",   // Credential stuffing
  "203.0.115.36",   // XSS attempts
  "203.0.113.77",   // CORRECT ANSWER - subtle SQLi
  "45.33.32.156",   // Path traversal
  "172.16.0.50",    // SSRF
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
      { type: 'output', content: '┌─────────────────────────────────────────────────────────────┐' },
      { type: 'output', content: '│  🎯 OBJECTIVE: Identify the attacker\'s IP address and      │' },
      { type: 'output', content: '│     type it below to capture the flag.                      │' },
      { type: 'output', content: '│                                                             │' },
      { type: 'output', content: '│  Example: 192.168.1.1  (then press Enter)                   │' },
      { type: 'output', content: '└─────────────────────────────────────────────────────────────┘' },
      { type: 'output', content: '' },
      { type: 'output', content: '⚠️  WARNING: Your AI SOC assistant has analyzed these logs.' },
      { type: 'output', content: '    However, AI can be fooled — verify findings manually!' },
      { type: 'output', content: '' },
      { type: 'output', content: 'HOW TO SOLVE:' },
      { type: 'output', content: '  1. cat ai_summary.txt  → Read the AI\'s threat analysis' },
      { type: 'output', content: '  2. cat access.log      → Examine the raw server logs' },
      { type: 'output', content: '  3. Find the SUCCESSFUL attack (look for HTTP 200 responses)' },
      { type: 'output', content: '  4. Type the attacker\'s IP address and press Enter' },
      { type: 'output', content: '' },
      { type: 'output', content: '💡 Hint: Blocked attacks (403/404/500) are NOT successful.' },
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
        addOutput('The AI flagged 198.51.100.88 (sqlmap) as the primary threat,', 'success');
        addOutput('but ALL those attempts were blocked by the WAF (403 responses).', 'success');
        addOutput('', 'success');
        addOutput('The REAL attack was subtle - hidden in normal-looking traffic:', 'success');
        addOutput('  203.0.113.77 used comment-based SQLi obfuscation:', 'success');
        addOutput('  username=admin\'/*&password=*/OR/**/1=1--+- → HTTP 200', 'success');
        addOutput('', 'success');
        addOutput('The AI missed this because:', 'success');
        addOutput('  • The attacker used a legitimate browser user-agent', 'success');
        addOutput('  • The payload used MySQL comments to evade detection', 'success');
        addOutput('  • It blended with normal POST authentication traffic', 'success');
        addOutput('', 'success');
        addOutput('LESSON: AI can be fooled by noise. Always verify raw logs.', 'success');
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
          addOutput('💡 The AI flagged this IP as running sqlmap...', 'output');
          addOutput('   But check the HTTP response codes. Were any successful?', 'output');
          addOutput('   403 = blocked. Look for requests that returned 200.', 'output');
        } else if (trimmed === "198.51.100.23" || trimmed === "198.51.100.99") {
          addOutput('💡 These are automated scanners (check the user-agent).', 'output');
          addOutput('   All their requests were blocked by the WAF.', 'output');
          addOutput('   The real attacker would blend in better.', 'output');
        } else if (trimmed === "203.0.115.36") {
          addOutput('💡 XSS attempts - but all blocked (403/400).', 'output');
          addOutput('   Look for attacks that actually succeeded.', 'output');
        } else if (trimmed === "203.0.113.45") {
          addOutput('💡 Credential stuffing - but all attempts failed (401/429).', 'output');
          addOutput('   The attacker you\'re looking for bypassed auth entirely.', 'output');
        } else if (trimmed === "45.33.32.156" || trimmed === "172.16.0.50") {
          addOutput('💡 This is recon/probing activity - all blocked.', 'output');
          addOutput('   Focus on authentication endpoints with HTTP 200.', 'output');
        } else if (trimmed.startsWith("192.168.") || trimmed === "10.0.0.5") {
          addOutput('💡 This is internal/legitimate traffic.', 'output');
          addOutput('   Look for external IPs with suspicious POST payloads.', 'output');
        } else {
          addOutput('💡 Check POST payloads carefully for SQL syntax.', 'output');
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
