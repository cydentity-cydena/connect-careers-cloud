# Subscription System Implementation

## Overview
Implemented a complete Stripe subscription system with tiered pricing, feature gates, and subscription management.

## Stripe Products Created

### Employer Tiers
1. **Employer - Starter** (£99/mo)
   - Product ID: `prod_TCRgPZQk0Aa0ZZ`
   - Price ID: `price_1SG2n2FnZFXoJvyLkjI5aoMI`
   - Features: 1 hiring seat, 10 unlocks/year, then £15/unlock

2. **Employer - Growth** (£299/mo) ⭐ Most Popular
   - Product ID: `prod_TCRgVIftwze35Y`
   - Price ID: `price_1SG2nbFnZFXoJvyLkAKznYqi`
   - Features: 3 hiring seats, 25 unlocks/year, then £12/unlock

3. **Employer - Scale** (£699/mo)
   - Product ID: `prod_TCRh0S3qTcJLt0`
   - Price ID: `price_1SG2nqFnZFXoJvyLU2rLqOXz`
   - Features: 6 hiring seats, 75 unlocks/year, then £10/unlock

### Recruiter Tier
4. **Recruiter - Pro** (£499/mo)
   - Product ID: `prod_TCRhnyMkhNWv30`
   - Price ID: `price_1SG2oLFnZFXoJvyLlP8GNZuX`
   - Features: 3 recruiter seats, 50 unlocks/year, then £10/unlock

## Database Schema

### `user_subscriptions` Table
Tracks active subscriptions for users:
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `tier` (subscription_tier enum)
- `stripe_customer_id` (text)
- `stripe_subscription_id` (text)
- `stripe_price_id` (text)
- `status` (text, default: 'active')
- `current_period_start` (timestamptz)
- `current_period_end` (timestamptz)
- `cancel_at_period_end` (boolean)
- `created_at`, `updated_at` (timestamptz)

### `subscription_tier` Enum
- `employer_starter`
- `employer_growth`
- `employer_scale`
- `recruiter_pro`
- `enterprise`

## Edge Functions

### 1. `create-checkout`
Creates Stripe checkout sessions for subscriptions.
- **Input**: `{ tier: string }` (e.g., 'employer_starter')
- **Output**: `{ url: string }` (Stripe checkout URL)
- **Usage**: Opens checkout in new tab when user selects a pricing tier

### 2. `check-subscription`
Verifies and syncs subscription status from Stripe.
- **Input**: None (uses authenticated user)
- **Output**: `{ subscribed: boolean, tier: string | null, subscription_end: string | null }`
- **Usage**: Called on login, auth changes, and manually via refresh
- **Side effect**: Syncs subscription data to database

### 3. `customer-portal`
Opens Stripe Customer Portal for subscription management.
- **Input**: None (uses authenticated user)
- **Output**: `{ url: string }` (Stripe portal URL)
- **Usage**: Allows users to cancel, upgrade, or update payment methods

## Frontend Components

### `useSubscription` Hook
Location: `src/hooks/useSubscription.ts`

Manages subscription state and actions:
```typescript
const {
  subscribed,      // boolean: has active subscription
  tier,            // SubscriptionTier | null
  subscription_end,// string | null (ISO date)
  loading,         // boolean
  checkSubscription, // () => Promise<void>
  createCheckout,  // (tier: string) => Promise<void>
  openCustomerPortal, // () => Promise<void>
} = useSubscription();
```

### `SubscriptionStatus` Component
Location: `src/components/subscription/SubscriptionStatus.tsx`

Displays current subscription status with:
- Active subscription badge
- Renewal date
- "Manage Subscription" button (opens Stripe portal)
- "Change Plan" button (goes to pricing page)
- "View Pricing Plans" button (if no subscription)

### Updated Components
1. **Pricing Page** (`src/pages/Pricing.tsx`)
   - Shows "Current Plan" for active tier
   - Handles authentication redirect
   - Opens Stripe checkout on tier selection

2. **Employer Dashboard** (`src/components/dashboard/EmployerDashboard.tsx`)
   - Displays `SubscriptionStatus` component

## User Flow

### New User Subscription Flow
1. User visits `/pricing`
2. Clicks "Choose [Tier]" button
3. If not authenticated → redirect to `/auth`
4. If authenticated → opens Stripe checkout in new tab
5. User completes payment on Stripe
6. Redirected to `/dashboard?subscription=success`
7. `check-subscription` automatically called
8. Subscription synced to database
9. UI updates to show "Current Plan"

### Subscription Management Flow
1. User clicks "Manage Subscription" in dashboard
2. Opens Stripe Customer Portal in new tab
3. User can:
   - Cancel subscription
   - Update payment method
   - View invoices
   - Change billing details
4. Returns to `/dashboard`
5. `check-subscription` refreshes status

## Security
- All Stripe operations in edge functions (server-side)
- Row-Level Security on `user_subscriptions` table
- Users can only view their own subscription
- Service role can manage all subscriptions
- Admins can view all subscriptions

## Next Steps: Feature Gating

To implement subscription-based feature restrictions:

### 1. Unlock Allocation Tracking
```typescript
// In unlock logic, check:
const { tier } = useSubscription();
const limits = {
  employer_starter: 10,
  employer_growth: 25,
  employer_scale: 75,
  recruiter_pro: 50,
};
const yearlyLimit = limits[tier];
// Compare with creditsUsed, charge overage at tier-specific rate
```

### 2. Seat Limits
```typescript
// When adding team members, check:
const seatLimits = {
  employer_starter: 1,
  employer_growth: 3,
  employer_scale: 6,
  recruiter_pro: 3,
};
if (teamMembers.length >= seatLimits[tier]) {
  // Show upgrade prompt
}
```

### 3. Premium Features
```typescript
// For advanced features, check tier:
const hasAccess = ['employer_growth', 'employer_scale'].includes(tier);
if (!hasAccess) {
  // Show upgrade CTA
}
```

## Pricing Strategy

### Current Model: Hybrid
- Base subscription: £99-£699/mo
- Included unlocks: 10-75/year
- Overage pricing: £10-£15 per unlock

### vs Traditional Agencies
- Agencies: £7,500-£15,000 per hire (15-25% of salary)
- Cydena: 70-80% cheaper
- Predictable monthly costs
- No retainer fees
- Pay-per-unlock after allocation

## Stripe Portal Setup Required

⚠️ **IMPORTANT**: User must activate Stripe Customer Portal:
1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Click "Activate" on Customer Portal
3. Configure allowed actions (cancel, upgrade, payment methods)

## Testing

### Test Subscriptions
Use Stripe test mode cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Manual Testing Checklist
- [ ] Create checkout session
- [ ] Complete payment flow
- [ ] Verify subscription in database
- [ ] Check subscription status shows correctly
- [ ] Test Customer Portal access
- [ ] Test plan switching
- [ ] Test cancellation
- [ ] Test annual vs monthly toggle (frontend only currently)

## Known Limitations

1. **Annual billing not implemented in Stripe**
   - UI shows annual discount toggle
   - Only monthly prices created in Stripe
   - Need to create annual price IDs to enable

2. **Feature gates not enforced**
   - Subscription tracking works
   - Need to add checks in:
     - Profile unlock flow
     - Team member invites
     - Advanced search/filters
     - Analytics access

3. **No webhook handling**
   - Subscription status synced on check
   - Consider webhooks for real-time updates
   - Handle failed payments, cancellations

4. **Unlock overage not automated**
   - Allocation limits defined
   - Need to implement pay-per-unlock charging
   - Requires credit purchase flow integration

## Revenue Potential

### Example Scenarios

**Small Employer (Starter Plan)**
- £99/mo = £1,188/year
- 10 unlocks included
- If they hire 2 people → still paid £1,188 (vs £15,000 agency fees)
- ROI: Customer saves £13,812, you earn £1,188

**Growing Company (Growth Plan)**
- £299/mo = £3,588/year  
- 25 unlocks included
- If they use 30 unlocks = £3,588 + (5 × £12) = £3,648
- If they hire 5 people → paid £3,648 (vs £37,500 agency fees)
- ROI: Customer saves £33,852, you earn £3,648

**Enterprise (Scale Plan)**
- £699/mo = £8,388/year
- 75 unlocks included
- If they use 100 unlocks = £8,388 + (25 × £10) = £8,638
- If they hire 15 people → paid £8,638 (vs £112,500 agency fees)
- ROI: Customer saves £103,862, you earn £8,638

### vs Traditional Model
- Traditional: ~£9,000 per hire (one-time)
- Subscription: £1,188-£8,388/year (recurring)
- Lower per-transaction value
- Higher customer lifetime value
- More predictable revenue
- Lower barrier to entry