import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Globe, Send, Code, RefreshCw, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface CuriousWebChallengeProps {
  onFlagSubmit?: (flag: string) => void;
  isCompleted?: boolean;
}

const FLAG = 'FLAG{ai_was_trying_to_distract_you}';

// Simulated web pages
const PAGES: Record<string, { title: string; content: React.ReactNode; source: string }> = {
  '/': {
    title: 'The Curious Web',
    content: (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to The Curious Web</h1>
        <p className="text-muted-foreground">This is a demo portal for web analysis apprentices.</p>
      </div>
    ),
    source: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>The Curious Web</title>
</head>
<body>
    <h1>Welcome to The Curious Web</h1>
    <p>This is a demo portal for web analysis apprentices.</p>
    <!-- Maybe check /robots.txt or something the admin forgot? -->
</body>
</html>`
  },
  '/robots.txt': {
    title: 'robots.txt',
    content: (
      <pre className="font-mono text-sm bg-muted p-4 rounded text-left">
{`User-agent: *
Disallow: /admin
Disallow: /backup/`}
      </pre>
    ),
    source: `User-agent: *
Disallow: /admin
Disallow: /backup/`
  },
  '/admin': {
    title: 'Admin Access',
    content: (
      <div className="text-center py-12">
        <Lock className="w-16 h-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You are not authorized to access this page.</p>
      </div>
    ),
    source: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Access</title>
</head>
<body>
    <h2>Access Denied</h2>
    <p>You are not authorized to access this page.</p>
    <!-- Note to self: backup contains an older hidden page... need to remove it later -->
</body>
</html>`
  },
  '/backup/hidden.html': {
    title: 'Backup Directory',
    content: (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-500 mb-4">Congratulations!</h2>
        <p className="text-muted-foreground mb-6">You have found the hidden backup page.</p>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 inline-block">
          <code className="text-green-500 font-mono text-lg font-bold">{FLAG}</code>
        </div>
      </div>
    ),
    source: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Backup Directory</title>
</head>
<body>
    <h2>Congratulations!</h2>
    <p>You have found the hidden backup page.</p>
    <strong>${FLAG}</strong>
</body>
</html>`
  }
};

// AI Chatbot responses
const getBotResponse = (input: string): string => {
  const cmd = input.trim().toLowerCase();
  
  if (cmd === 'hint1' || cmd === 'hint 1' || cmd.includes('first hint')) {
    return "🔍 The admin left something behind in plain sight... maybe check what's visible but not *visible*? Try viewing the page source.";
  }
  if (cmd === 'hint2' || cmd === 'hint 2' || cmd.includes('second hint')) {
    return "🤖 Some files tell search engines where NOT to look. Try asking politely for their list. Ever heard of robots.txt?";
  }
  if (cmd === 'hint3' || cmd === 'hint 3' || cmd.includes('third hint')) {
    return "📁 The admin mentioned an older hidden page in the backup folder. What could its name be? Maybe something like /backup/hidden.html?";
  }
  if (cmd === 'help' || cmd === '?') {
    return "💡 Available commands: 'hint1', 'hint2', 'hint3' for progressive hints. Or just chat with me about web security!";
  }
  if (cmd.includes('flag') || cmd.includes('answer')) {
    return "🚫 I can't just give you the flag! That would defeat the purpose. Use the hints and explore the simulated browser.";
  }
  if (cmd.includes('hello') || cmd.includes('hi') || cmd === 'hey') {
    return "👋 Hello, curious human! I'm WebBot, the AI assistant guarding this challenge. Type 'help' for available commands, or ask for hints!";
  }
  if (cmd.includes('robots')) {
    return "🤔 Interesting that you mention robots... There's a file that tells web crawlers where not to look. Have you tried visiting /robots.txt?";
  }
  if (cmd.includes('source') || cmd.includes('html')) {
    return "💻 Viewing page source is a classic recon technique! Developers sometimes leave comments with useful information...";
  }
  if (cmd.includes('admin')) {
    return "🔐 The admin panel is locked, but sometimes admins leave notes in the HTML source code. Maybe check the source of that page?";
  }
  if (cmd.includes('backup')) {
    return "📂 Backup directories are often overlooked during cleanup. If only you knew what files might be hiding there...";
  }
  if (cmd.includes('thank')) {
    return "😊 You're welcome! Remember, even AI leaves breadcrumbs. Good luck with your reconnaissance!";
  }
  
  // Default responses with personality
  const defaults = [
    "🤖 Hmm, I don't quite understand. Try 'hint1', 'hint2', or 'hint3' for clues, or 'help' for more options.",
    "🧐 Interesting question! But I'm programmed to give hints, not answers. Try the hint commands!",
    "💭 I sense you're on the right track, but I can only help through hints. Type 'help' for commands.",
    "🔮 The answers you seek are in the browser, not in my responses. Try exploring the simulated site!"
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
};

export const CuriousWebChallenge: React.FC<CuriousWebChallengeProps> = ({ 
  isCompleted = false 
}) => {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "🤖 Hello curious human! I'm WebBot, the AI assistant that guards this web challenge. If you think you can find what's hidden... prove it.\n\nType 'help' to see available commands, or ask me for hints!",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Browser state
  const [currentUrl, setCurrentUrl] = useState('/');
  const [urlInput, setUrlInput] = useState('http://curious-web.local/');
  const [showSource, setShowSource] = useState(false);
  const [history, setHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        role: 'bot',
        content: getBotResponse(chatInput),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const navigateTo = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    
    if (PAGES[normalizedPath]) {
      setCurrentUrl(normalizedPath);
      setUrlInput(`http://curious-web.local${normalizedPath}`);
      setShowSource(false);
      
      // Update history
      const newHistory = [...history.slice(0, historyIndex + 1), normalizedPath];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const path = urlInput.replace('http://curious-web.local', '').replace('https://curious-web.local', '') || '/';
    navigateTo(path);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const path = history[newIndex];
      setCurrentUrl(path);
      setUrlInput(`http://curious-web.local${path}`);
      setShowSource(false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const path = history[newIndex];
      setCurrentUrl(path);
      setUrlInput(`http://curious-web.local${path}`);
      setShowSource(false);
    }
  };

  const currentPage = PAGES[currentUrl] || {
    title: '404 Not Found',
    content: (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive mb-2">404 - Page Not Found</h2>
        <p className="text-muted-foreground">The requested page does not exist.</p>
      </div>
    ),
    source: '404 - Page Not Found'
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="browser" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browser" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Simulated Browser
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Browser Tab */}
        <TabsContent value="browser" className="mt-4">
          <Card className="border-border bg-card">
            {/* Browser Chrome */}
            <div className="bg-muted/50 border-b border-border p-2 rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={goBack}
                  disabled={historyIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={goForward}
                  disabled={historyIndex === history.length - 1}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => navigateTo(currentUrl)}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="h-7 text-sm font-mono bg-background"
                    placeholder="http://curious-web.local/"
                  />
                </form>
                <Button
                  variant={showSource ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowSource(!showSource)}
                >
                  <Code className="w-3 h-3 mr-1" />
                  View Source
                </Button>
              </div>
            </div>

            {/* Browser Content */}
            <CardContent className="p-0">
              <div className="min-h-[300px] bg-background">
                {showSource ? (
                  <pre className="p-4 text-sm font-mono text-muted-foreground overflow-auto whitespace-pre-wrap">
                    {currentPage.source}
                  </pre>
                ) : (
                  <div className="p-4">
                    {currentPage.content}
                  </div>
                )}
              </div>
            </CardContent>

            {/* Quick Navigation */}
            <div className="border-t border-border p-2 bg-muted/30">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-muted-foreground">Quick nav:</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => navigateTo('/')}>
                  Home
                </Button>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => navigateTo('/robots.txt')}>
                  /robots.txt
                </Button>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => navigateTo('/admin')}>
                  /admin
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">WebBot</CardTitle>
                  <p className="text-xs text-muted-foreground">AI Challenge Assistant</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs">Online</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[280px] overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        msg.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-[10px] opacity-60 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask for hints or chat with WebBot..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button type="submit" size="icon" disabled={isTyping || !chatInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hint about flag location */}
      {!isCompleted && (
        <div className="text-center text-sm text-muted-foreground">
          <p>💡 Find the flag in the simulated browser, then submit it below</p>
        </div>
      )}
    </div>
  );
};

export default CuriousWebChallenge;
