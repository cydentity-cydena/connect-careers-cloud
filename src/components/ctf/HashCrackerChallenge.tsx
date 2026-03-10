import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Terminal } from "lucide-react";

const FLAG = "FLAG{Congratulations_you_cracked_the_weak_hashes_and_identified_their_hashing_algorithms}";

const HASHES_FILE = [
  "5d41402abc4b2a76b9719d911017c592",
  "bba57ffdc31f073ab830ae660156181f",
  "0800fc577294c34e0b28ad2839435945",
  "1c4cb48e4fcc0769f6bdd4ba7585fad02570a371",
  "9193bc3e3398740a43fc57266ca3713745382b3a",
  "8786ba517f024e479b20982567f998e58cde951e",
];

interface HashSolution {
  hash: string;
  plaintext: string;
  algorithm: string;
}

const SOLUTIONS: HashSolution[] = [
  { hash: "5d41402abc4b2a76b9719d911017c592", plaintext: "hello", algorithm: "md5" },
  { hash: "bba57ffdc31f073ab830ae660156181f", plaintext: "its me", algorithm: "md5" },
  { hash: "0800fc577294c34e0b28ad2839435945", plaintext: "hash", algorithm: "md5" },
  { hash: "1c4cb48e4fcc0769f6bdd4ba7585fad02570a371", plaintext: "cracker", algorithm: "sha-1" },
  { hash: "9193bc3e3398740a43fc57266ca3713745382b3a", plaintext: "letssee", algorithm: "sha-1" },
  { hash: "8786ba517f024e479b20982567f998e58cde951e", plaintext: "crackme", algorithm: "sha-1" },
];

const HEADER_LINES = [
  "=== Challenge: Identify the hashing algorithms of the weak hashes and decrypt/crack them ===",
  "",
  "View the weak hashes, identify their hashing algorithm(s), crack the weak hashes",
  "and submit the cracked hash along with the hash and its algorithm to retrieve the flag.",
  "",
  "Task:",
  "  1) Run cat hashes.txt to view the hashes.",
  "  2) Identify the hashing algorithms using online tools.",
  "  3) Crack the weak hashes using online tools.",
  "  4) Submit each cracked hash in format: hash:plaintext algorithm",
  "",
  "Allowed commands:",
  "  cat hashes.txt",
  "  Submit cracked hash — e.g. 49f68a5c8493ec2c0bf489821c21fc3b:hi MD5",
  "  help, quit",
  "",
];

interface HashCrackerChallengeProps {
  onComplete: (flag: string) => void;
}

const HashCrackerChallenge = ({ onComplete }: HashCrackerChallengeProps) => {
  const [lines, setLines] = useState<string[]>([...HEADER_LINES]);
  const [input, setInput] = useState("");
  const [solved, setSolved] = useState<boolean[]>(new Array(6).fill(false));
  const [isComplete, setIsComplete] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [lines]);

  const addLines = (...newLines: string[]) => {
    setLines(prev => [...prev, ...newLines]);
  };

  const handleCommand = () => {
    const cmd = input.trim();
    if (!cmd) return;

    const displayCmd = `> ${cmd}`;
    const low = cmd.toLowerCase();
    setInput("");

    if (low === "quit" || low === "exit") {
      addLines(displayCmd, "Bye.", "");
      return;
    }

    if (low === "help") {
      addLines(displayCmd, "", ...HEADER_LINES);
      return;
    }

    if (low === "cat hashes.txt") {
      addLines(displayCmd, "", ...HASHES_FILE, "");
      return;
    }

    // Check hash:plaintext algorithm format
    const match = low.match(/^([a-f0-9]+):(.+)\s+(md5|sha-1|sha1)$/);
    if (match) {
      const [, hash, plaintext, alg] = match;
      const normalizedAlg = alg === "sha1" ? "sha-1" : alg;

      const idx = SOLUTIONS.findIndex(
        s => s.hash === hash && s.plaintext === plaintext.trim() && s.algorithm === normalizedAlg
      );

      if (idx !== -1) {
        const newSolved = [...solved];
        newSolved[idx] = true;
        setSolved(newSolved);

        if (newSolved.every(Boolean)) {
          addLines(
            displayCmd,
            "✓ Correct Hashing Algorithm Identification and Hash Decryption!",
            "",
            `🎉 ${FLAG}`,
            "",
            "FLAG retrieved. Challenge complete!",
            ""
          );
          setIsComplete(true);
          onComplete(FLAG);
        } else {
          const remaining = newSolved.filter(s => !s).length;
          addLines(
            displayCmd,
            `✓ Correct! ${remaining} hash${remaining === 1 ? "" : "es"} remaining.`,
            ""
          );
        }
      } else {
        addLines(displayCmd, "✗ Incorrect hash decryption or algorithm. Try again.", "");
      }
    } else {
      addLines(displayCmd, "Command not recognised. Type 'help' for allowed commands.", "");
    }
  };

  const solvedCount = solved.filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5" />
          Hash Cracker Terminal
        </span>
        <span className="flex items-center gap-1.5">
          {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
          {solvedCount}/6 cracked
        </span>
      </div>

      {/* Hash status indicators */}
      <div className="flex gap-1">
        {solved.map((s, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              s ? "bg-green-500" : "bg-muted/50"
            }`}
          />
        ))}
      </div>

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="bg-black/80 border border-green-500/20 rounded-lg p-4 h-80 overflow-y-auto font-mono text-xs leading-relaxed cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith(">")
                ? "text-cyan-400"
                : line.startsWith("✓")
                ? "text-green-400"
                : line.startsWith("✗")
                ? "text-red-400"
                : line.startsWith("🎉")
                ? "text-yellow-300 font-bold"
                : "text-green-300/80"
            }
          >
            {line || "\u00A0"}
          </div>
        ))}

        {!isComplete && (
          <div className="flex items-center text-green-400">
            <span className="mr-1">{">"}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCommand()}
              className="flex-1 bg-transparent outline-none text-cyan-400 caret-green-400 font-mono text-xs"
              autoFocus
              spellCheck={false}
              placeholder="Type a command..."
            />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Type <code className="text-primary">help</code> for instructions or{" "}
        <code className="text-primary">cat hashes.txt</code> to view hashes
      </p>
    </div>
  );
};

export default HashCrackerChallenge;
