import { NextResponse } from 'next/server';
import { PayPalClient } from '@/lib/paypal-client';
import { getAIConfigStatus } from '@/lib/ai-diagnostic-engine';

export async function GET() {
  const client = new PayPalClient();
  const paypalStatus = client.getConfigStatus();
  const aiStatus = getAIConfigStatus();

  return NextResponse.json({
    paypal: paypalStatus,
    ai: aiStatus,
    environment: 'sandbox',
    systemTime: new Date().toISOString(),
  });
}
