'use client';

import React from 'react';
import { CheckCircle2, XCircle, History } from 'lucide-react';
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
    <div className="rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 shadow-whisper space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-ink)] tracking-[-0.4px] flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--text-mute)]" />
            Regression Testing & Execution History
          </h3>
          <p className="text-xs text-[var(--text-body)] mt-0.5">
            Audit trail of recent test runs, comparing vulnerable implementations against verified resilient patches.
          </p>
        </div>
        <span className="text-xs font-mono text-[var(--text-mute)]">{runs.length} runs recorded</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] text-[var(--text-mute)] font-mono text-[11px]">
              <th className="pb-3 font-medium">RUN ID</th>
              <th className="pb-3 font-medium">SCENARIO</th>
              <th className="pb-3 font-medium">MODE</th>
              <th className="pb-3 font-medium">PATCH STATE</th>
              <th className="pb-3 font-medium">FINAL STATE</th>
              <th className="pb-3 font-medium">INVARIANTS</th>
              <th className="pb-3 font-medium">DURATION</th>
              <th className="pb-3 font-medium text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)] font-mono">
            {runs.slice(0, 10).map((run) => {
              const isSelected = run.runId === selectedRunId;
              const passedInvariants = run.invariants.filter((i) => i.passed).length;
              const totalInvariants = run.invariants.length;

              return (
                <tr
                  key={run.runId}
                  className={`hover:bg-[var(--bg-canvas)] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[var(--border-hairline-soft)]' : ''
                  }`}
                  onClick={() => onSelectRun(run)}
                >
                  <td className="py-3 font-semibold text-[var(--text-ink)]">{run.runId.slice(0, 14)}</td>
                  <td className="py-3 font-sans font-medium text-[var(--text-ink)]">
                    {run.scenarioTitle}
                  </td>
                  <td className="py-3 text-[10px] text-[var(--text-mute)] font-medium">
                    {run.mode === 'REAL_SANDBOX' ? 'REAL SANDBOX' : 'FAULT LAB'}
                  </td>
                  <td className="py-3">
                    <span className="rounded-[4px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-2 py-0.5 text-[10px] text-[var(--text-ink)] font-medium">
                      {run.appliedFix ? 'FIX VERIFIED' : 'UNFIXED'}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-[var(--text-ink)]">
                    {run.finalState}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 font-medium text-[var(--text-ink)]">
                      {passedInvariants === totalInvariants ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3 text-[var(--text-mute)]" />
                      )}
                      {passedInvariants}/{totalInvariants}
                    </span>
                  </td>
                  <td className="py-3 text-[var(--text-mute)]">{run.durationMs}ms</td>
                  <td className="py-3 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRun(run);
                      }}
                      className="text-xs font-medium text-[var(--text-ink)] hover:underline transition-colors cursor-pointer"
                    >
                      Inspect Report &rarr;
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
