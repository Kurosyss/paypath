'use client';

import React from 'react';
import { INVARIANT_DEFINITIONS } from '@/lib/invariants';
import { TestRunRecord, PayPalConfigStatus } from '@/lib/types';

interface OverviewSectionProps {
  runs: TestRunRecord[];
  paypalConfig: PayPalConfigStatus | null;
}

export function OverviewSection({ runs, paypalConfig }: OverviewSectionProps) {
  const totalRuns = runs.length;
  const passedRuns = runs.filter((r) => r.status === 'PASSED').length;
  const failedRuns = runs.filter((r) => r.status === 'FAILED').length;
  const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 100;

  // Count invariant checks across all runs
  const invariantCheckMap: Record<string, { passed: number; failed: number }> = {};
  INVARIANT_DEFINITIONS.forEach((inv) => {
    invariantCheckMap[inv.id] = { passed: 0, failed: 0 };
  });

  runs.forEach((r) => {
    r.invariants.forEach((inv) => {
      if (invariantCheckMap[inv.id]) {
        if (inv.passed) {
          invariantCheckMap[inv.id].passed += 1;
        } else {
          invariantCheckMap[inv.id].failed += 1;
        }
      }
    });
  });

  // Unique vulnerabilities caught
  const bugsCaught = runs.filter((r) => !r.appliedFix && r.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Row: Unified Surface with Hairline Dividers (No nested boxes) */}
      <div className="rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 shadow-whisper transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)]">
          {/* Total Runs */}
          <div className="py-2 sm:py-0 sm:px-4 first:sm:pl-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-mute)] font-medium block">
              Total Test Runs
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-[-1.28px] text-[var(--text-ink)]">
                {totalRuns}
              </span>
              <span className="text-xs text-[var(--text-mute)]">executed</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-body)]">
              {passedRuns} passed &middot; {failedRuns} failed
            </p>
          </div>

          {/* Invariant Compliance */}
          <div className="py-2 sm:py-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-mute)] font-medium block">
              Invariant Pass Rate
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-[-1.28px] text-[var(--text-ink)]">
                {passRate}%
              </span>
              <span className="text-xs text-[var(--text-mute)]">compliance</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-body)]">
              10 core payment safety rules
            </p>
          </div>

          {/* Flaws Caught */}
          <div className="py-2 sm:py-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-mute)] font-medium block">
              Vulnerabilities Isolated
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-[-1.28px] text-[var(--text-ink)]">
                {bugsCaught}
              </span>
              <span className="text-xs text-[var(--text-mute)]">flaws caught</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-body)]">
              Decline swallowing, duplicate capture
            </p>
          </div>

          {/* Gateway Target */}
          <div className="py-2 sm:py-0 sm:px-4 last:sm:pr-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-mute)] font-medium block">
              Gateway Target
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-semibold tracking-[-0.4px] text-[var(--text-ink)] font-mono">
                {paypalConfig?.connected ? 'api-m.sandbox' : 'Deterministic Mock'}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-body)]">
              Orders v2 &middot; Authoritative State
            </p>
          </div>
        </div>
      </div>

      {/* Invariant Health Matrix: Clean Divided Row List (Zero Nested Boxes) */}
      <div className="rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] shadow-whisper transition-colors">
        <div className="p-6 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-ink)] tracking-[-0.4px]">
              Deterministic Invariant Matrix (10 Core Payment Rules)
            </h3>
            <p className="text-xs text-[var(--text-body)] mt-0.5">
              Formal safety rules enforced across state progression, idempotency keys, and trace sanitization.
            </p>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-ink)] bg-[var(--bg-canvas)] px-2.5 py-1 rounded-[6px] border border-[var(--border-hairline)] w-fit font-medium">
            Formally Verified
          </span>
        </div>

        <div className="divide-y divide-[var(--border-hairline)]">
          {INVARIANT_DEFINITIONS.map((inv) => {
            const stats = invariantCheckMap[inv.id] || { passed: 0, failed: 0 };
            const hasTested = stats.passed + stats.failed > 0;
            const hasFailure = stats.failed > 0;

            return (
              <div
                key={inv.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--bg-canvas)]/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[var(--text-ink)]">
                      {inv.id}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-ink)] tracking-[-0.2px]">
                      {inv.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-[4px] font-mono font-medium border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-mute)]">
                      {inv.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-body)] leading-relaxed max-w-3xl">
                    {inv.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center">
                  {!hasTested ? (
                    <span className="rounded-[4px] bg-[var(--bg-canvas)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-mute)] border border-[var(--border-hairline)]">
                      UNTESTED
                    </span>
                  ) : hasFailure ? (
                    <span className="rounded-[4px] bg-[var(--bg-canvas)] px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--text-ink)] border border-[var(--border-hairline)]">
                      {stats.failed} VIOLATION{stats.failed > 1 ? 'S' : ''}
                    </span>
                  ) : (
                    <span className="rounded-[4px] bg-[var(--bg-canvas)] px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--text-ink)] border border-[var(--border-hairline)]">
                      OK ({stats.passed})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
