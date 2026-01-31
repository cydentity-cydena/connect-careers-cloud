# CTF Export - File Structure

Copy these files to your GitHub repo with the same directory structure.

## Complete File List

```
CTF/
│
├── README.md                                          # Main documentation
├── FILE_STRUCTURE.md                                  # This file
│
├── data/
│   └── database-schema.sql                            # PostgreSQL schema + seed data
│
├── public/
│   ├── audio/ctf/
│   │   ├── call1_real.wav                            # Deepfake challenge - real audio
│   │   ├── call2_fake.wav                            # Deepfake challenge - fake audio
│   │   └── call3_fake.wav                            # Deepfake challenge - fake audio
│   └── docs/
│       └── ctf-challenges.json                        # Challenge metadata export
│
└── src/
    ├── pages/
    │   └── CTF.tsx                                    # Main CTF page (856 lines)
    │
    └── components/
        └── ctf/
            ├── ChessChallenge.tsx                     # Chess puzzles (250 lines)
            ├── QuizChallenge.tsx                      # Security quiz (281 lines)
            ├── PortProbeChallenge.tsx                 # Port scanning sim (318 lines)
            ├── CuriousWebChallenge.tsx                # Web recon sim (460 lines)
            ├── InjectionJunctionChallenge.tsx         # SQL injection sim (397 lines)
            ├── DeepfakeDetectorChallenge.tsx          # Audio forensics (583 lines)
            └── SOCInTheLoopChallenge.tsx              # SOC analyst sim (520 lines)
```

## Files NOT Included (Copy from Main Cydena Project)

These are UI components from shadcn/ui - install via `npx shadcn-ui@latest add`:

```
src/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── badge.tsx
├── tabs.tsx
├── table.tsx
├── avatar.tsx
├── switch.tsx
├── label.tsx
├── progress.tsx
├── scroll-area.tsx
└── ... (other shadcn components)
```

## Audio Files Location

The audio files for the Deepfake challenge are served from:
- Original location: `public/audio/ctf/`
- Runtime URL: `/audio/ctf/call1_real.wav` etc.

Make sure to copy the audio files to the same relative path in your repo.
