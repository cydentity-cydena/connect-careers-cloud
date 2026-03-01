# Feature Guide

## 1. Candidate Features (Free)

### Profile & Verification
- **Profile creation** with bio, skills, certifications, education, experience
- **HR-Ready verification**: Automated Yoti identity + Right-to-Work check, security clearance, logistics
- **Yoti integration**: Automated identity & RTW verification (no manual review — UK Home Office compliant)
- **Certification management**: Manual add, Credly import, AI verification, webhook auto-verify
- **Multiple resumes**: Upload and manage multiple CVs
- **Platform profiles**: Link TryHackMe, HackTheBox, etc.
- **Professional statement**: AI-assisted writing

### Gamification & Community
- **XP system**: Earn XP for profile completion, certifications, community activity, CTF
- **Leaderboard**: Ranked by total XP
- **Achievements**: Unlockable badges across 6 categories
- **Community forum**: Posts, comments, reactions, @mentions
- **Peer endorsements**: Other candidates endorse your skills
- **Profile strength meter**: Visual completion indicator

### Learning & Development
- **Free learning paths**: Curated YouTube courses with XP tracking
- **Training partner courses**: Third-party course completions
- **CTF challenges**: 7 challenge types (Quiz, Chess, Web, Injection, Port Probe, Deepfake Detector, SOC-in-the-Loop)
- **Skills assessments**: AI-graded technical assessments
- **Career AI assistant**: Chat-based career guidance

### Job Search
- **Job board**: Browse active listings with filtering
- **Application tracking**: Real-time pipeline status (Applied → Screening → Interview → Offer)
- **Job match scoring**: AI calculates match % based on skills, certs, experience
- **CV auto-populate**: AI extracts details from uploaded CVs

## 2. Employer Features (Paid)

### Talent Discovery
- **Profile search**: Browse verified candidate profiles
- **Smart filters**: Filter by skills, clearance, certifications, location, availability
- **Profile unlocks**: Reveal full contact details (uses allocation or credits)
- **Saved searches**: Save and recall search criteria
- **Candidate pods**: Curated groups of pre-vetted candidates

### Hiring Pipeline
- **Application pipeline**: Kanban-style stage management
- **Application cards**: Review applications with match scores
- **Bulk actions**: Multi-select candidates for batch operations
- **Candidate notes**: Internal notes per candidate
- **Hire confirmation**: Formal hire workflow with payment

### Analytics & Integrations
- **Analytics dashboard**: Hiring metrics, pipeline stats
- **ATS integrations**: Push candidates to Workday, Greenhouse, Lever, BambooHR, Bullhorn
- **Webhook connections**: Custom webhook endpoints
- **Integration logs**: Track all push operations

### Employer Verification (Required)
- **Yoti company verification**: Automated identity check before accessing candidate data
- **Verified employer badge**: Displayed to candidates to build trust
- **Cleared-tier access**: Only verified employers can query clearance-match system

### Team Management
- **Team members**: Invite and manage team seats
- **Seat limits**: Enforced per subscription tier
- **Team invitations**: Email-based invite flow

### Assessments
- **Custom assessments**: Create role-specific assessments
- **Send assessments**: Send to specific candidates
- **Assessment review**: Review AI-graded responses

## 3. Recruiter Features (Paid)

### Client Management
- **Client creation**: Add hiring clients
- **Client access logs**: Track who accessed what
- **Placements**: Track successful placements

### Candidate Import
- **Bulk import**: Import candidate batches
- **Import tracking**: View import batches and status
- **Imported candidates**: Manage imported candidate pool

## 4. Admin Features

### User Management
- **User list**: View all users with roles
- **Role assignment**: Assign/revoke roles
- **Subscription overrides**: Manual tier overrides
- **Allowed signups**: Whitelist email addresses for signup
- **User statistics**: Platform usage stats

### Content Management
- **Job moderation**: Review/approve job listings
- **Verification review**: Review HR-Ready verification requests
- **Certification review**: Review certification verification requests
- **CTF management**: Create/edit CTF challenges
- **Learning paths management**: Manage YouTube learning paths
- **Partner communities management**: Manage partner listings

### Operations
- **Pod management**: Create and manage candidate pods
- **Partner analytics**: View partner performance data
- **Assessment review**: Review submitted assessments
- **Role simulator**: Admin can simulate any role for testing

## 5. Marketplace (Unified Talent & Bounty Platform)

### Three-Tab Structure
- **Browse Talent**: Search verified candidates for permanent/contract hire
- **Task Bounties**: Scoped security task engagements (pen tests, audits, etc.)
- **API & MCP**: Programmatic access via REST API and Model Context Protocol

### Talent Features
- **Bounty availability toggle**: Candidates opt in via `available_for_bounties` flag in profile settings
- **Bounty availability badge**: Purple "Bounties" badge on talent cards for opted-in candidates
- **Booking system**: Book talent for engagements
- **Stripe Connect**: Talent receives payments via Connect

### Programmatic Access
- **REST API**: SHA-256 key-authenticated API for talent search and booking
- **MCP server**: Model Context Protocol for AI agent integration
- **API key management**: Generate and manage API keys

## 6. Marketing & Sales

### Export Pages (PDF-optimized)
- `/marketing/candidates` — Candidate-facing one-pager
- `/marketing/employers` — Employer-facing one-pager
- `/marketing/recruiters` — Recruiter-facing one-pager
- `/marketing/partners` — Partner-facing one-pager

### Presentation Decks
- `/employer-pitch-deck` — Employer sales presentation
- `/investor-pitch-deck` — Investor presentation

### Competitive
- `/why-cydena` — Comparison page vs volume platforms

### Lead Generation
- `/Early-Access-200` — Founding member application
- Mailchimp email signup integration

## 7. Security Features

- **MFA (TOTP)**: Required for all authenticated users
- **Backup codes**: Downloadable MFA recovery codes
- **Email verification**: Required before sign-in
- **Password policy**: Min 12 chars, uppercase, lowercase, number, special char
- **Professional email**: Employer/recruiter signups require company email
- **Rate limiting**: Profile view rate limiting
- **RLS policies**: Row-level security on all tables
- **Content moderation**: AI moderation on community posts
