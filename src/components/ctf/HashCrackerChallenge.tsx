import { useState, useRef, useEffect, useCallback } from "react";
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

// Lightweight MD5 implementation (RFC 1321)
const md5 = (str: string): string => {
  const utf8 = new TextEncoder().encode(str);
  const len = utf8.length;
  const bitLen = len * 8;
  const padLen = ((56 - (len + 1) % 64) + 64) % 64;
  const buf = new Uint8Array(len + 1 + padLen + 8);
  buf.set(utf8);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(buf.length - 8, bitLen >>> 0, true);
  view.setUint32(buf.length - 4, (bitLen / 0x100000000) >>> 0, true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const K = Array.from({length:64},(_,i)=>Math.floor(2**32*Math.abs(Math.sin(i+1)))>>>0);

  for (let off = 0; off < buf.length; off += 64) {
    const M = Array.from({length:16},(_,j)=>view.getUint32(off+j*4,true));
    let [a,b,c,d] = [a0,b0,c0,d0];
    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5*i+1)%16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3*i+5)%16; }
      else { f = c ^ (b | ~d); g = (7*i)%16; }
      f = (f + a + K[i] + M[g]) >>> 0;
      a = d; d = c; c = b;
      b = (b + ((f << S[i]) | (f >>> (32-S[i])))) >>> 0;
    }
    a0 = (a0+a)>>>0; b0 = (b0+b)>>>0; c0 = (c0+c)>>>0; d0 = (d0+d)>>>0;
  }
  return [a0,b0,c0,d0].map(v => {
    const h = new DataView(new ArrayBuffer(4));
    h.setUint32(0, v, true);
    return Array.from(new Uint8Array(h.buffer)).map(b => b.toString(16).padStart(2,'0')).join('');
  }).join('');
};

// SHA-1 via Web Crypto API
const sha1 = async (str: string): Promise<string> => {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Simulated wordlist for the crack command — includes the answers plus decoys
const WORDLIST = [
  "password", "123456", "admin", "letmein", "welcome", "monkey", "dragon",
  "master", "qwerty", "login", "abc123", "hello", "its me", "hash",
  "cracker", "letssee", "crackme", "shadow", "sunshine", "trustno1",
  "iloveyou", "batman", "access", "flower", "test", "passw0rd",
  "charlie", "robert", "thomas", "football", "science", "computer"
];

const HEADER_LINES = [
  "=== Challenge: Identify the hashing algorithms of the weak hashes and decrypt/crack them ===",
  "",
  "View the weak hashes, identify their hashing algorithm(s), crack the weak hashes",
  "and submit the cracked hash along with the hash and its algorithm to retrieve the flag.",
  "",
  "Task:",
  "  1) Run cat hashes.txt to view the hashes.",
  "  2) Identify the hashing algorithms (hint: check the hash length).",
  "  3) Crack the weak hashes using the crack command or external tools.",
  "  4) Submit each cracked hash in format: hash:plaintext algorithm",
  "",
  "Allowed commands:",
  "  cat hashes.txt          — view the hashes to crack",
  "  crack <hash>            — run dictionary attack against a hash",
  "  identify <hash>         — identify hash type by length",
  "  md5 <text>              — compute MD5 hash of text (verify)",
  "  sha1 <text>             — compute SHA-1 hash of text (verify)",
  "  hash:plaintext algorithm — submit answer (e.g. 49f6...3b:hi MD5)",
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

  const [cracking, setCracking] = useState(false);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [lines]);

  const addLines = (...newLines: string[]) => {
    setLines(prev => [...prev, ...newLines]);
  };

  const runCrack = async (targetHash: string, displayCmd: string) => {
    setCracking(true);
    // Identify algorithm by length
    const isMd5 = targetHash.length === 32;
    const isSha1 = targetHash.length === 40;
    if (!isMd5 && !isSha1) {
      addLines(displayCmd, "✗ Unrecognised hash length. Use 'identify' first.", "");
      setCracking(false);
      return;
    }
    const algName = isMd5 ? "MD5" : "SHA-1";
    addLines(displayCmd, `[*] Detected ${algName} hash. Starting dictionary attack...`, `[*] Wordlist: ${WORDLIST.length} words`);

    let found = false;
    for (let i = 0; i < WORDLIST.length; i++) {
      const word = WORDLIST[i];
      const computed = isMd5 ? md5(word) : await sha1(word);

      // Show progress every few words
      if (i % 8 === 0) {
        addLines(`[*] Trying: ${word}...`);
        // Small delay for realism
        await new Promise(r => setTimeout(r, 60));
      }

      if (computed === targetHash) {
        addLines(
          `[+] CRACKED! ${targetHash} → "${word}" (${algName})`,
          `[*] Submit with: ${targetHash}:${word} ${algName}`,
          ""
        );
        found = true;
        break;
      }
    }

    if (!found) {
      addLines("[✗] Not found in wordlist. Try a larger dictionary or external tools.", "");
    }
    setCracking(false);
  };

  const handleCommand = async () => {
    if (cracking) return;
    const cmd = input.trim();
    if (!cmd) return;

    const displayCmd = `> ${cmd}`;
    const low = cmd.toLowerCase();
    setInput("");

    // crack <hash> command
    const crackMatch = low.match(/^crack\s+([a-f0-9]+)$/);
    if (crackMatch) {
      await runCrack(crackMatch[1], displayCmd);
      return;
    }

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

    // md5 <text> command
    const md5Match = cmd.match(/^md5\s+(.+)$/i);
    if (md5Match) {
      const text = md5Match[1];
      const hash = md5(text);
      addLines(displayCmd, `MD5("${text}") = ${hash}`, "");
      return;
    }

    // sha1 <text> command
    const sha1Match = cmd.match(/^sha1\s+(.+)$/i);
    if (sha1Match) {
      const text = sha1Match[1];
      const hash = await sha1(text);
      addLines(displayCmd, `SHA-1("${text}") = ${hash}`, "");
      return;
    }

    // identify <hash> command
    const identifyMatch = low.match(/^identify\s+([a-f0-9]+)$/);
    if (identifyMatch) {
      const h = identifyMatch[1];
      let type = "Unknown";
      if (h.length === 32) type = "MD5 (32 hex characters)";
      else if (h.length === 40) type = "SHA-1 (40 hex characters)";
      else if (h.length === 64) type = "SHA-256 (64 hex characters)";
      addLines(displayCmd, `Hash length: ${h.length} chars → Likely: ${type}`, "");
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
        className="bg-black/80 border border-green-500/20 rounded-lg p-4 h-80 overflow-y-auto font-mono text-xs leading-relaxed cursor-text select-text"
        onClick={(e) => {
          // Only focus input if user didn't select text
          const sel = window.getSelection();
          if (!sel || sel.toString().length === 0) {
            inputRef.current?.focus();
          }
        }}
      >
        {lines.map((line, i) => {
          // Detect hash lines (32 or 40 hex chars)
          const isHash = /^[a-f0-9]{32,40}$/.test(line.trim());
          return (
            <div
              key={i}
              className={`${
                line.startsWith(">")
                  ? "text-cyan-400"
                  : line.startsWith("✓")
                  ? "text-green-400"
                  : line.startsWith("✗")
                  ? "text-red-400"
                  : line.startsWith("🎉")
                  ? "text-yellow-300 font-bold"
                  : isHash
                  ? "text-green-300 hover:bg-green-500/10 cursor-pointer rounded px-1 -mx-1 transition-colors group"
                  : "text-green-300/80"
              }`}
              onClick={isHash ? async (e) => {
                e.stopPropagation();
                await navigator.clipboard.writeText(line.trim());
                const el = e.currentTarget;
                el.dataset.copied = "true";
                setTimeout(() => { el.dataset.copied = ""; }, 1200);
              } : undefined}
              title={isHash ? "Click to copy hash" : undefined}
            >
              {line || "\u00A0"}
              {isHash && <span className="text-green-500/50 text-[10px] ml-2 opacity-0 group-hover:opacity-100 transition-opacity">📋 click to copy</span>}
            </div>
          );
        })}

        {!isComplete && (
          <div className="flex items-center text-green-400">
            <span className="mr-1">{">"}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => !cracking && setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCommand()}
              disabled={cracking}
              className="flex-1 bg-transparent outline-none text-cyan-400 caret-green-400 font-mono text-xs disabled:opacity-50"
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
