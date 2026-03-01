# Database Schema Reference

## Enums

```sql
-- User roles
app_role: 'candidate' | 'employer' | 'admin' | 'recruiter' | 'staff'

-- Subscription tiers
subscription_tier: 'employer_starter' | 'employer_growth' | 'employer_scale' | 'recruiter_pro' | 'enterprise'

-- Job types
job_type: 'full-time' | 'part-time' | 'contract' | 'freelance'

-- Pipeline stages
pipeline_stage: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired'

-- Achievement categories
achievement_category: 'profile' | 'skills' | 'certifications' | 'community' | 'training' | 'ctf'

-- ATS providers
ats_provider: 'workday' | 'greenhouse' | 'lever' | 'bamboohr' | 'webhook' | 'bullhorn'

-- Notification types
notification_type: 'application' | 'message' | 'interview' | 'offer' | 'system' | 'comment'

-- Candidate activation
candidate_activation_status: 'unclaimed' | 'invited' | 'claimed' | 'declined'
```

## Core Tables

### `profiles`
User profiles linked to auth.users. Contains: `id`, `full_name`, `username`, `email`, `avatar_url`, `bio`, `location`, `desired_job_title`, `is_public`, `created_at`, `updated_at`.

### `user_roles`
Role assignments. Columns: `id`, `user_id`, `role` (app_role enum), `created_at`.

### `candidate_profiles`
Extended candidate data: `user_id`, `title`, `years_experience`, `specializations[]`, `tools[]`, `industries[]`, `security_clearance`, `work_mode_preference`, `availability_status`, `day_rate_gbp`, `hourly_rate_gbp`, `ir35_status`, `linkedin_url`, `github_url`, `portfolio_url`, `resume_url`, `phone`, `professional_statement`, `willing_to_relocate`, `available_for_bounties` (boolean, default false — opts candidate into task bounty work), marketplace fields (`is_marketplace_visible`, `is_api_bookable`, `stripe_connect_account_id`).

### `candidate_verifications`
HR-Ready verification data. One-to-one with profiles. Fields include:
- **Identity:** `identity_status`, `identity_method`, `identity_checked_at`, `identity_expires_at`, `identity_name_on_id`
- **Right-to-Work:** `rtw_status`, `rtw_country`, `rtw_checked_at`, `rtw_expires_at`
- **Security Clearance:** `clearance_level`, `clearance_verified_at`, `clearance_expires_at`
- **Logistics:** `logistics_location`, `logistics_work_mode`, `logistics_notice_days`, `logistics_salary_band`
- **PCI QSA:** `pci_qsa_status`, `pci_qsa_company`
- `compliance_score`, `hr_ready` (boolean)

### `candidate_xp`
XP/gamification: `candidate_id`, `total_xp`, `level`, `community_points`, `community_level`, `profile_completion_percent`, `points_balance`.

### `certifications`
Candidate certifications: `candidate_id`, `name`, `issuer`, `credential_id`, `credential_url`, `issue_date`, `expiry_date`, `verification_status`, `source` (manual/credly/webhook), `proof_document_urls`.

### `candidate_skills`
Skill associations: `candidate_id`, `skill_id` (FK → skills), `proficiency_level`, `years_experience`.

### `skills`
Skill catalog: `id`, `name`, `category`.

### `jobs`
Job listings: `title`, `description`, `job_type`, `location`, `work_mode`, `remote_allowed`, `salary_min/max`, `required_skills[]`, `required_certifications[]`, `required_clearance`, `must_haves[]`, `nice_to_haves[]`, `company_id`, `client_id`, `created_by`, `is_active`, `managed_by_cydena`.

### `applications`
Job applications: `candidate_id`, `job_id`, `stage` (pipeline_stage), `cover_letter`, `resume_id`, `is_starred`, `status_notes`.

### `companies`
Employer companies: `name`, `description`, `industry`, `location`, `size`, `website`, `logo_url`, `created_by`.

### `clients`
Recruiter clients: `company_name`, `contact_name/email/phone`, `industry`, `status`, `recruiter_id`.

## Subscription & Credits

### `user_subscriptions`
Stripe subscription tracking: `user_id`, `tier` (subscription_tier), `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`, `status`, `current_period_start/end`, `cancel_at_period_end`.

### `employer_credits`
Credit balance & allocation: `employer_id`, `credits`, `credits_used`, `total_purchased`, `annual_unlocks_used`, `allocation_year`, `annual_allocation`.

### `credit_transactions`
Credit usage log: `employer_id`, `amount`, `price`, `transaction_type`, `status`.

## Community & Gamification

### `community_posts`
Forum posts: `user_id`, `title`, `content`, `category`, `tags[]`, `is_pinned`, `reactions_count`, `comments_count`.

### `post_comments`
Comments on posts: `post_id`, `user_id`, `content`, `parent_comment_id` (threading).

### `post_reactions` / `comment_reactions`
Emoji reactions on posts/comments.

### `achievements`
Achievement definitions: `name`, `description`, `icon`, `category`, `requirement_value`, `xp_reward`.

### `user_achievements`
Unlocked achievements per user.

### `community_activities`
Activity log: `user_id`, `activity_type`, `points_awarded`, `target_user_id`.

## CTF System

### `ctf_challenges`
Challenge definitions: `title`, `description`, `category`, `difficulty`, `points`, `flag` (hashed), `hints` (JSON), `file_url`.

### `ctf_submissions`
Submission attempts: `candidate_id`, `challenge_id`, `submitted_flag`, `is_correct`, `points_awarded`.

### `ctf_hint_usage`
Hint reveals: `candidate_id`, `challenge_id`, `hint_index`, `points_deducted`.

## Messaging

### `direct_messages`
DM system: `sender_id`, `recipient_id`, `content`, `is_read`, `read_at`, `edited_at`, `deleted_at`.

### `conversation_archives`
Archive conversations per user.

## Marketplace

### `marketplace_engagements`
Talent bookings: `client_id`, `talent_id`, `status`, `title`, `description`, `engagement_type`, `agreed_rate_gbp`, `start_date`, `end_date`, `stripe_payment_intent_id`. Supports both permanent hire engagements and task bounty engagements via the unified marketplace.

### `marketplace_api_keys`
API key management: `profile_id`, `key_hash`, `key_prefix`, `permissions[]`, `rate_limit_per_hour`.

## Integration Tables

### `ats_connections`
ATS provider configs: `user_id`, `provider` (ats_provider), `credentials` (JSON), `field_mappings`.

### `webhook_connections`
Custom webhook endpoints: `user_id`, `name`, `url`, `secret`, `events[]`.

## Learning

### `youtube_learning_paths`
Curated YouTube playlists: `title`, `description`, `difficulty_level`, `total_xp`, `video_count`, `is_active`.

### `youtube_videos`
Individual videos in paths: `learning_path_id`, `title`, `youtube_video_id`, `duration_seconds`, `xp_reward`, `order_index`.

### `partner_courses`
Training partner courses with completion tracking.

## Key Database Functions

| Function | Purpose |
|----------|---------|
| `get_tier_unlock_limit(tier)` | Returns annual unlock allocation per tier |
| `get_tier_overage_price(tier)` | Returns per-unlock overage price |
| `get_tier_seat_limit(tier)` | Returns max team seats per tier |
| `get_tier_bounty_limit(tier)` | Returns bounty posting limit |
| `has_role(user_id, role)` | Checks if user has a specific role |
| `verify_ctf_flag(challenge_id, flag)` | Server-side flag verification |
| `calculate_job_matches(candidate_id)` | Returns job match scores |
| `get_public_profile(profile_id)` | Safe public profile data |
| `log_profile_view(viewer_id, candidate_id)` | Track profile views |
| `mark_as_founding_200(user_id)` | Mark early access users |

## Views

### `ctf_leaderboard`
Aggregated CTF scores per user.

### `ctf_challenges_public`
Public view of challenges (flags hidden).
