'use client';

import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
  Server,
  Layers,
} from 'lucide-react';
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
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Runs */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Test Runs
            </span>
            <div className="rounded-lg bg-cyan-950 p-2 text-cyan-400 ring-1 ring-cyan-800/50">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">{totalRuns}</span>
            <span className="text-xs text-slate-400">recorded</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {passedRuns} passed · {failedRuns} failed
          </div>
        </div>

        {/* Invariant Compliance */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Invariant Compliance
            </span>
            <div className="rounded-lg bg-emerald-950 p-2 text-emerald-400 ring-1 ring-emerald-800/50">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                passRate >= 90
                  ? 'text-emerald-400'
                  : passRate >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {passRate}%
            </span>
            <span className="text-xs text-slate-400">pass rate</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">10 core payment safety invariants</div>
        </div>

        {/* Flaws Caught */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Flaws Prevented
            </span>
            <div className="rounded-lg bg-rose-950 p-2 text-rose-400 ring-1 ring-rose-800/50">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">{bugsCaught}</span>
            <span className="text-xs text-rose-400">critical bugs caught</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Decline swallowing, blind retries, duplicates
          </div>
        </div>

        {/* Sandbox Health */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              PayPal Gateway
            </span>
            <div className="rounded-lg bg-blue-950 p-2 text-blue-400 ring-1 ring-blue-800/50">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              {paypalConfig?.connected ? 'api-m.sandbox' : 'Local Mock'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Zap className="h-3 w-3 text-cyan-400" />
            <span>Orders v2 · Webhooks REST</span>
          </div>
        </div>
      </div>

      {/* Invariant Health Matrix */}
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-cyan-400" />
              Deterministic Invariant Matrix (10 Core Payment Rules)
            </h3>
            <p className="text-xs text-slate-400">
              Formal verification checks that govern state progression, idempotency, and security.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/60 w-fit">
            Deterministic Decision Engine
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {INVARIANT_DEFINITIONS.map((inv) => {
            const stats = invariantCheckMap[inv.id] || { passed: 0, failed: 0 };
            const hasTested = stats.passed + stats.failed > 0;
            const hasFailure = stats.failed > 0;

            return (
              <div
                key={inv.id}
                className="flex items-start justify-between rounded-lg border border-white/5 bg-slate-950/40 p-3 transition hover:border-white/10"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300">{inv.id}</span>
                    <span className="text-xs font-medium text-slate-200">{inv.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        inv.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                      }`}
                    >
                      {inv.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{inv.description}</p>
                </div>

                <div className="shrink-0 flex items-center">
                  {!hasTested ? (
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      UNTESTED
                    </span>
                  ) : hasFailure ? (
                    <span className="flex items-center gap-1 rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-mono font-medium text-rose-300 border border-rose-800/60">
                      <AlertTriangle className="h-2.5 w-2.5" /> {stats.failed} VIO
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-300 border border-emerald-800/60">
                      <CheckCircle2 className="h-2.5 w-2.5" /> OK ({stats.passed})
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
