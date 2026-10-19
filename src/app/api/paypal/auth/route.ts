import { NextResponse } from 'next/server';
import { PayPalClient } from '@/lib/paypal-client';

export async function GET() {
  try {
    const client = new PayPalClient();
    const config = client.getConfigStatus();

    if (!config.hasClientId || !config.hasClientSecret) {
      return NextResponse.json(
        {
          authenticated: false,
          mode: 'SANDBOX',
          error: 'Missing credentials. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local',
        },
        { status: 400 }
      );
    }

    // Attempt token retrieval against PayPal Sandbox OAuth2 endpoint
    await client.getAccessToken();

    return NextResponse.json({
      authenticated: true,
      mode: 'SANDBOX',
      gateway: 'https://api-m.sandbox.paypal.com',
      message: 'PayPal Sandbox OAuth2 authentication successful',
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        authenticated: false,
        mode: 'SANDBOX',
        error: errMsg,
      },
      { status: 401 }
    );
  }
}
