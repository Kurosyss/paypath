/**
 * PayPath - Deterministic Payment Invariants Engine
 * 10 strict payment safety rules that decide pass/fail objectively.
 */

import { InvariantResult, OrderState, TraceEvent } from './types';

export const INVARIANT_DEFINITIONS = [
  {
    id: 'INV-001',
    name: 'Monotonic State Progression',
    category: 'STATE_INTEGRITY' as const,
    severity: 'CRITICAL' as const,
    description: 'Order state must only advance forward; terminal states (COMPLETED, VOIDED) can never revert.',
  },
  {
    id: 'INV-002',
    name: 'No Blind Retry Without Reconciliation',
    category: 'FAULT_TOLERANCE' as const,
    severity: 'CRITICAL' as const,
    description: 'Timeouts on capture must reconcile state with GET /v2/checkout/orders/{id} before any retry.',
  },
  {
    id: 'INV-003',
    name: 'Strict Decline Detection',
    category: 'SECURITY' as const,
    severity: 'CRITICAL' as const,
    description: 'INSTRUMENT_DECLINED or payment refusal must be surfaced as failure, never misreported as success.',
  },
  {
    id: 'INV-004',
    name: 'Webhook Event Deduplication',
    category: 'IDEMPOTENCY' as const,
    severity: 'HIGH' as const,
    description: 'Duplicate delivery of the same webhook event_id must not trigger secondary fulfillment.',
  },
  {
    id: 'INV-005',
    name: 'Webhook Signature Verification',
    category: 'SECURITY' as const,
    severity: 'CRITICAL' as const,
    description: 'Inbound webhooks must pass cryptographic verification before processing business logic.',
  },
  {
    id: 'INV-006',
    name: 'Idempotency Header Enforcement',
    category: 'IDEMPOTENCY' as const,
    severity: 'HIGH' as const,
    description: 'Mutation requests must transmit PayPal-Request-Id to guarantee transport-level safety.',
  },
  {
    id: 'INV-007',
    name: 'Zero Credential Leakage',
    category: 'SECURITY' as const,
    severity: 'CRITICAL' as const,
    description: 'Client secrets, bearer tokens, and payment secrets must never appear in unredacted traces.',
  },
  {
    id: 'INV-008',
    name: 'Capture Requires Buyer Approval',
    category: 'STATE_INTEGRITY' as const,
    severity: 'HIGH' as const,
    description: 'Orders in CREATED state cannot be captured until payer approval is granted.',
  },
  {
    id: 'INV-009',
    name: 'Authoritative Ledger Confirmation',
    category: 'STATE_INTEGRITY' as const,
    severity: 'CRITICAL' as const,
    description: 'Payment fulfillment must require server-confirmed COMPLETED status, not mere client redirect.',
  },
  {
    id: 'INV-010',
    name: 'Graceful Error Diagnostics',
    category: 'FAULT_TOLERANCE' as const,
    severity: 'MEDIUM' as const,
    description: 'API errors must yield structured error messages without unhandled stack dump crashes.',
  },
];

const ORDER_STATE_RANK: Record<OrderState, number> = {
  CREATED: 10,
  SAVED: 20,
  APPROVED: 30,
  PAYER_ACTION_REQUIRED: 35,
  UNCERTAIN: 40,
  COMPLETED: 50,
  DECLINED: 50,
  VOIDED: 50,
  FAILED: 50,
};

/**
 * Validates state transition monotonicity
 */
export function validateStateProgression(from: OrderState, to: OrderState): InvariantResult {
  const fromRank = ORDER_STATE_RANK[from] || 0;
  const toRank = ORDER_STATE_RANK[to] || 0;

  // Terminal states cannot transition to anything else
  const isTerminalReversal = (from === 'COMPLETED' || from === 'VOIDED' || from === 'DECLINED') && to !== from;
  // Regressive transition (e.g. COMPLETED -> APPROVED)
  const isRegression = toRank < fromRank && from !== 'UNCERTAIN';

  const passed = !isTerminalReversal && !isRegression;

  return {
    id: 'INV-001',
    name: 'Monotonic State Progression',
    category: 'STATE_INTEGRITY',
    severity: 'CRITICAL',
    passed,
    message: passed
      ? `Valid transition from ${from} to ${to}`
      : `Illegal state regression: Attempted transition from ${from} to ${to}`,
    expected: `Monotonically advancing state (terminal states locked)`,
    actual: `Transitioned ${from} -> ${to}`,
  };
}

/**
 * Validates reconciliation behavior during uncertain capture
 */
export function validateReconciliation(traces: TraceEvent[]): InvariantResult {
  const hadTimeout = traces.some(
    (t) => t.type === 'FAULT_INJECTED' && t.detail.toLowerCase().includes('timeout')
  );
  const hadReconciliation = traces.some(
    (t) => t.type === 'RECONCILIATION' || (t.type === 'HTTP_REQUEST' && t.detail.includes('GET /v2/checkout/orders/'))
  );
  const hadBlindRetry = traces.some(
    (t, idx) =>
      t.type === 'HTTP_REQUEST' &&
      t.detail.includes('/capture') &&
      idx > 0 &&
      traces.slice(0, idx).some((prev) => prev.type === 'FAULT_INJECTED' || prev.status === 'ERROR') &&
      !traces.slice(0, idx).some((prev) => prev.type === 'RECONCILIATION')
  );

  const passed = hadTimeout ? (hadReconciliation && !hadBlindRetry) : !hadBlindRetry;

  return {
    id: 'INV-002',
    name: 'No Blind Retry Without Reconciliation',
    category: 'FAULT_TOLERANCE',
    severity: 'CRITICAL',
    passed,
    message: passed
      ? 'Payment state reconciled authoritatively before deciding retry'
      : 'Violation: Attempted blind capture retry without verifying server-side order state',
    expected: 'Reconciliation call via GET /v2/checkout/orders/{id} before retry',
    actual: hadReconciliation ? 'Reconciled first' : hadBlindRetry ? 'Blind retry executed' : 'Not reconciled',
  };
}

/**
 * Validates that decline responses are handled as failure
 */
export function validateDeclineHandling(finalState: OrderState, traces: TraceEvent[]): InvariantResult {
  const receivedDecline = traces.some(
    (t) =>
      t.detail.includes('INSTRUMENT_DECLINED') ||
      t.detail.includes('TRANSACTION_REFUSED') ||
      (t.sanitizedPayload?.status === 422 && String(t.sanitizedPayload?.body).includes('DECLINED'))
  );

  let passed = true;
  if (receivedDecline) {
    passed = finalState === 'DECLINED' || finalState === 'FAILED';
  }

  return {
    id: 'INV-003',
    name: 'Strict Decline Detection',
    category: 'SECURITY',
    severity: 'CRITICAL',
    passed,
    message: passed
      ? 'Declined instrument correctly surfaced as non-successful state'
      : `Critical Bug: PayPal returned INSTRUMENT_DECLINED but final state was marked as ${finalState}`,
    expected: 'State must be DECLINED or FAILED upon payment instrument decline',
    actual: `Final state: ${finalState} (Decline response received: ${receivedDecline})`,
  };
}

/**
 * Validates webhook deduplication
 */
export function validateWebhookDeduplication(eventCount: number, fulfillmentCount: number): InvariantResult {
  const passed = eventCount > 1 ? fulfillmentCount === 1 : true;

  return {
    id: 'INV-004',
    name: 'Webhook Event Deduplication',
    category: 'IDEMPOTENCY',
    severity: 'HIGH',
    passed,
    message: passed
      ? `Exactly-once fulfillment preserved across ${eventCount} webhook deliveries`
      : `Idempotency failure: ${eventCount} deliveries triggered ${fulfillmentCount} fulfillments!`,
    expected: 'Exactly 1 fulfillment regardless of duplicate deliveries',
    actual: `${eventCount} deliveries -> ${fulfillmentCount} fulfillments`,
  };
}

/**
 * Validates webhook signature verification
 */
export function validateWebhookSignature(isVerified: boolean, processedPayload: boolean): InvariantResult {
  const passed = !(!isVerified && processedPayload);

  return {
    id: 'INV-005',
    name: 'Webhook Signature Verification',
    category: 'SECURITY',
    severity: 'CRITICAL',
    passed,
    message: passed
      ? (isVerified ? 'Webhook signature verified cryptographically via PayPal' : 'Untrusted webhook rejected safely')
      : 'Security Hole: Webhook payload was processed despite invalid or missing signature!',
    expected: 'Reject and discard any webhook payload with failed signature',
    actual: isVerified ? 'Verified & processed' : (processedPayload ? 'Unverified but PROCESSED' : 'Rejected safely'),
  };
}

/**
 * Validates absence of leaked secrets in traces
 */
export function validateZeroLeakage(traces: TraceEvent[]): InvariantResult {
  let leakFound = false;
  let leakedSnippet = '';

  const leakPatterns = [
    /client_secret/i,
    /Bearer\s+[A-Za-z0-9_\-.]{20,}/i,
    /Basic\s+[A-Za-z0-9+/=]{10,}/i,
    /\b(?:\d{4}[ -]?){3}\d{4}\b/,
  ];

  for (const trace of traces) {
    const rawString = JSON.stringify(trace);
    for (const pattern of leakPatterns) {
      if (pattern.test(rawString)) {
        // verify it's not the redaction marker
        if (!rawString.includes('[REDACTED')) {
          leakFound = true;
          leakedSnippet = rawString.slice(0, 100);
          break;
        }
      }
    }
    if (leakFound) break;
  }

  return {
    id: 'INV-007',
    name: 'Zero Credential Leakage',
    category: 'SECURITY',
    severity: 'CRITICAL',
    passed: !leakFound,
    message: !leakFound
      ? 'All traces and payloads thoroughly sanitized before storage/logging'
      : `Potential secret leakage detected in traces: ${leakedSnippet}...`,
    expected: 'Zero unredacted access tokens, client secrets, or card numbers',
    actual: leakFound ? 'Potential credential leak detected' : 'Fully sanitized',
  };
}
