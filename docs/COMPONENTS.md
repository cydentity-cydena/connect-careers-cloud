# Key Components Reference

## Layout Components

### `Navigation.tsx`
Main navigation bar with:
- Grouped dropdown menus (Explore, Learn, Community, Company)
- Role-based link filtering (`showForRoles` / `hideForRoles`)
- Mobile responsive with Sheet drawer
- Unread message badge counter
- Staff/admin conditional buttons

### `ProtectedRoute.tsx`
Auth guard wrapper that enforces:
1. Authentication (redirects to `/auth`)
2. MFA enrollment (redirects to `/security-settings`)
3. AAL2 MFA verification (redirects to `/mfa`)

### `Footer.tsx`
Site-wide footer with platform links, company links, legal links.

## Dashboard Components

### `Dashboard.tsx` (page)
Role-switching container. Checks `user_roles` table and renders:
- `CandidateDashboard` for candidates
- `EmployerDashboard` for employers
- `RecruiterDashboard` for recruiters
- `AdminDashboard` for admin/staff
- Admin `RoleSimulator` allows testing other role views

### Key Dashboard Widgets
| Component | Role | Purpose |
|-----------|------|---------|
| `ApplicationTracker` | Candidate | Track application pipeline stages |
| `BoostYourScore` | Candidate | Profile improvement suggestions |
| `CareerPathsAI` | Candidate | AI career predictions |
| `SecurityIQ` | Candidate | Daily security challenge |
| `SkillGenome3D` | Candidate | 3D skill visualization (Three.js) |
| `JobMatchGraph` | Candidate | Visual job match scores |
| `JobManagement` | Employer | Manage posted jobs |
| `ApplicationPipeline` | Employer | Kanban pipeline view |
| `AnalyticsDashboard` | Employer | Hiring metrics |
| `AssignedPods` | Employer | View assigned candidate pods |
| `RecruiterClientsList` | Recruiter | Client management |
| `RecruiterPlacements` | Recruiter | Track placements |
| `UserStatisticsCard` | Admin | Platform stats |
| `SeedDemoCandidates` | Admin | Generate test data |

## Subscription Components

### `useSubscription` Hook
```typescript
const {
  subscribed,        // boolean
  tier,              // 'employer_starter' | 'employer_growth' | ... | null
  subscription_end,  // ISO date string | null
  loading,           // boolean
  checkSubscription, // () => Promise<void>
  createCheckout,    // (priceId: string) => Promise<void>
  openCustomerPortal,// () => Promise<void>
} = useSubscription();
```

### `SubscriptionStatus`
Displays current plan, renewal date, manage/upgrade buttons.

### `UnlockAllocationDisplay`
Shows unlock usage progress bar, allocation vs actual, overage warnings.

## Profile & Verification

### `TrustScore`
Composite score from: identity verification, RTW, clearance, certifications, profile completeness.

### `HRReadyBadge`
Visual badge showing HR-Ready verification status.

### `VerificationPanel`
Admin panel to review and approve/reject verification requests.

### `CertificationManager`
Full CRUD for certifications with Credly import and AI verification.

## Community Components

### `CreatePostDialog` / `EditPostDialog`
Forum post creation/editing with category selection and AI content generation.

### `PostComments` / `PostReactions` / `CommentReactions`
Threaded comments with emoji reactions.

### `MentionTextarea`
Textarea with @mention autocomplete.

### `XPNotification`
Toast-style notification when XP is awarded.

## CTF Challenge Components

| Component | Challenge Type |
|-----------|---------------|
| `QuizChallenge` | Multiple choice security quiz |
| `ChessChallenge` | Chess-based cryptography puzzle |
| `CuriousWebChallenge` | Web exploitation simulation |
| `InjectionJunctionChallenge` | SQL injection challenge |
| `PortProbeChallenge` | Network port scanning |
| `DeepfakeDetectorChallenge` | Audio deepfake detection |
| `SOCInTheLoopChallenge` | SOC analyst simulation |

## Sharing Components

### `ShareProfileCard`
Shareable card with profile summary for social media.

### `ShareAchievementDialog` / `ShareableAchievementCard`
Share achievement unlocks.

### `SocialShareButtons`
LinkedIn, Twitter/X, copy link buttons.

## Employer-Specific

### `SmartCandidateFilters`
Advanced filtering: skills, clearance, certs, availability, location.

### `PodCandidatesView`
View candidates within an assigned pod.

### `UnlockProfileButton`
Triggers profile unlock with allocation/credit check.

### `CreditsPurchaseDialog`
Buy credit packs via Stripe.

### `HireConfirmationDialog`
Formal hire workflow.

## Marketplace Components

### `Marketplace.tsx` (page)
Three-tab layout:
- **Browse Talent** — Searchable talent directory with bounty availability badges
- **Task Bounties** — Scoped security engagement listings (employer-posted)
- **API & MCP** — REST API and MCP Server programmatic access docs

### `MarketplaceSettings.tsx`
Candidate dashboard settings including:
- Marketplace visibility toggle
- API/MCP bookability toggle
- **Available for bounties toggle** — Opts candidate into task bounty work, shows purple "Bounties" badge on talent cards

## Landing Page Components

### `Index.tsx` — Hero Section
- **Three Hiring Mode Cards**: Compact grid below hero CTA showing Book Talent, Post a Bounty, and AI Agent Hiring (Coming Soon)
- Links to `/profiles`, `/marketplace`, and future AI agent feature
- Trust signal strip with partner logos
