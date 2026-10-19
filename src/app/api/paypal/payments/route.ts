import { NextResponse } from 'next/server';
import { getAllPaymentRecords, getPaymentRecord } from '@/lib/storage';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const payment = getPaymentRecord(orderId);
      if (!payment) {
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
      }
      return NextResponse.json({ payment });
    }

    const payments = getAllPaymentRecords();
    return NextResponse.json({ payments });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Failed to retrieve payment records', details: errMsg },
      { status: 500 }
    );
  }
}
