import { NextResponse } from 'next/server';
import { PayPalClient } from '@/lib/paypal-client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId query param is required' }, { status: 400 });
    }

    const client = new PayPalClient();
    const result = await client.getOrderDetails(orderId);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Failed to reconcile order state', details: errMsg },
      { status: 500 }
    );
  }
}
