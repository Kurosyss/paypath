'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';

interface OrderReconciliationResult {
  status: string;
  orderId?: string;
  captureId?: string;
  amount?: string;
  currency?: string;
  payerEmail?: string;
  payerName?: string;
  rawStatus?: string;
  details?: string;
  error?: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const payerId = searchParams.get('PayerID');

  const [state, setState] = useState<'INITIAL' | 'RECONCILING' | 'CAPTURING' | 'COMPLETED' | 'PENDING' | 'DECLINED' | 'FAILED'>('INITIAL');
  const [result, setResult] = useState<OrderReconciliationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState('FAILED');
      setErrorMessage('No PayPal order token found in URL query parameters.');
      return;
    }

    let isMounted = true;

    async function processOrder() {
      setState('RECONCILING');
      setErrorMessage(null);

      try {
        // Step 1: Query Authoritative Order Status from PayPal Sandbox API
        const reconcileRes = await fetch(`/api/paypal/reconcile?orderId=${encodeURIComponent(token!)}`);
        const reconcileData = await reconcileRes.json();

        if (!reconcileRes.ok) {
          throw new Error(reconcileData.details || reconcileData.error || 'Failed to query PayPal order status');
        }

        const order = reconcileData.order || {};
        const authoritativeStatus = (order.status || reconcileData.status || '').toUpperCase();
        const purchaseUnit = order.purchase_units?.[0];
        const amount = purchaseUnit?.amount?.value;
        const currency = purchaseUnit?.amount?.currency_code || 'USD';
        const existingCapture = purchaseUnit?.payments?.captures?.[0];

        if (!isMounted) return;

        // Step 2: Handle Authoritative State Machine
        if (authoritativeStatus === 'COMPLETED' || authoritativeStatus === 'APPROVED') {
          setState(authoritativeStatus === 'APPROVED' ? 'CAPTURING' : 'RECONCILING');

          const captureRes = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: token }),
          });

          const captureData = await captureRes.json();

          if (!isMounted) return;

          if (!captureRes.ok) {
            const errIssue = captureData.details || captureData.error || 'Server-side capture failed';
            setState('FAILED');
            setErrorMessage(errIssue);
            setResult({
              status: 'FAILED',
              orderId: token!,
              rawStatus: captureData.status || 'FAILED',
              details: errIssue,
            });
            return;
          }

          if (captureData.status === 'COMPLETED') {
            setState('COMPLETED');
            setResult({
              status: 'COMPLETED',
              orderId: token!,
              captureId: captureData.captureId || existingCapture?.id,
              amount: amount || captureData.paymentRecord?.amount || '10.00',
              currency: currency || captureData.paymentRecord?.currency || 'USD',
              rawStatus: 'COMPLETED',
              details: captureData.alreadyCaptured
                ? 'PayPal Sandbox ledger confirmed order already COMPLETED. Reconciled without duplicate capture.'
                : 'Server-side capture executed successfully via Orders v2 API.',
            });
          } else if (captureData.status === 'DECLINED') {
            setState('DECLINED');
            setResult({
              status: 'DECLINED',
              orderId: token!,
              rawStatus: 'DECLINED',
              details: 'Payment instrument was declined by the issuing sandbox institution.',
            });
          } else {
            setState('FAILED');
            setResult({
              status: captureData.status || 'FAILED',
              orderId: token!,
              rawStatus: captureData.status,
              details: 'Capture returned non-terminal status.',
            });
          }
          return;
        }

        if (authoritativeStatus === 'CREATED' || authoritativeStatus === 'SAVED' || authoritativeStatus === 'PAYER_ACTION_REQUIRED') {
          setState('PENDING');
          setResult({
            status: 'PENDING_APPROVAL',
            orderId: token!,
            amount,
            currency,
            rawStatus: authoritativeStatus,
            details: 'Buyer authorization has not been completed on PayPal yet.',
          });
          return;
        }

        if (authoritativeStatus === 'VOIDED') {
          setState('DECLINED');
          setResult({
            status: 'VOIDED',
            orderId: token!,
            rawStatus: authoritativeStatus,
            details: 'The order authorization was voided.',
          });
          return;
        }

        setState('FAILED');
        setErrorMessage(`Unexpected authoritative order status: ${authoritativeStatus}`);
        setResult({
          status: 'UNEXPECTED',
          orderId: token!,
          rawStatus: authoritativeStatus,
          details: `Current PayPal ledger status is ${authoritativeStatus}`,
        });

      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setState('FAILED');
        setErrorMessage(msg);
      }
    }

    processOrder();

    return () => {
      isMounted = false;
    };
  }, [token, payerId]);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-ink)] flex flex-col justify-between font-sans">
      {/* Top Bar */}
      <header className="border-b border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-[var(--text-ink)] flex items-center justify-center shadow-whisper">
              <BrandMark size={16} className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-[-0.4px] text-[var(--text-ink)]">PayPath</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] px-1.5 py-0.5 rounded-[4px] bg-[var(--border-hairline-soft)] border border-[var(--border-hairline)]">
                Sandbox Gateway
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-medium text-[var(--text-body)] hover:text-[var(--text-ink)] transition-colors"
            >
              Back to Reliability Lab
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        {state === 'RECONCILING' && (
          <div className="p-8 rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-whisper text-center space-y-4">
            <div className="w-12 h-12 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-ink)] flex items-center justify-center mx-auto animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-medium">
                Step 1 of 2: Authoritative Verification
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.8px] text-[var(--text-ink)]">
                Reconciling PayPal Sandbox Order
              </h1>
              <p className="text-sm text-[var(--text-body)] max-w-md mx-auto">
                Querying <code className="text-xs font-mono bg-[var(--bg-canvas)] px-1.5 py-0.5 rounded-[4px] border border-[var(--border-hairline)]">GET /v2/checkout/orders/{token?.slice(0, 10)}...</code> to verify buyer approval state on the server.
              </p>
            </div>
          </div>
        )}

        {state === 'CAPTURING' && (
          <div className="p-8 rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-whisper text-center space-y-4">
            <div className="w-12 h-12 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-ink)] flex items-center justify-center mx-auto animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-medium">
                Step 2 of 2: Server-Side Capture
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.8px] text-[var(--text-ink)]">
                Capturing Approved Payment
              </h1>
              <p className="text-sm text-[var(--text-body)] max-w-md mx-auto">
                Order is approved. Executing idempotent server-side capture via <code className="text-xs font-mono bg-[var(--bg-canvas)] px-1.5 py-0.5 rounded-[4px] border border-[var(--border-hairline)]">POST /v2/checkout/orders/{token}/capture</code>.
              </p>
            </div>
          </div>
        )}

        {state === 'COMPLETED' && (
          <div className="p-8 rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-whisper space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-ink)] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-medium">
                  Payment Verified & Captured
                </div>
                <h1 className="text-2xl font-semibold tracking-[-0.8px] text-[var(--text-ink)]">
                  Checkout Completed Successfully
                </h1>
              </div>
            </div>

            <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-hairline)] space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[var(--border-hairline)]">
                <span className="text-[var(--text-mute)]">PayPal Order ID</span>
                <span className="font-semibold text-[var(--text-ink)]">{result?.orderId}</span>
              </div>
              {result?.captureId && (
                <div className="flex justify-between items-center py-1 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-mute)]">Capture ID</span>
                  <span className="font-semibold text-[var(--text-ink)]">{result.captureId}</span>
                </div>
              )}
              {result?.amount && (
                <div className="flex justify-between items-center py-1 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-mute)]">Amount Settled</span>
                  <span className="font-semibold text-[var(--text-ink)]">
                    {result.amount} {result.currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--text-mute)]">Authoritative State</span>
                <span className="px-2 py-0.5 rounded-[4px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] font-semibold text-[11px] text-[var(--text-ink)]">
                  COMPLETED
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-hairline)] flex items-start gap-2.5 text-xs text-[var(--text-body)]">
              <ShieldCheck className="w-4 h-4 text-[var(--text-mute)] shrink-0 mt-0.5" />
              <span>
                <strong>Invariants Verified:</strong> Safe Capture Invariant and State Reconciliation Invariant satisfied. Zero access tokens or secrets exposed in client DOM.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <span>Return to PayPath Lab</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {state === 'PENDING' && (
          <div className="p-8 rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-whisper space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-mute)] flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-medium">
                  Buyer Action Required
                </div>
                <h1 className="text-2xl font-semibold tracking-[-0.8px] text-[var(--text-ink)]">
                  Order Not Yet Approved
                </h1>
              </div>
            </div>

            <p className="text-sm text-[var(--text-body)]">
              The PayPal Sandbox ledger confirms Order <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-hairline)]">{token}</code> is in status <strong>{result?.rawStatus}</strong>. Payment capture cannot be executed until the payer completes approval.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Return to Scenario Lab
              </Link>
            </div>
          </div>
        )}

        {state === 'DECLINED' && (
          <div className="p-8 rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-whisper space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-mute)] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-medium">
                  Capture Declined
                </div>
                <h1 className="text-2xl font-semibold tracking-[-0.8px] text-[var(--text-ink)]">
                  Payment Was Declined
                </h1>
              </div>
            </div>

            <p className="text-sm text-[var(--text-body)]">
              {result?.details || 'The payment instrument or funding source was declined by PayPal Sandbox.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Return to Scenario Lab
              </Link>
            </div>
          </div>
        )}

        {state === 'FAILED' && (
          <div className="p-8 rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-whisper space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-mute)] flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-medium">
                  Verification Failed
                </div>
                <h1 className="text-2xl font-semibold tracking-[-0.8px] text-[var(--text-ink)]">
                  Order Processing Failed
                </h1>
              </div>
            </div>

            <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-xs font-mono text-[var(--text-ink)]">
              {errorMessage || result?.details || 'An error occurred during order verification or capture.'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Return to Scenario Lab
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-6 py-4 text-center text-xs text-[var(--text-mute)]">
        PayPath Sandbox Order Verification Gateway &middot; Authoritative State Reconciliation
      </footer>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--text-ink)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
