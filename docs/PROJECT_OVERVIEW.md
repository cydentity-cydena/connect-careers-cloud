# Cydena — Project Overview

## What Is Cydena?

Cydena is a **UK-focused cybersecurity talent platform** that differentiates from volume-based recruitment platforms (e.g. Cyberr, CyberSN) by **validating every candidate** — identity, right-to-work, certifications, and skills — before employers see them.

**Published URL:** https://cydena.lovable.app

## Core Value Proposition

- **"Every Candidate Validated, Not Just Listed"**
- Technology-first — no agency heritage or recruiter rebrand
- UK compliance focus: CBEST, TIBER-UK, SC/DV clearance, NIS2
- Free for candidates, subscription-based for employers/recruiters
- Community-driven with gamification (XP, leaderboard, achievements)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui components |
| State | TanStack React Query |
| Routing | React Router v6 |
| Backend | Supabase (Lovable Cloud) |
| Auth | Supabase Auth + MFA (TOTP) |
| Payments | Stripe (subscriptions + one-time purchases) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Animations | Framer Motion |
| 3D | React Three Fiber (Skill Genome visualization) |

## User Roles

| Role | Description |
|------|-------------|
| `candidate` | Cybersecurity professionals (free tier) |
| `employer` | Companies hiring cyber talent (paid subscription) |
| `recruiter` | Recruitment agencies (paid subscription) |
| `admin` | Platform administrators |
| `staff` | Internal staff (Cydena team) |

## Revenue Model

### Employer Subscriptions (Stripe)
- **Starter:** £99/mo — 1 seat, 10 unlocks/year, £15/unlock overage
- **Growth:** £299/mo — 3 seats, 25 unlocks/year, £12/unlock overage
- **Scale:** £699/mo — 6 seats, 75 unlocks/year, £10/unlock overage

### Recruiter Subscriptions
- **Pro:** £499/mo — 3 seats, 50 unlocks/year, £10/unlock overage

### Additional Revenue
- Credit pack purchases (one-time Stripe payments)
- Featured certification slots (training partners pay for visibility)
- Featured training partner slots
- Marketplace engagements (Stripe Connect for talent payouts)
- Additional single unlocks at £75/each

## Key Differentiators vs Competitors

1. **Verification-first** — Identity, RTW, certifications auto-verified
2. **UK compliance depth** — CBEST, TIBER-UK, SC/DV, NIS2 frameworks
3. **AI-powered skill validation** — LLM-assessed technical assessments
4. **Community model** — XP, leaderboard, peer endorsements, CTF challenges
5. **SMB MSSP focus** — Not just enterprise; serves managed security providers
6. **Zero agency heritage** — Technology-first, no recruiter rebrand
7. **Unified talent & bounty marketplace** — Same candidate profile serves full-time hiring and scoped task bounties; employers can trial candidates via bounties before committing to a permanent hire
