import { NextResponse } from 'next/server';
import { PayPalClient } from '@/lib/paypal-client';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = body.amount || '10.00';
    const currency = body.currency || 'USD';
    const mockResponseCode = body.mockResponseCode;
    const customCreds = body.customCreds;
    const origin = req.headers.get('origin');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const requestBaseUrl = origin || (host ? `${proto}://${host}` : undefined);

    const returnUrl = body.returnUrl || (requestBaseUrl ? `${requestBaseUrl}/checkout/success` : undefined);
    const cancelUrl = body.cancelUrl || (requestBaseUrl ? `${requestBaseUrl}/checkout/cancel` : undefined);

    const client = new PayPalClient(customCreds);
    const result = await client.createOrder({
      amount,
      currency,
      mockResponseCode,
      returnUrl,
      cancelUrl,
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
