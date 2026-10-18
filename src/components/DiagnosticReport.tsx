'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  FileCheck2,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  Lightbulb,
  Play,
  RotateCcw,
} from 'lucide-react';
import { AIDiagnosisResult, InvariantResult } from '@/lib/types';

interface DiagnosticReportProps {
  diagnosis: AIDiagnosisResult | null | undefined;
  invariants: InvariantResult[];
  onApplyFixAndVerify?: () => void;
  isVerifying?: boolean;
}

export function DiagnosticReport({
  diagnosis,
  invariants,
  onApplyFixAndVerify,
  isVerifying,
}: DiagnosticReportProps) {
  const [copiedDiff, setCopiedDiff] = useState(false);
  const [copiedTest, setCopiedTest] = useState(false);

  const failedInvariants = invariants.filter((i) => !i.passed);

  if (!diagnosis) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-md">
        <Sparkles className="mx-auto h-8 w-8 text-slate-600 animate-pulse" />
        <h4 className="mt-3 text-sm font-semibold text-slate-300">
          No Diagnostic Report Available
        </h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
          Execute a test scenario to trigger AI-assisted root-cause diagnosis, code diff generation, and regression proposal.
        </p>
      </div>
    );
  }

  const copyDiff = () => {
    navigator.clipboard.writeText(diagnosis.recommendedCodeFix.diff);
    setCopiedDiff(true);
    setTimeout(() => setCopiedDiff(false), 2000);
  };

  const copyTest = () => {
    navigator.clipboard.writeText(diagnosis.proposedRegressionTest.code);
    setCopiedTest(true);
    setTimeout(() => setCopiedTest(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
      {/* Header & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              AI Diagnostic Analysis & Fix Studio
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Root-cause hypothesis synthesized from sanitized network traces and invariant checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Model Badge */}
          <div className="flex items-center gap-1.5 rounded-lg bg-purple-950/60 px-2.5 py-1 text-xs font-mono text-purple-300 border border-purple-800/50">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span>{diagnosis.modelName}</span>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center gap-1.5 rounded-lg bg-cyan-950/60 px-2.5 py-1 text-xs font-mono text-cyan-300 border border-cyan-800/50">
            <span>Confidence:</span>
            <span className="font-bold text-cyan-400">{diagnosis.confidence}%</span>
          </div>
        </div>
      </div>

      {/* 1. Deterministic Invariant Violations */}
      {failedInvariants.length > 0 && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>Deterministic Invariant Violations Detected ({failedInvariants.length})</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {failedInvariants.map((inv) => (
              <div
                key={inv.id}
                className="rounded bg-rose-950/40 p-2.5 text-xs border border-rose-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-mono font-bold text-rose-400 mr-2">{inv.id}</span>
                  <span className="font-medium text-slate-200">{inv.name}: </span>
                  <span className="text-rose-200/90">{inv.message}</span>
                </div>
                <div className="text-[10px] font-mono text-rose-300/70 whitespace-nowrap">
                  Severity: {inv.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Root Cause Hypothesis */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
          Root Cause Hypothesis
        </h4>
        <div className="rounded-lg border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200 leading-relaxed">
          {diagnosis.rootCauseHypothesis}
        </div>
      </div>

      {/* 3. Observed Evidence */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-cyan-400" />
          Observed Factual Evidence ({diagnosis.evidence.length})
        </h4>
        <ul className="space-y-1.5">
          {diagnosis.evidence.map((ev, idx) => (
            <li
              key={idx}
              className="rounded bg-slate-950/50 p-2.5 text-xs text-slate-300 border border-white/5 flex items-start gap-2"
            >
              <span className="font-mono text-cyan-400 font-bold mt-0.5">[{idx + 1}]</span>
              <span>{ev}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Recommended Code Fix Diff */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
            Recommended Code Fix Diff ({diagnosis.recommendedCodeFix.filename})
          </h4>
          <button
            onClick={copyDiff}
            className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
          >
            {copiedDiff ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" /> Copied Diff
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Git Diff
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {diagnosis.recommendedCodeFix.explanation}
        </p>

        <div className="rounded-lg border border-white/10 bg-slate-950 p-3.5 font-mono text-xs overflow-x-auto custom-scrollbar">
          <pre className="text-slate-300 whitespace-pre leading-relaxed">
            {diagnosis.recommendedCodeFix.diff.split('\n').map((line, i) => {
              let color = 'text-slate-300';
              if (line.startsWith('+')) color = 'text-emerald-400 bg-emerald-950/30';
              if (line.startsWith('-')) color = 'text-rose-400 bg-rose-950/30';
              if (line.startsWith('@')) color = 'text-cyan-400 font-bold';
              return (
                <div key={i} className={`${color} px-1 rounded`}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      </div>

      {/* 5. Proposed Regression Test */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-purple-400" />
            Proposed Automated Regression Test
          </h4>
          <button
            onClick={copyTest}
            className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
          >
            {copiedTest ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" /> Copied Test
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Test Code
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-950 p-3.5 font-mono text-xs text-slate-300 overflow-x-auto custom-scrollbar">
          <pre>{diagnosis.proposedRegressionTest.code}</pre>
        </div>
      </div>

      {/* 6. Next Diagnostic Action & One-Click Apply */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg bg-cyan-950/30 p-4 border border-cyan-800/40">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
            Next Action
          </span>
          <span className="text-xs text-slate-200 font-medium">
            {diagnosis.nextDiagnosticAction}
          </span>
        </div>

        {onApplyFixAndVerify && (
          <button
            onClick={onApplyFixAndVerify}
            disabled={isVerifying}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 shadow-md shadow-emerald-500/20"
          >
            {isVerifying ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin" /> Verifying Fix...
              </>
            ) : (
              <>
                <FileCheck2 className="h-3.5 w-3.5" /> Apply Fix & Re-Verify Regression
              </>
            )}
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <div className="text-[11px] text-slate-500 border-t border-white/5 pt-3">
        {diagnosis.disclaimer}
      </div>
    </div>
  );
}
