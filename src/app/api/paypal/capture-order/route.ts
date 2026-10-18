import { NextResponse } from 'next/server';
import { PayPalClient } from '@/lib/paypal-client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = body.orderId;
    const mockResponseCode = body.mockResponseCode;
    const simulateTimeout = Boolean(body.simulateTimeout);
    const customCreds = body.customCreds;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const client = new PayPalClient(customCreds);
    const result = await client.captureOrder({
      orderId,
      mockResponseCode,
      simulateTimeout,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Failed to capture order', details: errMsg },
      { status: 500 }
    );
  }
}
