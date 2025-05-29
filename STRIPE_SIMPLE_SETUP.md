# Stripe Simple Setup Guide (Without Webhooks)

## What You Need From Stripe

### 1. API Keys
Go to **Developers** → **API Keys** in Stripe Dashboard:
- **Publishable Key**: `pk_test_...` (for frontend)
- **Secret Key**: `sk_test_...` (for backend)

### 2. Price IDs
After creating products with monthly/yearly prices:
- 6 Price IDs total (3 products × 2 price options each)

## Environment Variables

Add to your `.env.local`:

```bash
# Stripe Keys (required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# Monthly Price IDs
STRIPE_PRICE_ESSENTIALS_MONTHLY=price_abc123...
STRIPE_PRICE_STANDARD_MONTHLY=price_def456...
STRIPE_PRICE_PREMIUM_MONTHLY=price_ghi789...

# Yearly Price IDs  
STRIPE_PRICE_ESSENTIALS_YEARLY=price_jkl012...
STRIPE_PRICE_STANDARD_YEARLY=price_mno345...
STRIPE_PRICE_PREMIUM_YEARLY=price_pqr678...

# Webhook secret - NOT NEEDED FOR NOW
# STRIPE_WEBHOOK_SECRET=whsec_... (skip this)
```

## Current Limitations (Without Webhooks)

Since webhooks are not set up yet:

1. **Manual Status Checks**: Subscription status won't update automatically
2. **No Payment Failure Handling**: Failed payments won't be detected
3. **No Automatic Cancellations**: Cancelled subscriptions won't sync

## Workaround for Testing

After a successful checkout:
1. Check Stripe Dashboard for the new subscription
2. Manually update your database with subscription details
3. Or create a temporary admin function to sync subscription status

## When to Add Webhooks

Add webhooks when you need:
- Real-time subscription updates
- Automatic payment failure handling
- Subscription lifecycle management
- Production-ready billing

## Testing Without Webhooks

1. Create checkout session
2. Complete payment with test card: `4242 4242 4242 4242`
3. Check Stripe Dashboard for subscription
4. Manually verify in your app

## Quick Start

1. Add API keys to `.env.local`
2. Add Price IDs to `.env.local`
3. Restart dev server
4. Go to `/settings/billing`
5. Select a plan and test checkout

That's it! Webhooks can be added later when needed.