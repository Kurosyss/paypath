'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  FileCheck2,
  Copy,
  Check,
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
      <div className="rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-12 text-center shadow-whisper transition-colors">
        <Sparkles className="mx-auto h-8 w-8 text-[var(--text-mute)]" />
        <h4 className="mt-3 text-sm font-semibold text-[var(--text-ink)]">
          No Diagnostic Report Available
        </h4>
        <p className="mt-1 text-xs text-[var(--text-body)] max-w-md mx-auto">
          Execute a test scenario in the Scenario Lab to trigger AI-assisted root-cause diagnosis, code diff generation, and regression proposals.
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
    <div className="rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 shadow-whisper space-y-6 transition-colors">
      {/* Header & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--text-ink)] tracking-[-0.4px] flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[var(--text-mute)]" />
              {diagnosis.modelName?.includes('Gemini')
                ? 'AI Diagnostic Analysis & Fix Studio'
                : 'Diagnostic Analysis & Fix Studio'}
            </h3>
          </div>
          <p className="text-xs text-[var(--text-body)] mt-0.5">
            Root-cause hypothesis synthesized from sanitized network traces and invariant checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Engine Model Badge */}
          <div className="flex items-center gap-1.5 rounded-[6px] bg-[var(--bg-canvas)] px-2.5 py-1 text-xs font-mono text-[var(--text-ink)] border border-[var(--border-hairline)] shadow-whisper">
            <Cpu className="h-3.5 w-3.5 text-[var(--text-mute)]" />
            <span>{diagnosis.modelName}</span>
          </div>

          {/* Verification Mode Badge */}
          {diagnosis.modelName?.includes('Gemini') ? (
            <div className="flex items-center gap-1.5 rounded-[6px] bg-[var(--bg-canvas)] px-2.5 py-1 text-xs font-mono text-[var(--text-ink)] border border-[var(--border-hairline)] font-medium shadow-whisper">
              <span className="text-[var(--text-mute)]">Confidence:</span>
              <span className="font-semibold text-[var(--text-ink)]">{diagnosis.confidence}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-[6px] bg-[var(--bg-canvas)] px-2.5 py-1 text-xs font-mono text-[var(--text-ink)] border border-[var(--border-hairline)] font-medium shadow-whisper">
              <span className="text-[var(--text-mute)]">Verification:</span>
              <span className="font-semibold text-[var(--text-ink)]">Deterministic Rules</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. Deterministic Invariant Violations */}
      {failedInvariants.length > 0 && (
        <div className="rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[var(--text-ink)] font-semibold text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0 text-[var(--text-mute)]" />
            <span>Deterministic Invariant Violations Detected ({failedInvariants.length})</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {failedInvariants.map((inv) => (
              <div
                key={inv.id}
                className="rounded-[6px] bg-[var(--bg-elevated)] p-2.5 text-xs border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-mono font-bold text-[var(--text-ink)] mr-2">{inv.id}</span>
                  <span className="font-medium text-[var(--text-ink)]">{inv.name}: </span>
                  <span className="text-[var(--text-body)]">{inv.message}</span>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-mute)] whitespace-nowrap">
                  Severity: {inv.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Root Cause Hypothesis */}
      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-mute)] font-medium flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-[var(--text-mute)]" />
          Root Cause Hypothesis
        </h4>
        <div className="rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 text-xs text-[var(--text-ink)] leading-relaxed">
          {diagnosis.rootCauseHypothesis}
        </div>
      </div>

      {/* 3. Observed Evidence */}
      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-mute)] font-medium flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-[var(--text-mute)]" />
          Observed Factual Evidence ({diagnosis.evidence.length})
        </h4>
        <ul className="space-y-1.5">
          {diagnosis.evidence.map((ev, idx) => (
            <li
              key={idx}
              className="rounded-[6px] bg-[var(--bg-canvas)] p-2.5 text-xs text-[var(--text-body)] border border-[var(--border-hairline)] flex items-start gap-2"
            >
              <span className="font-mono text-[var(--text-ink)] font-semibold mt-0.5">[{idx + 1}]</span>
              <span>{ev}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Recommended Code Fix Diff */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-mute)] font-medium flex items-center gap-1.5">
            <FileCheck2 className="h-3.5 w-3.5 text-[var(--text-mute)]" />
            Recommended Code Fix Diff ({diagnosis.recommendedCodeFix.filename})
          </h4>
          <button
            onClick={copyDiff}
            className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-ink)] hover:underline cursor-pointer"
          >
            {copiedDiff ? (
              <>
                <Check className="h-3 w-3 text-[var(--text-ink)]" /> Copied Diff
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Git Diff
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-[var(--text-body)] leading-relaxed">
          {diagnosis.recommendedCodeFix.explanation}
        </p>

        <div className="rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 font-mono text-xs overflow-x-auto custom-scrollbar">
          <pre className="text-[var(--text-ink)] whitespace-pre leading-relaxed">
            {diagnosis.recommendedCodeFix.diff.split('\n').map((line, i) => {
              let style = 'text-[var(--text-body)]';
              if (line.startsWith('+')) style = 'text-[var(--text-ink)] font-semibold bg-[var(--border-hairline-soft)]';
              if (line.startsWith('-')) style = 'text-[var(--text-mute)] line-through opacity-70';
              if (line.startsWith('@')) style = 'text-[var(--text-mute)] font-bold';
              return (
                <div key={i} className={`${style} px-1.5 py-0.5 rounded-[2px]`}>
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
          <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-mute)] font-medium flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-[var(--text-mute)]" />
            Proposed Automated Regression Test
          </h4>
          <button
            onClick={copyTest}
            className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-ink)] hover:underline cursor-pointer"
          >
            {copiedTest ? (
              <>
                <Check className="h-3 w-3 text-[var(--text-ink)]" /> Copied Test
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Test Code
              </>
            )}
          </button>
        </div>

        <div className="rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 font-mono text-xs text-[var(--text-ink)] overflow-x-auto custom-scrollbar">
          <pre>{diagnosis.proposedRegressionTest.code}</pre>
        </div>
      </div>

      {/* 6. Next Diagnostic Action & One-Click Apply */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[8px] bg-[var(--bg-canvas)] p-4 border border-[var(--border-hairline)] shadow-whisper">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] block font-medium">
            Recommended Action
          </span>
          <span className="text-xs text-[var(--text-ink)] font-medium mt-0.5 block">
            {diagnosis.nextDiagnosticAction}
          </span>
        </div>

        {onApplyFixAndVerify && (
          <button
            onClick={onApplyFixAndVerify}
            disabled={isVerifying}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] px-5 h-10 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-whisper"
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
      <div className="text-[11px] text-[var(--text-mute)] border-t border-[var(--border-hairline)] pt-3 leading-relaxed">
        {diagnosis.disclaimer}
      </div>
    </div>
  );
}
