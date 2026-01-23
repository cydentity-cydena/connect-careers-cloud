import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Check, X, HelpCircle } from "lucide-react";

interface PortProbeProps {
  onSolve: (flag: string) => void;
  challengeId: string;
}

const HOST = "127.0.0.1";
const PORT_RANGE = { min: 8000, max: 8100 };
const BANNER_PATH = "/banner.txt";
const FLAG = "FLAG{banner_found_via_scan}";

// Generate consistent ports based on challenge ID (pseudo-random but deterministic)
const generatePorts = (seed: string): { realPort: number; redHttpPort: number; redNonHttpPort: number } => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  
  const range = PORT_RANGE.max - PORT_RANGE.min;
  const realPort = PORT_RANGE.min + Math.abs(hash % range);
  const redHttpPort = PORT_RANGE.min + Math.abs((hash * 31) % range);
  const redNonHttpPort = PORT_RANGE.min + Math.abs((hash * 17) % range);
  
  // Ensure all ports are different
  const ports = new Set([realPort]);
  let http = redHttpPort;
  while (ports.has(http)) http = PORT_RANGE.min + ((http + 1 - PORT_RANGE.min) % range);
  ports.add(http);
  
  let nonHttp = redNonHttpPort;
  while (ports.has(nonHttp)) nonHttp = PORT_RANGE.min + ((nonHttp + 1 - PORT_RANGE.min) % range);
  
  return { realPort, redHttpPort: http, redNonHttpPort: nonHttp };
};

const PortProbeChallenge = ({ onSolve, challengeId }: PortProbeProps) => {
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const [scanned, setScanned] = useState(false);
  const [solved, setSolved] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  
  const { realPort, redHttpPort, redNonHttpPort } = generatePorts(challengeId);
  
  const serviceNames: Record<number, string> = {
    [realPort]: "http-banner",
    [redHttpPort]: "http-status", 
    [redNonHttpPort]: "ssh-alt",
  };

  const addOutput = (lines: string[]) => {
    setOutput(prev => [...prev, ...lines]);
  };

  useEffect(() => {
    // Initial header
    addOutput([
      "=== Challenge: Port Probe Protocols ===",
      "",
      "There is a service running on localhost in the port range 8000–8100.",
      "",
      "Task:",
      "  1) Scan ports 8000–8100 with nmap",
      "  2) Use the scan output to identify which service is hosting banner.txt",
      "  3) Retrieve it with curl",
      "",
      "Start with:",
      `  nmap -p 8000-8100 ${HOST}`,
      "",
      "Allowed commands:",
      `  nmap -p 8000-8100 ${HOST}`,
      `  curl http://${HOST}:<port>${BANNER_PATH}`,
      "  help, clear",
      "",
    ]);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const simulateNmap = () => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
    const ports = [realPort, redHttpPort, redNonHttpPort].sort((a, b) => a - b);
    
    addOutput([
      `Starting Nmap 7.94 ( https://nmap.org ) at ${now}`,
      `Nmap scan report for localhost (${HOST})`,
      "Host is up (0.00025s latency).",
      "",
      "PORT      STATE SERVICE",
      ...ports.map(p => `${p}/tcp   open  ${serviceNames[p]}`),
      "",
      "Nmap done: 1 IP address (1 host up) scanned in 0.14 seconds",
      "",
      "Note: One of the HTTP services exposes a text file at /banner.txt",
      "      Use curl against the correct port + path to retrieve it.",
      "",
    ]);
    setScanned(true);
  };

  const parseCurlUrl = (cmd: string): { host: string; port: number; path: string } | null => {
    const match = cmd.match(/curl\s+https?:\/\/([^:/]+):(\d+)(\/[^\s]*)?/i);
    if (!match) return null;
    return {
      host: match[1],
      port: parseInt(match[2], 10),
      path: match[3] || "/",
    };
  };

  const simulateHttpResponse = (port: number, path: string): boolean => {
    const isRealHttp = port === realPort;
    const isRedHerringHttp = port === redHttpPort;
    const isRedNonHttp = port === redNonHttpPort;

    // Not an open port
    if (!isRealHttp && !isRedHerringHttp && !isRedNonHttp) {
      addOutput([`curl: (7) Failed to connect to ${HOST} port ${port}: Connection refused`, ""]);
      return false;
    }

    // Non-HTTP red herring
    if (isRedNonHttp) {
      addOutput([`curl: (7) Failed to connect to ${HOST} port ${port}: Connection refused`, ""]);
      return false;
    }

    // HTTP red herring - no banner.txt
    if (isRedHerringHttp) {
      if (path === "/") {
        addOutput(["OK", "", "Welcome to the status page.", ""]);
      } else {
        addOutput(["Not Found", "", "404", ""]);
      }
      return false;
    }

    // Real HTTP service
    if (path !== BANNER_PATH) {
      addOutput(["Not Found", "", "404", ""]);
      return false;
    }

    // Success!
    addOutput([FLAG, "", "🎉 FLAG retrieved! Challenge complete.", ""]);
    return true;
  };

  const executeCommand = () => {
    if (!command.trim() || solved) return;

    const cmd = command.trim();
    addOutput([`student@localhost:~$ ${cmd}`]);
    setCommand("");

    const lower = cmd.toLowerCase();

    if (lower === "help") {
      addOutput([
        "",
        "Allowed commands:",
        `  nmap -p 8000-8100 ${HOST}`,
        `  curl http://${HOST}:<port>${BANNER_PATH}`,
        "  help, clear",
        "",
      ]);
      return;
    }

    if (lower === "clear") {
      setOutput([]);
      return;
    }

    if (cmd === `nmap -p 8000-8100 ${HOST}`) {
      simulateNmap();
      return;
    }

    if (cmd.startsWith("curl ")) {
      if (!scanned) {
        addOutput([
          "❌ Scan first. Start with:",
          `  nmap -p 8000-8100 ${HOST}`,
          "",
        ]);
        return;
      }

      const parsed = parseCurlUrl(cmd);
      if (!parsed) {
        addOutput([
          "Usage:",
          `  curl http://${HOST}:<port>${BANNER_PATH}`,
          "",
        ]);
        return;
      }

      if (parsed.host !== HOST) {
        addOutput([`curl: (6) Could not resolve host: ${parsed.host}`, ""]);
        return;
      }

      const success = simulateHttpResponse(parsed.port, parsed.path);
      if (success) {
        setSolved(true);
        onSolve(FLAG);
      } else {
        addOutput([
          "Hint: Use the nmap SERVICE column to choose the correct port,",
          "      and request /banner.txt on the HTTP service that suggests it.",
          "",
        ]);
      }
      return;
    }

    addOutput(["Command not recognised. Type 'help' for allowed commands.", ""]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand();
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-green-400">
          <Terminal className="h-5 w-5" />
          Terminal Simulation
          {solved && <Check className="h-5 w-5 text-green-500 ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={outputRef}
          className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 h-80 overflow-y-auto mb-4 whitespace-pre-wrap"
        >
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <span className="text-green-400 font-mono text-sm flex items-center">
            student@localhost:~$
          </span>
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={solved}
            className="flex-1 bg-black border-gray-700 text-green-400 font-mono text-sm"
            placeholder={solved ? "Challenge completed!" : "Enter command..."}
          />
          <Button 
            onClick={executeCommand} 
            disabled={solved || !command.trim()}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            Run
          </Button>
        </div>

        {!scanned && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg text-sm text-blue-300 flex items-start gap-2">
            <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              Start by scanning ports with: <code className="bg-black px-1 rounded">nmap -p 8000-8100 127.0.0.1</code>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortProbeChallenge;
