# Stripe Integration Setup Guide

## 1. Stripe Dashboard Setup

### Create Your Stripe Account
1. Go to https://dashboard.stripe.com
2. Sign up or log in
3. Switch to **Test Mode** (toggle in top right)

### Create Products and Prices

1. Navigate to **Products** → **Add Product**

2. Create three products:

   **Essentials Plan**
   - Name: "Charity Prep Essentials"
   - Description: "Perfect for small charities under £100k"
   - Pricing: £199/year (recurring)
   - Features to add in metadata:
     - `users`: "2"
     - `storage_mb`: "100"
     - `tier`: "essentials"

   **Standard Plan**
   - Name: "Charity Prep Standard"
   - Description: "For growing charities £100k-1M"
   - Pricing: £549/year (recurring)
   - Features in metadata:
     - `users`: "5"
     - `storage_mb`: "1000"
     - `tier`: "standard"

   **Premium Plan**
   - Name: "Charity Prep Premium"
   - Description: "For large charities over £1M"
   - Pricing: £1,199/year (recurring)
   - Features in metadata:
     - `users`: "20"
     - `storage_mb`: "10000"
     - `tier`: "premium"

3. Note down the **Price IDs** (they look like `price_1234567890abcdef`)

### Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.created`
   - `customer.updated`

5. Copy the **Webhook Secret** (starts with `whsec_`)

### Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

## 2. Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
STRIPE_PRICE_ESSENTIALS=price_your_essentials_price_id
STRIPE_PRICE_STANDARD=price_your_standard_price_id  
STRIPE_PRICE_PREMIUM=price_your_premium_price_id

# Optional: Customer Portal
STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/p/login/test_your_portal_id
```

## 3. Database Migration

Run the migration to add Stripe fields:

```bash
# Using MCP:
mcp__supabase__apply_migration --project_id=your_project_id --name=add_stripe_support --query="$(cat supabase/migrations/016_add_stripe_to_subscriptions.sql)"

# Or using Supabase CLI:
supabase db push
```

## 4. Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

## 5. Test the Integration

### Test Checkout Flow:
1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC
4. Any billing postal code

### Test Subscription Management:
1. Create a test subscription
2. Check webhook logs in Stripe Dashboard
3. Verify subscription created in your database

## 6. Stripe Customer Portal Setup

1. Go to **Settings** → **Billing** → **Customer Portal**
2. Configure:
   - Allow customers to update payment methods
   - Allow customers to cancel subscriptions
   - Show invoice history
3. Save settings
4. Get the portal link configuration ID

## 7. Production Checklist

Before going live:

- [ ] Switch to Live Mode in Stripe
- [ ] Update all API keys to production keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods
- [ ] Set up proper error monitoring
- [ ] Configure tax settings if needed
- [ ] Set up email receipts
- [ ] Configure retry logic for failed payments

## Webhook Security

The webhook endpoint automatically verifies signatures. Make sure:
1. The webhook secret is correctly set
2. Raw body parsing is enabled for the webhook route
3. The endpoint is publicly accessible

## Testing Webhooks Locally

Use Stripe CLI for local testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will give you a webhook secret for local testing
```

## Common Issues

1. **Webhook 400 errors**: Check the webhook secret is correct
2. **Subscription not updating**: Ensure webhook events are properly selected
3. **Customer portal 404**: Portal might not be activated in settings
4. **Payment requires action**: 3D Secure cards need additional handling