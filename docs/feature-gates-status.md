# Feature Gates Implementation Status

## ✅ PHASE 1: UNLOCK ALLOCATION & OVERAGE - IMPLEMENTED

### Database Changes
- Added `annual_unlocks_used` and `allocation_year` to `employer_credits` table
- Created `get_tier_unlock_limit()` function - Returns unlock limits per tier
- Created `get_tier_overage_price()` function - Returns overage pricing per tier
- Created `get_tier_seat_limit()` function - Returns seat limits per tier
- Created `team_members` table for team management (seats)

### Updated Functions
**`unlock-profile` Edge Function** - Now enforces tier limits:
1. Checks user's subscription tier
2. Tracks annual unlock usage
3. Resets counter each calendar year
4. **Within Allocation**: Uses tier allocation (doesn't deduct purchased credits)
5. **Beyond Allocation**: Deducts purchased credits at tier-specific overage rate
6. **No Subscription**: Uses purchased credits only
7. Returns detailed usage stats

### Tier Limits Enforced

| Tier | Annual Allocation | Overage Price |
|------|------------------|---------------|
| Starter | 10/year | £15/unlock |
| Growth | 25/year | £12/unlock |
| Scale | 75/year | £10/unlock |
| Recruiter Pro | 50/year | £10/unlock |

### How It Works

**Example: Growth Tier User**
- Subscribes to Growth (£299/mo)
- Gets 25 unlocks included per year
- Unlocks 1-25: Free (within allocation)
- Unlock 26+: £12 each (charged from purchased credits)
- Needs to buy credit packs to continue after allocation

**Revenue Impact:**
- Month 1: User pays £299 subscription
- Uses all 25 allocated unlocks
- Buys 10-credit pack for £120
- Uses 5 more unlocks (@ £12 each = £60 value)
- **Total revenue:** £299 + £120 = £419 vs £299 flat rate

### Frontend Components Created

1. **`UnlockAllocationDisplay`** - Shows:
   - Usage progress bar
   - Allocation vs actual usage
   - Warning when approaching limit
   - Alert when in overage mode
   - Upgrade prompts

2. **`useSeatLimit` Hook** - Provides:
   - Current team size
   - Maximum seats for tier
   - `canAddSeat` boolean
   - `isAtLimit` boolean

## ⏳ PHASE 2: SEAT LIMITS - PARTIALLY IMPLEMENTED

### Database Ready
- `team_members` table created
- Seat limits defined in `get_tier_seat_limit()`
- RLS policies in place

### Still Needed
- [ ] Team invitation UI
- [ ] Team management page
- [ ] Enforce limits on team member adds
- [ ] Display seat usage in dashboard

**Seat Limits:**
- Starter: 1 seat
- Growth: 3 seats
- Scale: 6 seats
- Recruiter Pro: 3 seats

## ❌ PHASE 3: ADVANCED FEATURES - NOT IMPLEMENTED

These features are advertised but don't exist:

### Employer - Growth & Scale Tiers
- [ ] **Advanced filters** - Need to build premium search filters
- [ ] **Saved searches** - Doesn't exist
- [ ] **Talent pool sharing** - Doesn't exist
- [ ] **Role pipelines** - Doesn't exist
- [ ] **Advanced analytics** - Doesn't exist

### Recruiter - Pro Tier
- [ ] **Bulk candidate actions** - Doesn't exist
- [ ] **Advanced filters** - Same as employer tiers

### Enterprise Tier
- [ ] **ATS integrations** - Doesn't exist
- [ ] **API access** - Not built
- [ ] **SSO** - Not implemented
- [ ] **Private talent pools** - Doesn't exist
- [ ] **Internal mobility** - Doesn't exist

## What Works Now

### ✅ Fully Functional
1. **Subscription Purchase** - Users can subscribe to any tier via Stripe
2. **Subscription Tracking** - System knows user's tier and status
3. **Unlock Allocation** - Tier limits enforced, overage charged
4. **Usage Display** - Users see their allocation usage
5. **Overage Warnings** - Alerts when approaching/exceeding limits

### 🟡 Partially Working
1. **Seat Limits** - Database ready, UI not built
2. **Support Tiers** - Tiers defined but not differentiated in practice

### ❌ Not Working
1. **Advanced Features** - All premium features don't exist yet
2. **Feature Gates** - No restrictions on non-unlock features
3. **Team Management** - Can't add/manage team members

## Next Implementation Priority

### HIGH PRIORITY (Revenue Critical)
1. ✅ **Unlock allocation & overage** - DONE
2. **Seat limits UI** - Block team adds when at limit
3. **Credit purchase packs** - Let users buy overages

### MEDIUM PRIORITY (User Experience)
4. **Advanced search filters** - Build premium filters
5. **Saved searches** - Save/recall search criteria
6. **Analytics dashboard** - Usage stats, ROI metrics

### LOW PRIORITY (Nice to Have)
7. **Bulk actions** - Multi-select candidates
8. **Talent pool sharing** - Team collaboration
9. **Role pipelines** - Custom hiring workflows

## Testing the Implementation

### Test Unlock Allocation:
1. Subscribe to Starter tier (10 unlocks/year)
2. Unlock 10 candidates → Should work fine
3. Try 11th unlock → Should require purchased credits
4. Check `annual_unlocks_used` in database

### Test Overage Pricing:
1. Ensure user has purchased credits
2. Exceed annual allocation
3. Verify credit deduction
4. Check `credit_transactions` for overage charge

### Verify Annual Reset:
1. Manually update `allocation_year` to previous year
2. Try unlock → Should reset counter to 0
3. Check `annual_unlocks_used` = 1 after unlock

## Revenue Model Summary

**Old Model** (What you had):
- Flat £99-£999/mo
- Unlimited unlocks included
- Revenue cap per customer

**New Model** (What you have now):
- Base £99-£699/mo
- Limited unlocks (10-75/year)
- Overage at £10-£15/unlock
- Revenue scales with usage

**Impact:**
- Active employer hiring 2-3 people/month
- Uses ~30 unlocks/year
- On Growth tier (25 included)
- Pays £299/mo base + (5 × £12) = £359/mo average
- vs flat £299/mo = **20% more revenue**