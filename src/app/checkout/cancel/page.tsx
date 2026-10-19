'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';

function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

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
      <main className="max-w-xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="p-8 rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-whisper space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-mute)] flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-medium">
                Checkout Flow Cancelled
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.8px] text-[var(--text-ink)]">
                Payment Session Cancelled
              </h1>
            </div>
          </div>

          <p className="text-sm text-[var(--text-body)] leading-relaxed">
            The buyer cancelled the PayPal authorization session, or the session was aborted before completion. No funds were debited, captured, or reserved.
          </p>

          {token && (
            <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-hairline)] space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-mute)]">Cancelled Order Token</span>
                <span className="text-[var(--text-ink)] font-medium">{token}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-mute)]">Authoritative State</span>
                <span className="px-2 py-0.5 rounded-[4px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-ink)] font-semibold text-[11px]">
                  CANCELLED_BY_BUYER
                </span>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-hairline)] flex items-start gap-2.5 text-xs text-[var(--text-body)]">
            <ShieldCheck className="w-4 h-4 text-[var(--text-mute)] shrink-0 mt-0.5" />
            <span>
              <strong>Safe Reversal Guarantee:</strong> The order was never authorized. Re-running the scenario or initiating a fresh checkout creates a unique idempotency key.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to PayPath Lab
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-6 py-4 text-center text-xs text-[var(--text-mute)]">
        PayPath Sandbox Order Cancellation &middot; Zero Charge Invariant Confirmed
      </footer>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--text-ink)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutCancelContent />
    </Suspense>
  );
}
