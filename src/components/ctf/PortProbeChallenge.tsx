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
const PORT_RANGE = { min: 1, max: 65535 };
const SCAN_RANGE = "1-65535"; // Full port range for realism
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
    // Initial header - less hand-holding
    addOutput([
      "=== Challenge: Port Probe Protocols ===",
      "",
      "A web service is hidden somewhere on localhost.",
      "Your mission: Find it and retrieve the banner.",
      "",
      "Tools available: nmap, curl",
      "Type 'help' for command syntax.",
      "",
    ]);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const simulateNmap = (portsInRange: number[]) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
    const sortedPorts = portsInRange.sort((a, b) => a - b);
    
    addOutput([
      `Starting Nmap 7.94 ( https://nmap.org ) at ${now}`,
      `Nmap scan report for localhost (${HOST})`,
      "Host is up (0.00025s latency).",
      "",
      "PORT      STATE SERVICE",
      ...sortedPorts.map(p => `${p}/tcp   open  ${serviceNames[p]}`),
      "",
      "Nmap done: 1 IP address (1 host up) scanned in 0.14 seconds",
      "",
    ]);
    setScanned(true);
  };

  const parseCurlUrl = (cmd: string): { host: string; port: number; path: string } | null => {
    // Try with http:// prefix first
    let match = cmd.match(/curl\s+https?:\/\/([^:/]+):(\d+)(\/[^\s]*)?/i);
    
    // If no match, try without http:// prefix (e.g., curl 127.0.0.1:8037/banner.txt)
    if (!match) {
      match = cmd.match(/curl\s+([^:/\s]+):(\d+)(\/[^\s]*)?/i);
    }
    
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
    addOutput([`ctf@localhost:~$ ${cmd}`]);
    setCommand("");

    const lower = cmd.toLowerCase();

    if (lower === "help") {
      addOutput([
        "",
        "Available commands:",
        `  nmap -p <range> <host>    Scan ports on a host`,
        `  curl <url>                Fetch a URL`,
        "  clear                     Clear terminal",
        "",
        "Example: nmap -p 1-1000 127.0.0.1",
        "",
      ]);
      return;
    }

    if (lower === "clear") {
      setOutput([]);
      return;
    }

    // Accept any valid nmap command with port range
    const nmapMatch = cmd.match(/^nmap\s+-p\s+(\d+)-(\d+)\s+(\S+)$/i);
    if (nmapMatch) {
      const startPort = parseInt(nmapMatch[1], 10);
      const endPort = parseInt(nmapMatch[2], 10);
      const targetHost = nmapMatch[3];
      
      if (targetHost !== HOST && targetHost !== "localhost") {
        addOutput([`Failed to resolve "${targetHost}".`, ""]);
        return;
      }
      
      // Check if the scan range includes our ports
      const portsInRange = [realPort, redHttpPort, redNonHttpPort].filter(
        p => p >= startPort && p <= endPort
      );
      
      if (portsInRange.length === 0) {
        addOutput([
          `Starting Nmap 7.94 ( https://nmap.org )`,
          `Nmap scan report for localhost (${HOST})`,
          "Host is up.",
          "",
          `All ${endPort - startPort + 1} scanned ports are closed`,
          "",
          "Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds",
          "",
        ]);
        return;
      }
      
      simulateNmap(portsInRange);
      return;
    }

    if (cmd.startsWith("curl ")) {
      if (!scanned) {
        addOutput([
          "Tip: You might want to scan for open services first.",
          "",
        ]);
      }

      const parsed = parseCurlUrl(cmd);
      if (!parsed) {
        addOutput([
          "Usage: curl http://<host>:<port>/<path>",
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
          "Try a different port or path.",
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
            ctf@localhost:~$
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
              Hint: Use <code className="bg-black px-1 rounded">nmap</code> to discover open services. Type <code className="bg-black px-1 rounded">help</code> for syntax.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortProbeChallenge;
