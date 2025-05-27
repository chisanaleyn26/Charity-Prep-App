import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  try {
    const result = await handleStripeWebhook(body, signature);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

// Note: In Next.js 13+ App Router, raw body is handled differently
// The route automatically provides the raw body via request.text()