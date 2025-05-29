import { NextRequest, NextResponse } from 'next/server';

// Webhook endpoint placeholder - not implemented yet
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: 'Webhook endpoint not configured yet' },
    { status: 501 } // 501 Not Implemented
  );
}

// TODO: Implement webhook handling when ready
// Will need to:
// 1. Verify Stripe signature
// 2. Handle subscription events
// 3. Update database accordingly