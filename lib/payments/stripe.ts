import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/server';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Pricing configuration
export const STRIPE_PRICES = {
  essentials: process.env.STRIPE_PRICE_ESSENTIALS || 'price_essentials',
  standard: process.env.STRIPE_PRICE_STANDARD || 'price_standard',
  premium: process.env.STRIPE_PRICE_PREMIUM || 'price_premium',
} as const;

export type SubscriptionTier = keyof typeof STRIPE_PRICES;

// Product configuration
export const STRIPE_PRODUCTS = {
  essentials: {
    name: 'Essentials',
    price: 29,
    currency: 'gbp',
    features: [
      'Core compliance tracking',
      'Basic reporting',
      'Email support',
      'Up to 3 users',
    ],
  },
  standard: {
    name: 'Standard',
    price: 79,
    currency: 'gbp',
    features: [
      'Everything in Essentials',
      'Advanced compliance modules',
      'AI-powered insights',
      'Unlimited users',
      'Priority support',
    ],
  },
  premium: {
    name: 'Premium',
    price: 149,
    currency: 'gbp',
    features: [
      'Everything in Standard',
      'Custom integrations',
      'Dedicated success manager',
      'SLA guarantee',
      'White-label options',
    ],
  },
} as const;

// Helper functions
export function getPriceId(tier: SubscriptionTier): string {
  return STRIPE_PRICES[tier];
}

export function getStripeClient(): Stripe {
  return stripe;
}

export function formatPrice(amount: number, currency = 'gbp'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function getStripeServer(): Stripe {
  return stripe;
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function updateSubscription(subscriptionId: string, params: Stripe.SubscriptionUpdateParams) {
  return await stripe.subscriptions.update(subscriptionId, params);
}

export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const [tier, price] of Object.entries(STRIPE_PRICES)) {
    if (price === priceId) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}

export function handleStripeError(error: any): never {
  if (error.type === 'StripeCardError') {
    throw new Error(`Card error: ${error.message}`);
  } else if (error.type === 'StripeInvalidRequestError') {
    throw new Error(`Invalid request: ${error.message}`);
  } else {
    throw new Error(`Stripe error: ${error.message || 'Unknown error'}`);
  }
}

export type SubscriptionData = {
  id: string;
  status: Stripe.Subscription.Status;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number | null;
        currency: string;
      };
    }>;
  };
};

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession({
  organizationId,
  tier,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  organizationId: string;
  tier: SubscriptionTier;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const priceId = STRIPE_PRICES[tier];

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      organizationId,
      tier,
    },
    subscription_data: {
      metadata: {
        organizationId,
        tier,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: {
      enabled: true,
    },
  });

  return session;
}

/**
 * Create a Stripe portal session for managing subscription
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    throw new Error('Invalid webhook signature');
  }

  const supabase = createServerClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { organizationId, tier } = session.metadata!;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      // Update subscription in database
      await supabase
        .from('subscriptions')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          tier: tier as any,
        })
        .eq('organization_id', organizationId);

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const { organizationId } = subscription.metadata;

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status === 'active' ? 'active' : 'past_due',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      // Log successful payment
      console.log('Payment succeeded for invoice:', invoice.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Update subscription status
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('organization_id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (subscription) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('organization_id', subscription.organization_id);
      }

      break;
    }
  }

  return { received: true };
}

/**
 * Get subscription status for an organization
 */
export async function getSubscriptionStatus(organizationId: string) {
  const supabase = createServerClient();
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (!subscription || !subscription.stripe_subscription_id) {
    return null;
  }

  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    return {
      ...subscription,
      stripeStatus: stripeSubscription.status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Failed to fetch Stripe subscription:', error);
    return subscription;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

/**
 * Resume subscription (undo cancellation)
 */
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}
