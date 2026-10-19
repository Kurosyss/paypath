'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { PaymentConfirmationRecord } from '@/lib/types';

interface AuthoritativePaymentCardProps {
  onRefresh?: () => void;
}

function maskIdentifier(id: string): string {
  if (!id || id.length <= 8) return id;
  return `${id.slice(0, 4)}••••••••${id.slice(-4)}`;
}

export function AuthoritativePaymentCard({ onRefresh }: AuthoritativePaymentCardProps) {
  const [payments, setPayments] = useState<PaymentConfirmationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
    details?: string;
  } | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/paypal/payments');
      const data = await res.json();
      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (e) {
      console.error('Failed to fetch payments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (isLoading || payments.length === 0) {
    return null;
  }

  const latestPayment = payments[0];

  // Action 1: Live Server-Side Reconciliation with PayPal Orders v2 API
  const handleVerifyAuthoritativeState = async () => {
    setActionLoading('reconcile');
    setVerificationFeedback(null);
    try {
      const res = await fetch(`/api/paypal/reconcile?orderId=${encodeURIComponent(latestPayment.orderId)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Reconciliation failed');
      }

      const pu = data.order?.purchase_units?.[0];
      const capture = pu?.payments?.captures?.[0];
      const status = data.status || data.order?.status;

      setVerificationFeedback({
        type: 'success',
        message: `PayPal Sandbox Orders v2 confirmed status: ${status}`,
        details: `Order: ${maskIdentifier(latestPayment.orderId)} · Capture: ${maskIdentifier(capture?.id || latestPayment.captureId || 'N/A')} · Settled: ${pu?.amount?.value || latestPayment.amount} ${pu?.amount?.currency_code || latestPayment.currency}`,
      });
    } catch (err: unknown) {
      setVerificationFeedback({
        type: 'error',
        message: 'Reconciliation error',
        details: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Action 2: Test Duplicate Capture Guard
  const handleTestDuplicateCapture = async () => {
    setActionLoading('duplicate');
    setVerificationFeedback(null);
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: latestPayment.orderId }),
      });
      const data = await res.json();

      if (data.alreadyCaptured) {
        setVerificationFeedback({
          type: 'info',
          message: 'Duplicate Capture Intercepted & Blocked Safely',
          details: `PayPath checked local ledger and authoritative PayPal state. Result: ${data.message} (Zero duplicate charges incurred).`,
        });
      } else if (res.ok) {
        setVerificationFeedback({
          type: 'success',
          message: 'Order capture reconciled successfully.',
        });
      } else {
        setVerificationFeedback({
          type: 'error',
          message: 'Duplicate capture test failed',
          details: data.details || data.error,
        });
      }
    } catch (err: unknown) {
      setVerificationFeedback({
        type: 'error',
        message: 'Duplicate capture check error',
        details: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4 shadow-whisper space-y-3 transition-colors">
      {/* Compact Top Bar: Status, Order Details, and Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-mute)] font-medium">
              Persisted Payment
            </span>
            <span className="inline-flex items-center gap-1 rounded-[4px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--text-ink)]">
              <CheckCircle2 className="h-3 w-3 text-[var(--text-ink)]" />
              {latestPayment.status}
            </span>
            <span className="text-xs text-[var(--text-mute)] font-mono">
              &middot; {new Date(latestPayment.confirmedAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono">
            <div>
              <span className="text-[var(--text-mute)] text-[11px]">Order: </span>
              <span className="font-semibold text-[var(--text-ink)] select-all" title={latestPayment.orderId}>
                {maskIdentifier(latestPayment.orderId)}
              </span>
            </div>
            {latestPayment.captureId && (
              <div>
                <span className="text-[var(--text-mute)] text-[11px]">Capture: </span>
                <span className="font-semibold text-[var(--text-ink)] select-all" title={latestPayment.captureId}>
                  {maskIdentifier(latestPayment.captureId)}
                </span>
              </div>
            )}
            <div>
              <span className="text-[var(--text-mute)] text-[11px]">Settled: </span>
              <span className="font-semibold text-[var(--text-ink)]">
                ${latestPayment.amount} {latestPayment.currency}
              </span>
            </div>
            <div>
              <span className="text-[var(--text-mute)] text-[11px]">Attempts: </span>
              <span className="text-[var(--text-body)]">
                {latestPayment.captureAttempts}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Verification Actions (Vercel 6px square app controls) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyAuthoritativeState}
            disabled={actionLoading !== null}
            className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--text-ink)] hover:border-[var(--text-mute)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${actionLoading === 'reconcile' ? 'animate-spin' : ''}`} />
            <span>Re-verify</span>
          </button>

          <button
            onClick={handleTestDuplicateCapture}
            disabled={actionLoading !== null}
            className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--text-ink)] hover:border-[var(--text-mute)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <ShieldAlert className={`h-3 w-3 ${actionLoading === 'duplicate' ? 'animate-spin' : ''}`} />
            <span>Test Duplicate Guard</span>
          </button>

          <a
            href={`/checkout/success?token=${latestPayment.orderId}`}
            className="inline-flex items-center gap-1 rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-2.5 py-1.5 text-xs text-[var(--text-body)] hover:text-[var(--text-ink)] hover:border-[var(--text-mute)] transition-colors font-mono"
            title="Inspect return route"
          >
            <span>Return Route</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Verification Feedback Banner (Understated Monochrome) */}
      {verificationFeedback && (
        <div className="rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-xs font-mono space-y-1 transition-all">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--text-ink)]">
            {verificationFeedback.type === 'error' ? (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <FileCheck className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{verificationFeedback.message}</span>
          </div>
          {verificationFeedback.details && (
            <p className="text-[11px] text-[var(--text-body)] leading-relaxed pl-5">
              {verificationFeedback.details}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
