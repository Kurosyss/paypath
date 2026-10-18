import { NextResponse } from 'next/server';
import { PayPalClient } from '@/lib/paypal-client';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = body.amount || '25.00';
    const currency = body.currency || 'USD';
    const mockResponseCode = body.mockResponseCode;
    const customCreds = body.customCreds;

    const client = new PayPalClient(customCreds);
    const result = await client.createOrder({
      amount,
      currency,
      mockResponseCode,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Failed to create order', details: errMsg },
      { status: 500 }
    );
  }
}
