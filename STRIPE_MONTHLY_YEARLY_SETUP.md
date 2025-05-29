# Stripe Monthly/Yearly Pricing Setup Guide

## 1. Creating Prices in Stripe Dashboard

For **each** product (Essentials, Standard, Premium), you need to create **two prices**:

### Example: Essentials Plan

1. **Monthly Price**:
   - Amount: £29
   - Billing period: Monthly
   - Price ID generated: `price_1OZK4hB7QpGt...`

2. **Yearly Price**:
   - Amount: £290 (2 months free = £29 × 10)
   - Billing period: Yearly
   - Price ID generated: `price_1OZK7kC8RqHu...`

### In Stripe Dashboard:

1. Go to your product (e.g., "Charity Prep Essentials")
2. Click **"Add another price"**
3. Create both monthly and yearly options
4. You'll have 2 price IDs per product

## 2. Update Your .env.local

```bash
# API Keys (required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Essentials Price IDs
STRIPE_PRICE_ESSENTIALS_MONTHLY=price_1OZK4hB7QpGt...
STRIPE_PRICE_ESSENTIALS_YEARLY=price_1OZK7kC8RqHu...

# Standard Price IDs
STRIPE_PRICE_STANDARD_MONTHLY=price_1OZK5iD9SrIv...
STRIPE_PRICE_STANDARD_YEARLY=price_1OZK8lE0TsJw...

# Premium Price IDs
STRIPE_PRICE_PREMIUM_MONTHLY=price_1OZK6jF1UtKx...
STRIPE_PRICE_PREMIUM_YEARLY=price_1OZK9mG2VuLy...

# Webhook secret - NOT NEEDED YET
# STRIPE_WEBHOOK_SECRET=whsec_... (skip for now)
```

## 3. How the Code Works

### Pricing Toggle Component
- Users can switch between Monthly/Yearly view
- Shows savings for yearly plans
- Displays monthly equivalent for yearly prices

### Price Selection Flow
```javascript
// When user selects a plan:
1. User clicks "Get Started" on Standard/Yearly
2. Code gets: tier="STANDARD", cycle="yearly"
3. getPriceId("STANDARD", "yearly") returns price_1OZK8lE0TsJw...
4. Creates checkout with that specific price ID
```

## 4. Quick Setup Checklist

- [ ] Create monthly price for Essentials (£29/month)
- [ ] Create yearly price for Essentials (£290/year)
- [ ] Create monthly price for Standard (£79/month)
- [ ] Create yearly price for Standard (£790/year)
- [ ] Create monthly price for Premium (£149/month)
- [ ] Create yearly price for Premium (£1490/year)
- [ ] Copy all 6 price IDs to .env.local
- [ ] Restart your dev server after updating .env.local

## 5. Testing

1. Go to `/settings/billing`
2. Toggle between Monthly/Yearly
3. Click any "Get Started" button
4. Check console for the price ID being used
5. Should redirect to Stripe Checkout

## 6. Common Issues

### "Invalid price ID"
- Make sure you copied the Price ID, not Product ID
- Price IDs start with `price_`
- Check for typos in .env.local

### Toggle not working
- Ensure all 6 price IDs are in .env.local
- Restart Next.js after adding env vars

### Wrong price shown
- Verify the price amounts in Stripe match your code
- Check that yearly prices have correct discount

## 7. Pricing Structure

| Plan | Monthly | Yearly | Savings |
|------|---------|---------|---------|
| Essentials | £29 | £290 | £58 (2 months) |
| Standard | £79 | £790 | £158 (2 months) |
| Premium | £149 | £1,490 | £298 (2 months) |

## 8. Next Steps

After setup:
1. Test checkout with test card: 4242 4242 4242 4242
2. Verify subscription is created in Stripe
3. Check that correct tier/price is saved in database
4. Test switching between monthly/yearly subscriptions