import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Terminal, Send, Lock, Unlock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InjectionJunctionChallengeProps {
  onFlagSubmit?: (flag: string) => void;
  isCompleted?: boolean;
}

const FLAG = 'FLAG{sql_injection_master}';

// Simulated database
const USERS_TABLE = [
  { id: 1, username: 'admin', password: 'sup3rs3cr3t!', role: 'admin' },
  { id: 2, username: 'john_doe', password: 'password123', role: 'user' },
  { id: 3, username: 'jane_smith', password: 'qwerty', role: 'user' },
  { id: 4, username: 'flag_keeper', password: FLAG, role: 'system' },
];

interface QueryResult {
  success: boolean;
  message: string;
  data?: Array<Record<string, string | number>>;
  query?: string;
  vulnerable?: boolean;
}

// Simulated "security" filter - blocks common patterns but has bypasses
const applyFilter = (input: string): { filtered: string; blocked: boolean; reason?: string } => {
  const original = input;
  
  // Block list of common injection keywords (case insensitive)
  const blockedPatterns = [
    { pattern: /\bOR\b/i, name: "OR keyword" },
    { pattern: /\bAND\b/i, name: "AND keyword" },
    { pattern: /--/, name: "SQL comment" },
    { pattern: /;/, name: "semicolon" },
    { pattern: /\bDROP\b/i, name: "DROP keyword" },
    { pattern: /\bDELETE\b/i, name: "DELETE keyword" },
  ];
  
  for (const { pattern, name } of blockedPatterns) {
    if (pattern.test(input)) {
      return { filtered: input, blocked: true, reason: `Blocked: ${name} detected` };
    }
  }
  
  return { filtered: input, blocked: false };
};

const executeQuery = (username: string, password: string): QueryResult => {
  // Apply "security" filter first
  const usernameFilter = applyFilter(username);
  const passwordFilter = applyFilter(password);
  
  if (usernameFilter.blocked || passwordFilter.blocked) {
    const reason = usernameFilter.reason || passwordFilter.reason;
    return {
      success: false,
      message: `🛡️ Input blocked by WAF: ${reason}`,
      query: `-- Query blocked before execution --`,
      vulnerable: false,
    };
  }
  
  // Simulate vulnerable SQL query (filter passed!)
  const simulatedQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  // Advanced injection patterns that bypass the simple filter
  // These work because they don't use blocked keywords
  const bypassPatterns = [
    // Using || instead of OR (works in some SQL dialects)
    /'\s*\|\|\s*['"]?1['"]?\s*=\s*['"]?1/,
    // Using 1=1 without OR by closing the quote early
    /^[^']*'\s*=\s*'\s*$/,
    // UNION bypass - filter doesn't block UNION!
    /'\s*UNION\s+SELECT/i,
    // Using != or <> for always-true conditions
    /'\s*!=\s*'/,
    // Boolean-based: admin'--  (but -- is blocked, so need alternative)
    // Using # comment (MySQL style)
    /#/,
    // Null byte injection concept
    /'\s*UNION\s+ALL\s+SELECT/i,
  ];
  
  // Check for successful bypasses
  const hasValidBypass = bypassPatterns.some(pattern => 
    pattern.test(username) || pattern.test(password)
  );
  
  // Special case: closing quote technique ' = '
  const closeQuoteTechnique = (username.includes("'") && username.endsWith("' ")) || 
                               (password.includes("'") && password.trim() === "' = '");
  
  // Special case: UNION SELECT (not blocked!)
  const unionBypass = /UNION\s+SELECT/i.test(username) || /UNION\s+SELECT/i.test(password);
  
  if (hasValidBypass || closeQuoteTechnique || unionBypass) {
    return {
      success: true,
      message: '⚠️ Filter bypassed! SQL Injection successful!',
      data: USERS_TABLE.map(u => ({ 
        id: u.id, 
        username: u.username, 
        password: u.password, 
        role: u.role 
      })),
      query: simulatedQuery,
      vulnerable: true,
    };
  }

  // Normal query - check credentials
  const user = USERS_TABLE.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    return {
      success: true,
      message: '✅ Login successful!',
      data: [{ id: user.id, username: user.username, role: user.role }],
      query: simulatedQuery,
      vulnerable: false,
    };
  }

  return {
    success: false,
    message: '❌ Invalid username or password.',
    query: simulatedQuery,
    vulnerable: false,
  };
};

export const InjectionJunctionChallenge: React.FC<InjectionJunctionChallengeProps> = ({ 
  isCompleted = false 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [showHint, setShowHint] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hints = [
    "💡 Hint 1: This app has a WAF (Web Application Firewall) that blocks common keywords...",
    "💡 Hint 2: The filter blocks OR, AND, --, and ; but what about UNION?",
    "💡 Hint 3: Try: ' UNION SELECT * FROM users -- (MySQL comment # also works!)",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [queryHistory]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() && !password.trim()) return;

    const result = executeQuery(username, password);
    setQueryHistory(prev => [...prev, result]);
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    setQueryHistory([]);
    setShowHint(0);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Login Portal
          </TabsTrigger>
          <TabsTrigger value="console" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            SQL Console
          </TabsTrigger>
        </TabsList>

        {/* Login Portal Tab */}
        <TabsContent value="login" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">SecureBank™ Login</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enterprise Banking Portal v1.0
              </p>
              <Badge variant="destructive" className="mt-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Vulnerable Demo
              </Badge>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username..."
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="text" // Intentionally text to show injection
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Unlock className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </form>

              {/* Last Result */}
              {queryHistory.length > 0 && (
                <div className="mt-4 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    {queryHistory[queryHistory.length - 1].vulnerable ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : queryHistory[queryHistory.length - 1].success ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-medium">
                      {queryHistory[queryHistory.length - 1].message}
                    </span>
                  </div>
                  {queryHistory[queryHistory.length - 1].data && (
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-xs font-mono">
                        <thead>
                          <tr className="border-b border-border">
                            {Object.keys(queryHistory[queryHistory.length - 1].data![0]).map(key => (
                              <th key={key} className="text-left p-1 text-muted-foreground">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryHistory[queryHistory.length - 1].data!.map((row, idx) => (
                            <tr key={idx} className="border-b border-border/50">
                              {Object.values(row).map((val, vidx) => (
                                <td key={vidx} className={cn(
                                  "p-1",
                                  String(val).includes('FLAG{') && "text-green-500 font-bold"
                                )}>
                                  {String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Hints */}
              <div className="mt-4 space-y-2">
                {hints.slice(0, showHint).map((hint, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                    {hint}
                  </div>
                ))}
                {showHint < hints.length && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowHint(prev => prev + 1)}
                  >
                    🔍 Show Hint {showHint + 1}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SQL Console Tab */}
        <TabsContent value="console" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">SQL Query Log</CardTitle>
                <Badge variant="outline" className="ml-auto text-xs">
                  {queryHistory.length} queries
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px]" ref={scrollRef}>
                <div className="p-4 space-y-3 font-mono text-sm">
                  {queryHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No queries executed yet.</p>
                      <p className="text-xs mt-1">Try logging in to see the SQL queries!</p>
                    </div>
                  ) : (
                    queryHistory.map((result, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg border",
                          result.vulnerable
                            ? "border-amber-500/50 bg-amber-500/10"
                            : result.success
                            ? "border-green-500/50 bg-green-500/10"
                            : "border-destructive/50 bg-destructive/10"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px]">
                            Query #{idx + 1}
                          </Badge>
                          {result.vulnerable && (
                            <Badge variant="destructive" className="text-[10px]">
                              VULNERABLE
                            </Badge>
                          )}
                        </div>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                          {result.query}
                        </pre>
                        <div className="mt-2 text-xs">
                          {result.message}
                        </div>
                        {result.data && result.vulnerable && (
                          <div className="mt-2 p-2 bg-background/50 rounded text-xs">
                            <div className="text-green-500 font-bold mb-1">
                              📊 Dumped {result.data.length} rows:
                            </div>
                            {result.data.map((row, ridx) => (
                              <div key={ridx} className={cn(
                                "py-0.5",
                                String(row.password).includes('FLAG{') && "text-green-500 font-bold"
                              )}>
                                {JSON.stringify(row)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Educational Footer */}
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          🎓 <strong>SQL Injection</strong>: A code injection technique that exploits security vulnerabilities in an application's database layer.
        </p>
        {!isCompleted && (
          <p className="text-sm text-muted-foreground">
            💡 Find the flag hidden in the database, then submit it below
          </p>
        )}
      </div>
    </div>
  );
};

export default InjectionJunctionChallenge;
