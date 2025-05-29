import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/server';

// Lazy initialize Stripe to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      console.error('Environment variables:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
    console.log('Initializing Stripe with key starting with:', secretKey.substring(0, 10) + '...');
    
    try {
      stripe = new Stripe(secretKey, {
        apiVersion: '2024-12-18.acacia',
      });
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      throw error;
    }
  }
  return stripe;
}

// Get pricing configuration at runtime
// These environment variables are only available on the server
function getStripePrices() {
  return {
    essentials: {
      monthly: process.env.STRIPE_PRICE_ESSENTIALS_MONTHLY || 'price_1RU8JlFqLaCwMbaKEraYuFdq',
      yearly: process.env.STRIPE_PRICE_ESSENTIALS_YEARLY || 'price_1RU8BAFqLaCwMbaKy4Z1Fcqu'
    },
    standard: {
      monthly: process.env.STRIPE_PRICE_STANDARD_MONTHLY || 'price_1RU8JPFqLaCwMbaK1MCWbApS',
      yearly: process.env.STRIPE_PRICE_STANDARD_YEARLY || 'price_1RU8BWFqLaCwMbaKdpIAOcXP'
    },
    premium: {
      monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_1RU8K0FqLaCwMbaKRJGw0GVk',
      yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || 'price_1RU8ByFqLaCwMbaKK9t2z3N1'
    }
  };
}

export type SubscriptionTier = 'ESSENTIALS' | 'STANDARD' | 'PREMIUM';

// Product configuration
export const STRIPE_PRODUCTS = {
  ESSENTIALS: {
    name: 'Essentials',
    price: {
      monthly: 29,
      yearly: 290 // 2 months free
    },
    currency: 'gbp',
    features: [
      'Core compliance tracking',
      'Basic reporting',
      'Email support',
      'Up to 10 users',
    ],
    limits: {
      users: 10,
      storage: 100 * 1024 * 1024, // 100MB
      aiRequests: 50,
      exports: 10
    }
  },
  STANDARD: {
    name: 'Standard',
    price: {
      monthly: 79,
      yearly: 790 // 2 months free
    },
    currency: 'gbp',
    features: [
      'Everything in Essentials',
      'Advanced compliance modules',
      'AI-powered insights',
      'Up to 50 users',
      'Priority support',
    ],
    limits: {
      users: 50,
      storage: 1 * 1024 * 1024 * 1024, // 1GB
      aiRequests: 500,
      exports: 100
    }
  },
  PREMIUM: {
    name: 'Premium',
    price: {
      monthly: 149,
      yearly: 1490 // 2 months free
    },
    currency: 'gbp',
    features: [
      'Everything in Standard',
      'Custom integrations',
      'Dedicated success manager',
      'SLA guarantee',
      'White-label options',
    ],
    limits: {
      users: -1, // unlimited
      storage: 10 * 1024 * 1024 * 1024, // 10GB
      aiRequests: -1, // unlimited
      exports: -1 // unlimited
    }
  },
} as const;

// Helper functions
export function getPriceId(tier: SubscriptionTier, cycle: 'monthly' | 'yearly' = 'monthly'): string {
  const tierKey = tier.toLowerCase() as 'essentials' | 'standard' | 'premium';
  const prices = getStripePrices();
  const priceConfig = prices[tierKey];
  
  return priceConfig[cycle];
}

export async function getStripeClient() {
  // Return client-side Stripe instance
  if (typeof window !== 'undefined') {
    const { loadStripe } = await import('@stripe/stripe-js');
    return await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return null;
}



export function formatPrice(amount: number, currency = 'gbp'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function getStripeServer(): Stripe {
  return getStripe();
}

export async function getSubscription(subscriptionId: string) {
  return await getStripe().subscriptions.retrieve(subscriptionId);
}

export async function updateSubscription(subscriptionId: string, params: Stripe.SubscriptionUpdateParams) {
  return await getStripe().subscriptions.update(subscriptionId, params);
}

export function getTierFromPriceId(priceId: string): { tier: SubscriptionTier; cycle: 'monthly' | 'yearly' } | null {
  // Mock implementation - would parse actual price IDs
  if (priceId.includes('essentials')) {
    return { 
      tier: 'ESSENTIALS' as SubscriptionTier, 
      cycle: priceId.includes('yearly') ? 'yearly' : 'monthly' 
    };
  }
  if (priceId.includes('standard')) {
    return { 
      tier: 'STANDARD' as SubscriptionTier, 
      cycle: priceId.includes('yearly') ? 'yearly' : 'monthly' 
    };
  }
  if (priceId.includes('premium')) {
    return { 
      tier: 'PREMIUM' as SubscriptionTier, 
      cycle: priceId.includes('yearly') ? 'yearly' : 'monthly' 
    };
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
  priceId,
  organizationId,
  successUrl,
  cancelUrl,
  customerEmail,
  metadata,
  allowPromotionCodes = true,
  automaticTax = false,
}: {
  priceId: string;
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
  automaticTax?: boolean;
}) {
  const session = await getStripe().checkout.sessions.create({
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
      ...metadata,
    },
    subscription_data: {
      metadata: {
        organizationId,
        ...metadata,
      },
    },
    allow_promotion_codes: allowPromotionCodes,
    billing_address_collection: 'required',
    tax_id_collection: {
      enabled: true,
    },
    automatic_tax: automaticTax ? { enabled: true } : undefined,
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
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
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Webhook handling removed for now - will be implemented when needed

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
    const stripeSubscription = await getStripe().subscriptions.retrieve(
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
  const subscription = await getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

/**
 * Resume subscription (undo cancellation)
 */
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}
