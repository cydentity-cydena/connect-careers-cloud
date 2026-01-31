# Cydena CTF Challenges

A collection of interactive Capture The Flag (CTF) challenges for cybersecurity education and skills assessment.

## Overview

These challenges are React-based interactive simulations designed to test and teach cybersecurity concepts without requiring external environments.

## Challenge Categories

| Challenge | Category | Difficulty | Points | Flag |
|-----------|----------|------------|--------|------|
| Welcome to CTF | General | Beginner | 10 | `FLAG{welcome_to_cydena_ctf}` |
| Base64 Basics | Cryptography | Beginner | 20 | `FLAG{base64_is_easy}` |
| Port Scanner | Network Security | Beginner | 25 | `FLAG{ssh}` |
| Security Quiz | Puzzle | Beginner | 50 | `FLAG{NEVERGIVEUP}` |
| Caesar Cipher | Cryptography | Intermediate | 75 | `FLAG{CAESAR_CIPHERY}` |
| Port Probe Protocols | Network Security | Beginner | 100 | `FLAG{banner_found_via_scan}` |
| The Curious Web | Web Security | Intermediate | 150 | `FLAG{ai_was_trying_to_distract_you}` |
| Injection Junction | Web Security | Intermediate | 150 | `FLAG{sql_injection_master}` |
| Deepfakes and Dollars | Forensics | Intermediate | 150 | `FLAG{deepfake_detector_elite}` |
| Advanced Chess Gambit | General | Advanced | 200 | `FLAG{FACE}` |
| SOC In The Loop | Forensics | Advanced | 250 | `FLAG{ai_guided_but_human_verified}` |

## Interactive Components

### 1. PortProbeChallenge
**File:** `components/PortProbeChallenge.tsx`

A terminal simulation that mimics `nmap` and `curl` commands. Users must scan for open ports and retrieve a banner file containing the flag.

**Key Features:**
- Realistic terminal interface with prompt
- Simulated port scanning with randomized ports
- HTTP request simulation

---

### 2. CuriousWebChallenge
**File:** `components/CuriousWebChallenge.tsx`

A simulated browser environment with web reconnaissance capabilities.

**Key Features:**
- Mock browser with URL bar and navigation
- View Source functionality
- Simulated pages: `/`, `/robots.txt`, `/admin`, `/backup/hidden.html`
- AI chatbot that provides hints but may mislead

---

### 3. InjectionJunctionChallenge
**File:** `components/InjectionJunctionChallenge.tsx`

A SQL injection simulation with a WAF (Web Application Firewall) bypass challenge.

**Key Features:**
- SecureBank™ login portal simulation
- Simulated WAF blocking common SQLi patterns (OR, AND, --, etc.)
- SQL query log viewer
- UNION SELECT bypass technique required

---

### 4. DeepfakeDetectorChallenge
**File:** `components/DeepfakeDetectorChallenge.tsx`

A forensic audio analysis challenge to detect AI-generated deepfakes.

**Key Features:**
- Real-time audio visualization (Waveform/Spectrum modes)
- Web Audio API integration
- 3 audio samples to analyze (1 real, 2 fake)
- Requires 3/3 correct identifications

**Audio Files Required:**
- `audio/ctf/call1_real.wav` (genuine)
- `audio/ctf/call2_fake.wav` (deepfake)
- `audio/ctf/call3_fake.wav` (deepfake)

---

### 5. SOCInTheLoopChallenge
**File:** `components/SOCInTheLoopChallenge.tsx`

An advanced threat hunting exercise where AI analysis may be misleading.

**Key Features:**
- ~50 realistic access log entries
- AI-generated summary that focuses on wrong threats
- Real attack is a subtle POST-based Boolean SQLi from `203.0.113.77`
- Terminal interface with `cat` command support

---

### 6. QuizChallenge
**File:** `components/QuizChallenge.tsx`

A rapid-fire cybersecurity quiz where first letters of answers spell the flag.

**Key Features:**
- 11 questions about security tools and concepts
- First letter of each answer spells `NEVERGIVEUP`
- Wrong answer resets progress

---

### 7. ChessChallenge
**File:** `components/ChessChallenge.tsx`

Chess checkmate puzzles where destination files spell the flag.

**Key Features:**
- 4 checkmate-in-one puzzles
- ASCII board representation
- Move notation parsing (algebraic notation)
- Destination files spell `FACE`

## Tech Stack

- **React** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Web Audio API** for audio visualization
- **Lucide React** for icons

## Dependencies

```json
{
  "@radix-ui/react-tabs": "^1.x",
  "@radix-ui/react-progress": "^1.x",
  "lucide-react": "^0.x",
  "class-variance-authority": "^0.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x"
}
```

## Setup

1. Copy the component files to your React project
2. Ensure shadcn/ui components are installed (`Card`, `Button`, `Input`, `Badge`, `Tabs`, `Progress`, `ScrollArea`)
3. Copy audio files to `public/audio/ctf/`
4. Import and use components with `onComplete` callback

## Usage Example

```tsx
import { PortProbeChallenge } from './components/PortProbeChallenge';

function CTFPage() {
  const handleSolved = (flag: string) => {
    console.log('Challenge solved!', flag);
    // Submit flag to backend
  };

  return (
    <PortProbeChallenge 
      challengeId="unique-id" 
      onSolve={handleSolved} 
    />
  );
}
```

## Database Schema

Challenges are stored in a `ctf_challenges` table with:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Challenge name |
| description | TEXT | Challenge description |
| category | TEXT | Category (Web, Network, Crypto, etc.) |
| difficulty | TEXT | beginner/intermediate/advanced |
| points | INTEGER | Point value |
| flag | TEXT | The flag answer |
| hints | JSONB | Array of hint objects with cost |
| is_active | BOOLEAN | Whether publicly visible |

## License

MIT License - See LICENSE file for details.

---

*Cydena - Cybersecurity Talent Platform*
