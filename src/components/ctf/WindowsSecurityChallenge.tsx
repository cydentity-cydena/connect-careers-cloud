import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Terminal } from "lucide-react";

const FLAG = "FLAG{Cydena@2026}";

const HASH_RAW =
  "cydena_admin::CPSALITE:1122334455667788:6f2b7d3480037599f5799a64e1378875:010100000000000028292a2b2c2d2e2f3031323334353637";

const RESPONDER_BANNER = [
  "                                     _",
  "  _ __ ___  ___ _ __   ___  _ __   __| | ___ _ __",
  " | '__/ _ \\/ __| '_ \\ / _ \\| '_ \\ / _` |/ _ \\ '__|",
  " | | |  __/\\__ \\ |_) | (_) | | | | (_| |  __/ |",
  " |_|  \\___||___/ .__/ \\___/|_| |_|\\__,_|\\___|_|",
  "               |_|",
  "",
  "       NBT-NS, LLMNR & MDNS Responder 2.3.4.0",
  "",
  "Author: Laurent Gaffie (laurent.gaffie@gmail.com)",
  "To kill this script hit CTRL-C",
  "",
  "[+] Poisoners:",
  "    LLMNR                      [ON]",
  "    NBT-NS                     [ON]",
  "    DNS/MDNS                   [ON]",
  "",
  "[+] Servers:",
  "    HTTP server                [ON]",
  "    HTTPS server               [ON]",
  "    WPAD proxy                 [ON]",
  "    Auth proxy                 [OFF]",
  "    SMB server                 [ON]",
  "    Kerberos server            [ON]",
  "    SQL server                 [ON]",
  "    FTP server                 [ON]",
  "    IMAP server                [ON]",
  "    POP3 server                [ON]",
  "    SMTP server                [ON]",
  "    DNS server                 [ON]",
  "    LDAP server                [ON]",
  "",
  "[+] HTTP Options:",
  "    Always serving EXE         [OFF]",
  "    Serving EXE                [OFF]",
  "    Serving HTML               [OFF]",
  "    Upstream Proxy             [OFF]",
  "",
  "[+] Poisoning Options:",
  "    Analyze Mode               [OFF]",
  "    Force WPAD auth            [OFF]",
  "    Force Basic Auth           [OFF]",
  "    Force LM downgrade         [OFF]",
  "    Fingerprint hosts          [OFF]",
  "",
  "[+] Generic Options:",
  "    Responder NIC              [eth0]",
  "    Responder IP               [192.168.47.120]",
  "    Challenge set              [random]",
  "    Don't Respond To Names     ['ISATAP']",
  "",
  "[+] Listening for events...",
];

const CAPTURE_LINES = [
  "[SMB] NTLMv2 SSP Client: 192.168.1.50",
  "[SMB] NTLMv2 SSP Username: CPSALITE\\cydena_admin",
  `[SMB] NTLMv2-SSP Hash: ${HASH_RAW}`,
];

const HEADER_LINES = [
  "=== Windows Security Lab ===",
  "",
  "You have network access to an internal Windows environment.",
  "Capture credentials and crack them to prove the weakness.",
  "",
  "Type 'help' for guidance.",
  "",
];

const HELP_LINES = [
  "Commands:",
  "  responder -I eth0 -rdwv    Poison LLMNR/NBT-NS",
  "  echo <data> > hash.txt     Save captured data",
  "  ls /    ls -la              List files",
  "  cat hash.txt               View saved hash",
  "  hashcat <opts> hash.txt    Crack with hashcat",
  "  help, clear",
  "",
];

interface WindowsSecurityChallengeProps {
  onComplete: (flag: string) => void;
}

type Step = "start" | "captured" | "saved" | "cracked";

const STEPS: { key: Step; label: string }[] = [
  { key: "captured", label: "Capture hash" },
  { key: "saved", label: "Save to file" },
  { key: "cracked", label: "Crack password" },
];

const WindowsSecurityChallenge = ({ onComplete }: WindowsSecurityChallengeProps) => {
  const [lines, setLines] = useState<string[]>([...HEADER_LINES]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("start");
  const [isComplete, setIsComplete] = useState(false);
  const [animating, setAnimating] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [lines]);

  const addLines = (...newLines: string[]) => {
    setLines((prev) => [...prev, ...newLines]);
  };

  const animateLines = async (lineArr: string[], delayMs: number = 80) => {
    setAnimating(true);
    for (const line of lineArr) {
      setLines((prev) => [...prev, line]);
      await new Promise((r) => setTimeout(r, delayMs));
    }
    setAnimating(false);
  };

  const handleCommand = async () => {
    if (animating) return;
    const raw = input.trim();
    if (!raw) return;
    const cmd = raw.replace(/\s+/g, " ");
    const displayCmd = `> ${raw}`;
    setInput("");

    // help
    if (cmd === "help") {
      addLines(displayCmd, "", ...HELP_LINES);
      return;
    }

    // clear
    if (cmd === "clear") {
      setLines([]);
      return;
    }

    // responder
    if (cmd === "responder -I eth0 -rdwv") {
      addLines(displayCmd);
      await animateLines(RESPONDER_BANNER, 30);
      // Pause then show capture
      await new Promise((r) => setTimeout(r, 1500));
      await animateLines(CAPTURE_LINES, 200);
      setStep((prev) => (prev === "start" ? "captured" : prev));
      return;
    }

    // echo ... > hash.txt
    if (cmd.startsWith("echo ") && cmd.includes("> hash.txt")) {
      if (step === "start") {
        addLines(displayCmd, "✗ No data captured yet. Run responder first.", "");
        return;
      }
      // Extract payload
      const payload = cmd
        .split("echo ")[1]
        ?.split("> hash.txt")[0]
        ?.trim()
        .replace(/^["']|["']$/g, "");

      const UNIQUE_MARKER = "1122334455667788";
      if (payload && (payload.includes(HASH_RAW) || payload.includes(UNIQUE_MARKER))) {
        setStep((prev) => (prev === "captured" ? "saved" : prev));
        addLines(
          displayCmd,
          "[+] Hash successfully saved to hash.txt",
          "",
        );
      } else {
        addLines(displayCmd, "✗ Data mismatch. Did you copy the full hash?", "");
      }
      return;
    }

    // ls
    if (cmd === "ls" || cmd === "ls -la") {
      if (step === "start" || step === "captured") {
        addLines(displayCmd, "No files found.", "");
      } else if (cmd === "ls") {
        addLines(displayCmd, "hash.txt", "");
      } else {
        addLines(
          displayCmd,
          "total 4",
          "drwxr-xr-x 2 root root 4096 Feb 21 22:10 .",
          "-rw-r--r-- 1 root root  156 Feb 21 22:12 hash.txt",
          ""
        );
      }
      return;
    }

    // cat hash.txt
    if (cmd === "cat hash.txt") {
      if (step === "start" || step === "captured") {
        addLines(displayCmd, "cat: hash.txt: No such file or directory", "");
      } else {
        addLines(displayCmd, HASH_RAW, "");
      }
      return;
    }

    // hashcat
    if (cmd.startsWith("hashcat")) {
      if (step !== "saved") {
        addLines(
          displayCmd,
          "✗ hashcat: Error: No captured hash available.",
          ""
        );
        return;
      }

      if (cmd.includes("-m 5600") && cmd.includes("hash.txt")) {
        addLines(displayCmd);
        setAnimating(true);
        const hashcatLines = [
          "hashcat (v6.2.5) starting...",
          "[+] Using GPU #1",
          "",
          `${HASH_RAW}:`,
          "Cydena@2026",
          "",
          "Status: Cracked",
          "",
          `🎉 Password cracked! The password is: Cydena@2026`,
          "",
          `${FLAG}`,
          "",
        ];
        for (const line of hashcatLines) {
          setLines((prev) => [...prev, line]);
          await new Promise((r) => setTimeout(r, 300));
        }
        setAnimating(false);
        setStep("cracked");
        setIsComplete(true);
        onComplete(FLAG);
        return;
      }

      addLines(
        displayCmd,
        "hashcat: Error: Incorrect parameters.",
        ""
      );
      return;
    }

    addLines(displayCmd, `bash: ${cmd}: command not found`, "");
  };

  const stepIdx = STEPS.findIndex((s) => s.key === step);
  const completedSteps = step === "cracked" ? 3 : step === "saved" ? 2 : step === "captured" ? 1 : 0;

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5" />
          Windows Security Lab
        </span>
        <span className="flex items-center gap-1.5">
          {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
          {completedSteps}/3 steps
        </span>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i < completedSteps ? "bg-green-500" : "bg-muted/50"
            }`}
          />
        ))}
      </div>

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="bg-black/80 border border-green-500/20 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs leading-relaxed cursor-text select-text"
        onClick={(e) => {
          const sel = window.getSelection();
          if (!sel || sel.toString().length === 0) {
            inputRef.current?.focus();
          }
        }}
      >
        {lines.map((line, i) => {
          const isHash = line.includes("::CPSALITE:");
          return (
            <div
              key={i}
              className={`${
                line.startsWith(">")
                  ? "text-cyan-400"
                  : line.startsWith("✓") || line.startsWith("[+]")
                  ? "text-green-400"
                  : line.startsWith("✗")
                  ? "text-red-400"
                  : line.startsWith("🎉")
                  ? "text-yellow-300 font-bold"
                  : line.includes("[ON]")
                  ? "text-green-300/80"
                  : line.includes("[OFF]")
                  ? "text-red-300/60"
                  : line.startsWith("[SMB]")
                  ? "text-blue-400"
                  : line.startsWith("Status: Cracked")
                  ? "text-green-400 font-bold"
                  : line === "Cydena@2026"
                  ? "text-green-400 font-bold"
                  : isHash
                  ? "text-yellow-300 hover:bg-yellow-500/10 cursor-pointer rounded px-1 -mx-1 transition-colors group"
                  : "text-green-300/80"
              }`}
              onClick={
                isHash
                  ? async (e) => {
                      e.stopPropagation();
                      // Extract the raw hash from the line
                      const hashMatch = line.match(
                        /cydena_admin::CPSALITE[^\s]*/
                      );
                      if (hashMatch) {
                        await navigator.clipboard.writeText(hashMatch[0]);
                      }
                    }
                  : undefined
              }
              title={isHash ? "Click to copy hash" : undefined}
            >
              {line || "\u00A0"}
              {isHash && (
                <span className="text-yellow-500/50 text-[10px] ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  📋 click to copy
                </span>
              )}
            </div>
          );
        })}

        {!isComplete && (
          <div className="flex items-center text-green-400">
            <span className="mr-1">{"root@kali:~#"}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => !animating && setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCommand()}
              disabled={animating}
              className="flex-1 bg-transparent outline-none text-cyan-400 caret-green-400 font-mono text-xs disabled:opacity-50"
              autoFocus
              spellCheck={false}
              placeholder=""
            />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Type <code className="text-primary">help</code> for available commands
      </p>
    </div>
  );
};

export default WindowsSecurityChallenge;
