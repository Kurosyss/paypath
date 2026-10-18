'use client';

import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, History } from 'lucide-react';
import { TestRunRecord } from '@/lib/types';

interface RegressionViewerProps {
  runs: TestRunRecord[];
  onSelectRun: (run: TestRunRecord) => void;
  selectedRunId?: string;
}

export function RegressionViewer({ runs, onSelectRun, selectedRunId }: RegressionViewerProps) {
  if (runs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <History className="h-4 w-4 text-cyan-400" />
            Regression Testing & Execution History
          </h3>
          <p className="text-xs text-slate-400">
            Audit trail of recent test runs, comparing vulnerable implementations against verified resilient patches.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">{runs.length} runs recorded</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px]">
              <th className="pb-2.5 font-medium">RUN ID</th>
              <th className="pb-2.5 font-medium">SCENARIO</th>
              <th className="pb-2.5 font-medium">MODE</th>
              <th className="pb-2.5 font-medium">PATCH STATE</th>
              <th className="pb-2.5 font-medium">FINAL STATE</th>
              <th className="pb-2.5 font-medium">INVARIANTS</th>
              <th className="pb-2.5 font-medium">DURATION</th>
              <th className="pb-2.5 font-medium text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {runs.slice(0, 10).map((run) => {
              const isSelected = run.runId === selectedRunId;
              const passedInvariants = run.invariants.filter((i) => i.passed).length;
              const totalInvariants = run.invariants.length;

              return (
                <tr
                  key={run.runId}
                  className={`hover:bg-slate-800/40 transition cursor-pointer ${
                    isSelected ? 'bg-cyan-950/30' : ''
                  }`}
                  onClick={() => onSelectRun(run)}
                >
                  <td className="py-2.5 font-semibold text-cyan-400">{run.runId.slice(0, 14)}</td>
                  <td className="py-2.5 font-sans font-medium text-slate-200">
                    {run.scenarioTitle}
                  </td>
                  <td className="py-2.5 text-slate-400 text-[10px]">
                    {run.mode === 'REAL_SANDBOX' ? (
                      <span className="text-emerald-400 font-bold">REAL SANDBOX</span>
                    ) : (
                      <span className="text-amber-400 font-bold">FAULT INJECTION</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    {run.appliedFix ? (
                      <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-800/50">
                        FIX VERIFIED
                      </span>
                    ) : (
                      <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] text-rose-300 border border-rose-800/50">
                        BUGGY BASELINE
                      </span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`font-semibold ${
                        run.finalState === 'COMPLETED'
                          ? 'text-emerald-400'
                          : run.finalState === 'DECLINED'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {run.finalState}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        passedInvariants === totalInvariants ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {passedInvariants === totalInvariants ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {passedInvariants}/{totalInvariants}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400">{run.durationMs}ms</td>
                  <td className="py-2.5 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRun(run);
                      }}
                      className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
