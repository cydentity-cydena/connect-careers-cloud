# Edge Functions Reference

All edge functions are Deno-based, deployed via Supabase Edge Functions. Located in `supabase/functions/`.

## Authentication & Security

| Function | Auth | Purpose |
|----------|------|---------|
| `secure-signup` | No | Validates signup against allowed_signups table, creates user with role |
| `admin-create-user` | Yes | Admin creates users manually |
| `admin-reset-mfa` | Yes | Admin resets user's MFA |
| `generate-mfa-backup-codes` | Yes | Generates MFA backup codes |
| `send-password-reset` | No | Sends password reset email |
| `send-verification-email` | No | Sends email verification |
| `delete-my-account` | Yes | User self-service account deletion |
| `delete-user` | Yes | Admin deletes a user |

## Payments & Subscriptions (Stripe)

| Function | Auth | Purpose |
|----------|------|---------|
| `create-checkout` | Yes | Creates Stripe checkout session for subscriptions |
| `check-subscription` | Yes | Verifies/syncs subscription status from Stripe |
| `customer-portal` | Yes | Opens Stripe Customer Portal |
| `purchase-credits` | Yes | Buy credit packs (one-time payment) |
| `purchase-additional-unlock` | Yes | Buy single unlocks at £75 each |
| `purchase-boost-placement` | Yes | Buy profile boost placement |
| `purchase-featured-slot` | Yes | Buy featured vendor slot |
| `purchase-featured-certification` | Yes | Buy featured certification slot |
| `purchase-unlock-pack` | Yes | Buy unlock pack |
| `unlock-profile` | Yes | Unlock a candidate profile (enforces tier limits) |
| `create-hire-payment` | Yes | Create payment for hiring |
| `create-connect-account` | No | Stripe Connect onboarding for marketplace talent |
| `connect-dashboard-link` | No | Stripe Connect dashboard link |
| `create-marketplace-payment` | No | Marketplace engagement payment |

## AI-Powered Features

| Function | Auth | Purpose |
|----------|------|---------|
| `career-assistant` | Yes | AI career guidance chatbot |
| `career-predictions` | Yes | AI career path predictions |
| `skills-assessment` | Yes | LLM-graded technical assessments |
| `create-custom-assessment` | Yes | Create employer-defined assessments |
| `generate-security-iq-challenge` | No | Generate security knowledge challenges |
| `verify-certification-ai` | Yes | AI verification of certification documents |
| `extract-cv-details` | Yes | AI extraction from uploaded CVs |
| `extract-job-details` | Yes | AI extraction from job descriptions |
| `generate-resume-from-profile` | Yes | AI resume generation from profile data |
| `moderate-content` | Yes | AI content moderation for community posts |
| `generate-daily-content` | Yes | Auto-generate daily community content |

## Communication

| Function | Auth | Purpose |
|----------|------|---------|
| `send-contact-email` | No | Contact form submission |
| `send-dm-notification` | No | Email notification for new DMs |
| `send-mention-notification` | No | Email notification for @mentions |
| `send-comment-notification` | No | Email notification for comments |
| `send-announcement-email` | No | Bulk announcement emails |
| `send-daily-challenge-email` | No | Daily CTF challenge email |
| `send-referral-blitz-email` | No | Referral campaign emails |
| `send-team-invitation` | Yes | Team member invitation email |
| `accept-team-invitation` | Yes | Accept team invite |
| `mailchimp-subscribe` | No | Mailchimp list subscription |
| `unsubscribe-email` | No | Email unsubscribe handler |

## Integrations

| Function | Auth | Purpose |
|----------|------|---------|
| `push-candidate-ats` | Yes | Push candidate to ATS provider |
| `push-candidate-webhook` | Yes | Push candidate to webhook |
| `cert-webhook-verify` | Yes | Verify certification via webhook |
| `verify-credly-api` | Yes | Verify Credly badges |
| `import-credly-badge` | Yes | Import badges from Credly |
| `sync-platform-stats` | Yes | Sync external platform stats |
| `fetch-youtube-playlist` | Yes | Fetch YouTube playlist data |
| `fetch-youtube-video-info` | Yes | Fetch YouTube video metadata |

## API & Marketplace

| Function | Auth | Purpose |
|----------|------|---------|
| `marketplace-api` | No | Public REST API for marketplace |
| `cydena-mcp` | No | MCP (Model Context Protocol) server |

## Admin & Operations

| Function | Auth | Purpose |
|----------|------|---------|
| `seed-demo-candidates` | Yes | Create demo candidate data |
| `create-demo-test-accounts` | Yes | Create test accounts |
| `backfill-achievements` | Yes | Backfill achievement unlocks |
| `cleanup-old-notifications` | Yes | Purge old notifications |
| `employer-analytics` | Yes | Generate employer analytics |
| `partner-analytics` | Yes | Partner performance analytics |
| `certifications-review-list` | Yes | List certs pending review |
| `verification-requests-list` | Yes | List verification requests |
| `hrready-get` | Yes | Get HR-Ready verification data |
| `hrready-upsert` | Yes | Update HR-Ready verification |
| `hrready-expire` | Yes | Expire outdated verifications |

## Other

| Function | Auth | Purpose |
|----------|------|---------|
| `track-referral` | No | Track referral source |
| `founding-20-application` | No | Early access application |
| `submit-bug-report` | Yes | Bug report submission |
| `award-points-helper` | Yes | Helper for XP awards |
| `boost-complete/courses/verify` | Yes | Boost-related operations |
| `allowed-signups` | — | Managed via admin UI |
