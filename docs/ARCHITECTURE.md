# Architecture & File Structure

## Project Structure

```
src/
├── App.tsx                    # Root component, all routes defined here
├── main.tsx                   # Entry point
├── index.css                  # Design system tokens (HSL colors, gradients)
├── assets/                    # Static assets (images, logos)
├── components/
│   ├── ui/                    # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── admin/                 # Admin panel components
│   ├── assessments/           # Skills assessment UI
│   ├── auth/                  # MFA verification
│   ├── badges/                # Badge selector & display
│   ├── certifications/        # Cert management & cards
│   ├── community/             # Forum, posts, reactions, XP
│   ├── ctf/                   # CTF challenge components (Chess, Web, Quiz, etc.)
│   ├── dashboard/             # Role-specific dashboard widgets
│   ├── employer/              # Employer-specific (pipeline, pods, analytics)
│   ├── gamification/          # XP system, achievements, profile strength
│   ├── hrready/               # HR-Ready verification panel
│   ├── integrations/          # ATS connections, webhooks
│   ├── jobs/                  # Job application, editing, sharing
│   ├── marketplace/           # API keys, booking dialogs
│   ├── messaging/             # Direct messages
│   ├── pricing/               # ROI calculator
│   ├── profiles/              # Candidate profiles, trust score, endorsements
│   ├── recruiter/             # Candidate import, batch management
│   ├── rewards/               # Points feed
│   ├── sharing/               # Social share cards & dialogs
│   ├── subscription/          # Subscription status & management
│   ├── team/                  # Team member management
│   ├── training/              # Learning paths, YouTube player
│   ├── verification/          # Verification requests & badges
│   ├── Footer.tsx
│   ├── Navigation.tsx         # Main nav with role-based filtering
│   ├── ProtectedRoute.tsx     # Auth + MFA guard
│   ├── SEO.tsx                # Meta tags
│   ├── Schema.tsx             # JSON-LD structured data
│   └── ScrollToTop.tsx
├── hooks/
│   ├── use-mobile.tsx         # Responsive breakpoint hook
│   ├── use-toast.ts           # Toast notifications
│   ├── useProfileRateLimit.ts # Rate limiting for profile views
│   ├── useSeatLimit.ts        # Team seat limit enforcement
│   ├── useSubscription.ts     # Stripe subscription state management
│   └── useUnreadMessages.ts   # Unread message count
├── integrations/supabase/
│   ├── client.ts              # Auto-generated Supabase client (DO NOT EDIT)
│   └── types.ts               # Auto-generated DB types (DO NOT EDIT)
├── lib/
│   ├── backupCodes.ts         # MFA backup code utilities
│   ├── countries.ts           # Country list
│   ├── specializations.ts     # Cybersecurity specialization taxonomy
│   └── utils.ts               # cn() helper, general utilities
├── pages/
│   ├── Index.tsx              # Landing page (public)
│   ├── Auth.tsx               # Sign in / Sign up (1099 lines, complex)
│   ├── Dashboard.tsx          # Role-switching dashboard
│   ├── WhyCydena.tsx          # Competitive comparison page
│   ├── admin/                 # Admin pages (users, roles, pods, CTF, etc.)
│   └── marketing/             # PDF export pages for sales collateral
└── supabase/
    └── functions/             # ~70+ Edge Functions (Deno)
```

## Routing Architecture

Routes are defined in `src/App.tsx`. Key patterns:

### Public Routes (no auth required)
- `/` — Landing page
- `/auth` — Sign in/up
- `/jobs`, `/jobs/:id` — Job listings
- `/pricing` — Pricing page
- `/contact`, `/terms`, `/privacy`
- `/ctf` — CTF challenges
- `/why-cydena` — Competitive comparison
- `/marketplace` — Unified talent & bounty marketplace (3-tab: Browse Talent / Task Bounties / API & MCP)
- `/marketplace/docs`
- `/Early-Access-200` — Founding member signup

### Protected Routes (auth + MFA required)
- `/dashboard` — Role-specific dashboard
- `/profiles`, `/profiles/:id` — Talent directory
- `/leaderboard` — XP leaderboard
- `/community` — Forum
- `/training`, `/learning-paths`
- `/profile` — Edit own profile
- `/messages` — Direct messaging
- `/hr-ready` — HR verification panel
- `/integrations` — ATS/webhook management

### Admin Routes (auth + admin/staff role)
- `/admin/users`, `/admin/roles`, `/admin/pods`
- `/admin/verification-review`
- `/admin/ctf`, `/admin/learning-paths`
- `/admin/subscription-overrides`
- `/staff/funnel` — Candidate pipeline

## Authentication Flow

1. User signs up via `/auth` with email + password (validated with Zod)
2. Email verification required (not auto-confirmed)
3. MFA (TOTP) setup required on first protected route access
4. `ProtectedRoute` component enforces:
   - Authentication check
   - MFA enrollment (redirects to `/security-settings`)
   - AAL2 verification (redirects to `/mfa`)
5. Role-based UI filtering in Navigation (client-side only — security via RLS)

## Design System

All colors defined as HSL in `src/index.css`:

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | 222 47% 11% | Dark navy background |
| `--foreground` | 210 40% 98% | Light text |
| `--primary` | 189 97% 55% | Cyan accent (buttons, links) |
| `--secondary` | 263 70% 50% | Purple accent |
| `--card` | 217 33% 17% | Card backgrounds |
| `--destructive` | 0 84% 60% | Error/danger states |
| `--success` | 142 71% 45% | Success indicators |
| `--warning` | 38 92% 50% | Warning states |

### Gradients
- `--gradient-cyber`: Primary → Secondary (135deg)
- `--gradient-hero`: Background fade
- `--gradient-card`: Subtle card overlay

### Custom Button Variants
- `hero` — Primary CTA with glow effect
- `cyber` — Outline with cyber gradient border

**Dark mode only** — The app is designed for dark theme exclusively.
