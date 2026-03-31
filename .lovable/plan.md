

## Plan: Remove Email Verification Flow — Sign In Immediately After Sign Up

### What Changes

Users will be auto-confirmed on signup and redirected to sign in immediately, removing the email verification step entirely.

### Steps

**1. Enable auto-confirm in auth settings**
- Use `cloud--configure_auth` to enable auto-confirm for email signups so users are confirmed immediately on creation.

**2. Update `secure-signup` edge function**
- Change `email_confirm: false` → `email_confirm: true` on line 161 (this auto-confirms the user)
- Remove the verification link generation block (lines 175-190)
- Remove the verification email sending block (lines 409-437)
- Change response `emailVerificationRequired` to `false`

**3. Update `Auth.tsx` — remove verification screen**
- After successful signup, instead of showing the "Check Your Email" screen, sign the user in directly with `supabase.auth.signInWithPassword()` and navigate to `/security-settings` (for MFA setup) or `/dashboard`
- Remove the `showVerificationSent` / `verificationEmail` state and the verification card UI (lines 606-643)
- Remove the `Mail` icon import if no longer used

**4. Remove `VerifyEmail` page and route**
- Delete `src/pages/VerifyEmail.tsx`
- Remove the `/verify-email` route from `App.tsx`
- Remove the lazy import for `VerifyEmail`

**5. Remove `send-verification-email` edge function**
- Delete `supabase/functions/send-verification-email/index.ts`
- Clean up the deployed function

**6. Deploy updated edge function**
- Redeploy `secure-signup`

### Technical Detail

The `secure-signup` edge function currently uses `supabaseAdmin.auth.admin.createUser({ email_confirm: false })` which creates unverified users. Changing to `email_confirm: true` marks users as verified at creation time, allowing immediate sign-in. After signup succeeds, the frontend will call `signInWithPassword` to establish a session and redirect to the dashboard/security settings.

