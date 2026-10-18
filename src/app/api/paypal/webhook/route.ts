import { NextResponse } from 'next/server';
import { PayPalClient } from '@/lib/paypal-client';
import { recordWebhookEvent, getWebhookEventRecords } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const headers = {
      authAlgo: req.headers.get('paypal-auth-algo') || '',
      certUrl: req.headers.get('paypal-cert-url') || '',
      transmissionId: req.headers.get('paypal-transmission-id') || '',
      transmissionSig: req.headers.get('paypal-transmission-sig') || '',
      transmissionTime: req.headers.get('paypal-transmission-time') || '',
    };

    const client = new PayPalClient();
    const config = client.getConfigStatus();

    let verified = false;
    if (config.hasClientId && config.hasClientSecret && headers.transmissionId) {
      try {
        const verifyResult = await client.verifyWebhookSignature({
          ...headers,
          webhookEvent: event,
        });
        verified = verifyResult.verified;
      } catch {
        verified = false;
      }
    } else {
      // In local testing without transmission headers or keys, allow explicit testing flag
      verified = req.headers.get('x-paypath-test-auth') === 'true';
    }

    const eventId = event.id || `EVENT-${Date.now()}`;
    const eventType = event.event_type || 'PAYMENT.CAPTURE.COMPLETED';
    const orderId = event.resource?.id;

    // Deduplication check
    const dedupResult = recordWebhookEvent(eventId, eventType, orderId);

    if (dedupResult.isDuplicate) {
      return NextResponse.json({
        message: 'Duplicate event received and acknowledged safely without secondary fulfillment.',
        eventId,
        receiveCount: dedupResult.record.receiveCount,
        actionTaken: 'ACKNOWLEDGED_DUPLICATE_SKIPPED',
      }, { status: 200 });
    }

    return NextResponse.json({
      message: 'Webhook processed successfully',
      eventId,
      eventType,
      verified,
      actionTaken: 'FULFILLMENT_COMPLETED',
    }, { status: 200 });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Webhook processing error', details: errMsg }, { status: 400 });
  }
}

export async function GET() {
  const records = getWebhookEventRecords();
  return NextResponse.json({ records });
}
