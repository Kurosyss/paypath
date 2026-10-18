import { describe, it, expect } from 'vitest';
import {
  validateStateProgression,
  validateReconciliation,
  validateDeclineHandling,
  validateWebhookDeduplication,
  validateWebhookSignature,
} from '../src/lib/invariants';
import { TraceEvent } from '../src/lib/types';

describe('Payment Invariants Engine', () => {
  it('INV-001: should allow forward state progression and reject regressions', () => {
    // Valid forward transitions
    expect(validateStateProgression('CREATED', 'APPROVED').passed).toBe(true);
    expect(validateStateProgression('APPROVED', 'COMPLETED').passed).toBe(true);

    // Illegal regressions
    const regression = validateStateProgression('COMPLETED', 'APPROVED');
    expect(regression.passed).toBe(false);
    expect(regression.id).toBe('INV-001');

    const terminalReversal = validateStateProgression('COMPLETED', 'CREATED');
    expect(terminalReversal.passed).toBe(false);
  });

  it('INV-002: should require authoritative reconciliation on timeout before retrying', () => {
    // Case 1: Timeout happened, but reconciliation was executed
    const safeTraces: TraceEvent[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'FAULT_INJECTED',
        source: 'BACKEND',
        title: 'Timeout',
        detail: '504 Gateway Timeout during capture',
      },
      {
        id: '2',
        timestamp: new Date().toISOString(),
        type: 'RECONCILIATION',
        source: 'BACKEND',
        title: 'Querying ledger',
        detail: 'GET /v2/checkout/orders/ORD-1',
      },
    ];
    expect(validateReconciliation(safeTraces).passed).toBe(true);

    // Case 2: Timeout happened, and secondary capture was attempted without reconciliation
    const dangerousTraces: TraceEvent[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'FAULT_INJECTED',
        source: 'BACKEND',
        title: 'Timeout',
        detail: '504 Gateway Timeout',
        status: 'ERROR',
      },
      {
        id: '2',
        timestamp: new Date().toISOString(),
        type: 'HTTP_REQUEST',
        source: 'BACKEND',
        title: 'Blind Retry',
        detail: 'POST /v2/checkout/orders/ORD-1/capture',
      },
    ];
    expect(validateReconciliation(dangerousTraces).passed).toBe(false);
  });

  it('INV-003: should flag violation if DECLINED response is misreported as COMPLETED', () => {
    const traces: TraceEvent[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'HTTP_RESPONSE',
        source: 'PAYPAL_API',
        title: 'Declined',
        detail: 'INSTRUMENT_DECLINED: Funding instrument was declined',
      },
    ];

    // Bug case: App swallowed decline and reported COMPLETED
    const badCheck = validateDeclineHandling('COMPLETED', traces);
    expect(badCheck.passed).toBe(false);

    // Correct case: App marked order as DECLINED
    const goodCheck = validateDeclineHandling('DECLINED', traces);
    expect(goodCheck.passed).toBe(true);
  });

  it('INV-004: should require exactly 1 fulfillment across duplicate webhooks', () => {
    // 2 deliveries, 1 fulfillment = PASSED
    expect(validateWebhookDeduplication(2, 1).passed).toBe(true);

    // 2 deliveries, 2 fulfillments = FAILED (Duplicate double fulfillment bug!)
    const doubleFulfill = validateWebhookDeduplication(2, 2);
    expect(doubleFulfill.passed).toBe(false);
  });

  it('INV-005: should reject unverified webhook processing', () => {
    // Valid: verified and processed
    expect(validateWebhookSignature(true, true).passed).toBe(true);

    // Valid: unverified and rejected (not processed)
    expect(validateWebhookSignature(false, false).passed).toBe(true);

    // CRITICAL BUG: unverified signature but payload was still PROCESSED!
    const securityBug = validateWebhookSignature(false, true);
    expect(securityBug.passed).toBe(false);
  });
});
