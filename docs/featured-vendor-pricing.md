# Featured Vendor Pricing System

## Overview
Cydena offers featured placement for training partners and certification providers with a tiered, position-based pricing model and automatic volume discounts.

## Pricing Structure

### Slot Positions (Weekly Rates)

All pricing is the same for both Training Partners and Certification Providers:

| Slot Position | Weekly Rate | Visual Treatment | Badge |
|--------------|-------------|------------------|-------|
| **Slot 1** | $399/week | 4px yellow border, largest scale (105%) | PREMIUM (yellow) |
| **Slot 2** | $349/week | 3px orange border, full scale (100%) | FEATURED (orange) |
| **Slot 3** | $299/week | 2px blue border, slightly smaller (95%) | FEATURED (blue) |
| **Slot 4** | $249/week | 2px purple border, smallest (90%) | FEATURED (purple) |

### Volume Discounts (Automatic)

Discounts are calculated automatically based on purchase duration:

| Duration | Discount | Example (Slot 1) |
|----------|----------|------------------|
| 1-3 weeks | 0% | $399/week × 3 = $1,197 |
| 4-7 weeks | **10% off** | $399 × 4 × 0.90 = $1,436.40 |
| 8-11 weeks | **15% off** | $399 × 8 × 0.85 = $2,713.20 |
| 12+ weeks | **20% off** | $399 × 12 × 0.80 = $3,830.40 |

## Features

### Fully Automated System
- ✅ Automatic slot conflict checking prevents double-booking
- ✅ Stripe checkout with dynamic pricing calculation
- ✅ Volume discounts applied automatically
- ✅ Future scheduling available (start_date optional)
- ✅ No manual admin approval needed after payment

### Visual Hierarchy
The UI displays slots with clear visual differentiation:
- Slot 1: Largest, gold/yellow theme, most prominent
- Slot 2: Orange theme, high visibility  
- Slot 3: Blue theme, standard featured
- Slot 4: Purple theme, entry-level featured

### Stripe Integration
- Fixed Stripe product/price IDs for tracking:
  - Slot 1: `price_1SG4ycFnZFXoJvyLWNgE0o02`
  - Slot 2: `price_1SG4ynDOcfakZuIaAMyU78YG`
  - Slot 3: `price_1SG4yxFnZFXoJvyL1PIVJ7Mo`
  - Slot 4: `price_1SG4z7DOcfakZuIaql09IhKv`
- Dynamic pricing with metadata for full transparency
- Checkout metadata includes all pricing details

## Example Calculations

### Slot 1, 8 weeks
- Base: $399 × 8 = $3,192
- Discount: 15% (8-11 weeks)
- **Total: $2,713.20**

### Slot 3, 12 weeks  
- Base: $299 × 12 = $3,588
- Discount: 20% (12+ weeks)
- **Total: $2,870.40**

### Slot 4, 4 weeks
- Base: $249 × 4 = $996
- Discount: 10% (4-7 weeks)
- **Total: $896.40**

## Technical Implementation

### Edge Functions
- `purchase-featured-slot` - Training partners
- `purchase-featured-certification` - Certification providers

Both functions:
1. Validate slot position (1-4)
2. Check for date range conflicts
3. Calculate base price + volume discount
4. Create Stripe checkout session
5. Create pending database record
6. Return checkout URL with pricing breakdown

### Database Tables
- `featured_training_partners` - Training partner featured slots
- `featured_certifications` - Certification provider featured slots

Both have:
- `slot_position` (1-4)
- `start_date` / `end_date` (for conflict checking)
- `payment_status` ('pending' or 'completed')
- `amount_paid` (final amount after discounts)

### Frontend Display
- Training: `/training` page
- Certifications: `/certifications-catalog` page
- Partnerships info: `/partnerships` page

All featured items display with:
- Slot-specific visual styling
- Position-based sizing/prominence
- Color-coded badges
- Tiered borders and backgrounds

## Benefits

### For Vendors
- **Transparent pricing** - No hidden fees, all costs clear upfront
- **Fair system** - Pay more for better placement, everyone plays by same rules
- **Volume incentives** - Bigger commitments = bigger savings
- **Automated** - No back-and-forth negotiation, instant checkout
- **Guaranteed placement** - Slot checking prevents conflicts

### For Cydena
- **Premium revenue** - Top slots command premium prices
- **Volume locking** - Discounts encourage longer commitments
- **Scalable** - Fully automated, no manual work
- **Trackable** - Stripe metadata provides full transparency
- **Competitive** - Position-based pricing creates healthy competition

## Future Enhancements

Potential improvements:
- Real-time slot availability calendar
- Advanced analytics dashboard for vendors
- A/B testing different slot arrangements
- Dynamic pricing based on demand
- Auction-style bidding for premium slots
- Multi-slot bulk discounts

---

Last updated: January 2025
