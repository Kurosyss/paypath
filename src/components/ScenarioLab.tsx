'use client';

import React, { useState } from 'react';
import {
  Play,
  RotateCw,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { ScenarioDefinition, ScenarioId, ExecutionMode, TestRunRecord } from '@/lib/types';

interface ScenarioLabProps {
  scenarios: ScenarioDefinition[];
  selectedScenarioId: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  onRunScenario: (scenarioId: ScenarioId, mode: ExecutionMode, applyFix: boolean) => Promise<void>;
  activeRun: TestRunRecord | null;
  isRunning: boolean;
  selectedMode: ExecutionMode;
  onModeChange: (mode: ExecutionMode) => void;
  applyFix: boolean;
  onToggleApplyFix: (val: boolean) => void;
}

function maskIdentifier(id: string): string {
  if (!id || id.length <= 8) return id;
  return `${id.slice(0, 4)}••••••••${id.slice(-4)}`;
}

export function ScenarioLab({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onRunScenario,
  activeRun,
  isRunning,
  selectedMode,
  onModeChange,
  applyFix,
  onToggleApplyFix,
}: ScenarioLabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(scenarios.map((s) => s.category)))];
  const filteredScenarios =
    selectedCategory === 'ALL'
      ? scenarios
      : scenarios.filter((s) => s.category === selectedCategory);

  const currentScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  return (
    <div className="space-y-4">
      {/* Category Filter Pills (Vercel button-category-pill: 64px rounded, strictly monochrome) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`h-8 px-4 rounded-[64px] text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-[var(--text-ink)] text-[var(--bg-canvas)] border-[var(--text-ink)] shadow-whisper'
                : 'bg-[var(--bg-elevated)] text-[var(--text-body)] border-[var(--border-hairline)] hover:text-[var(--text-ink)] hover:border-[var(--text-mute)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenarios List (Left Column) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--text-mute)] font-medium">
              Scenarios ({filteredScenarios.length})
            </h2>
            <span className="font-mono text-[11px] text-[var(--text-mute)]">Select to inspect</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredScenarios.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <div
                  key={sc.id}
                  id={`scenario-card-${sc.id}`}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`group cursor-pointer rounded-[12px] border p-4 transition-all shadow-whisper ${
                    isSelected
                      ? 'border-[var(--text-ink)] bg-[var(--bg-elevated)] ring-1 ring-[var(--text-ink)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-elevated)] hover:border-[var(--text-mute)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-semibold text-[var(--text-ink)]">{sc.code}</span>
                      <span className="text-[var(--text-mute)]">&middot;</span>
                      <span className="text-[var(--text-mute)] text-[11px]">{sc.category}</span>
                    </div>
                    <span className="rounded-[4px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-1.5 py-0.5 text-[9px] font-mono font-medium text-[var(--text-mute)]">
                      {sc.difficulty}
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-semibold tracking-[-0.2px] text-[var(--text-ink)]">
                    {sc.title}
                  </h4>

                  <p className="mt-1 line-clamp-2 text-xs text-[var(--text-body)] leading-relaxed">
                    {sc.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-mute)] border-t border-[var(--border-hairline)] pt-2.5 font-mono">
                    <div className="flex items-center gap-1.5 text-[var(--text-body)]">
                      <ShieldCheck className="h-3 w-3 text-[var(--text-mute)]" />
                      <span>{sc.invariants.length} Invariants</span>
                    </div>
                    <span className="text-[10px]">
                      {sc.defaultMode === 'REAL_SANDBOX' ? 'Live API' : 'Fault Lab'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scenario Execution Panel (Right Column - Deliberate composition without nested boxes) */}
        <div className="lg:col-span-7">
          <div className="rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 shadow-whisper space-y-6 transition-colors">
            {/* Header */}
            <div className="border-b border-[var(--border-hairline)] pb-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-[4px] bg-[var(--bg-canvas)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--text-ink)] border border-[var(--border-hairline)]">
                    {currentScenario?.code}
                  </span>
                  <span className="text-xs text-[var(--text-mute)] font-mono">
                    Category: {currentScenario?.category}
                  </span>
                </div>
                <span className="rounded-[4px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--text-mute)]">
                  {currentScenario?.difficulty}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-[var(--text-ink)] tracking-[-0.4px]">
                {currentScenario?.title}
              </h3>
              <p className="text-xs text-[var(--text-body)] leading-relaxed">
                {currentScenario?.description}
              </p>
            </div>

            {/* Real World Impact Callout (Subtle Left Hairline accent instead of a heavy box) */}
            <div className="border-l-2 border-[var(--border-hairline)] pl-4 py-0.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-ink)] font-mono uppercase tracking-wider">
                <AlertOctagon className="h-3.5 w-3.5 text-[var(--text-mute)]" />
                <span>Production Vulnerability Context</span>
              </div>
              <p className="text-xs text-[var(--text-body)] leading-relaxed">
                {currentScenario?.realWorldImpact}
              </p>
            </div>

            {/* Controls: Mode & Fix Toggle (Clean inline controls) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Mode Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-medium">
                  Execution Mode
                </label>
                <div className="flex rounded-[6px] bg-[var(--bg-canvas)] p-1 border border-[var(--border-hairline)]">
                  <button
                    type="button"
                    onClick={() => onModeChange('REAL_SANDBOX')}
                    className={`flex-1 rounded-[4px] py-1.5 text-xs font-medium transition cursor-pointer ${
                      selectedMode === 'REAL_SANDBOX'
                        ? 'bg-[var(--text-ink)] text-[var(--bg-canvas)] font-semibold shadow-whisper'
                        : 'text-[var(--text-body)] hover:text-[var(--text-ink)]'
                    }`}
                  >
                    Real Sandbox API
                  </button>
                  <button
                    type="button"
                    onClick={() => onModeChange('FAULT_INJECTION')}
                    className={`flex-1 rounded-[4px] py-1.5 text-xs font-medium transition cursor-pointer ${
                      selectedMode === 'FAULT_INJECTION'
                        ? 'bg-[var(--text-ink)] text-[var(--bg-canvas)] font-semibold shadow-whisper'
                        : 'text-[var(--text-body)] hover:text-[var(--text-ink)]'
                    }`}
                  >
                    Fault Injection
                  </button>
                </div>
              </div>

              {/* Apply Fix Toggle */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-medium">
                  Resilience Patch State
                </label>
                <button
                  type="button"
                  onClick={() => onToggleApplyFix(!applyFix)}
                  className="w-full flex items-center justify-between rounded-[6px] px-3 py-2 border border-[var(--border-hairline)] bg-[var(--bg-canvas)] hover:border-[var(--text-mute)] transition cursor-pointer h-[38px]"
                >
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        applyFix ? 'bg-[var(--text-ink)]' : 'border border-[var(--text-mute)]'
                      }`}
                    />
                    <span className="text-[var(--text-ink)]">
                      {applyFix ? 'Resilient Fix Active' : 'Unfixed Baseline'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-mute)]">
                    Toggle
                  </span>
                </button>
              </div>
            </div>

            {/* Action Trigger (Vercel 100px Marketing CTA Pill) */}
            <div>
              <button
                onClick={() => onRunScenario(selectedScenarioId, selectedMode, applyFix)}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-2 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] px-6 h-11 font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-whisper"
              >
                {isRunning ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Executing Payment Test...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Run Scenario Test</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Result Snapshot (Clean row layout without heavy nested boxes) */}
            {activeRun && activeRun.scenarioId === selectedScenarioId && (
              <div className="border-t border-[var(--border-hairline)] pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activeRun.status === 'PASSED' ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--text-ink)]" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[var(--text-mute)]" />
                    )}
                    <span className="text-xs font-semibold text-[var(--text-ink)]">
                      Execution Outcome: {activeRun.status}
                    </span>
                    <span className="text-xs text-[var(--text-mute)] font-mono">
                      ({activeRun.durationMs}ms)
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-mute)] uppercase">
                    {activeRun.appliedFix ? 'WITH RESILIENCE FIX' : 'UNFIXED BASELINE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="border-l border-[var(--border-hairline)] pl-3">
                    <span className="text-[var(--text-mute)] block text-[10px]">INITIAL STATE</span>
                    <span className="text-[var(--text-ink)] font-medium mt-0.5 block">
                      {activeRun.initialState || 'N/A'}
                    </span>
                  </div>
                  <div className="border-l border-[var(--border-hairline)] pl-3">
                    <span className="text-[var(--text-mute)] block text-[10px]">FINAL STATE</span>
                    <span className="text-[var(--text-ink)] font-semibold mt-0.5 block">
                      {activeRun.finalState || 'N/A'}
                    </span>
                  </div>
                  <div className="border-l border-[var(--border-hairline)] pl-3">
                    <span className="text-[var(--text-mute)] block text-[10px]">TRACES</span>
                    <span className="text-[var(--text-ink)] font-medium mt-0.5 block">
                      {activeRun.traces.length} events
                    </span>
                  </div>
                  <div className="border-l border-[var(--border-hairline)] pl-3">
                    <span className="text-[var(--text-mute)] block text-[10px]">INVARIANTS</span>
                    <span className="text-[var(--text-ink)] font-medium mt-0.5 block">
                      {activeRun.invariants.filter((i) => i.passed).length} /{' '}
                      {activeRun.invariants.length}
                    </span>
                  </div>
                </div>

                {/* Real PayPal Sandbox Interactive Action Box */}
                {activeRun.orderId && activeRun.mode === 'REAL_SANDBOX' && (
                  <div className="rounded-[8px] bg-[var(--bg-canvas)] p-4 border border-[var(--border-hairline)] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-ink)]" />
                        <span className="text-xs font-semibold text-[var(--text-ink)]">
                          PayPal Sandbox Order:{' '}
                          <code className="font-mono text-[var(--text-ink)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-[4px] border border-[var(--border-hairline)]">
                            {maskIdentifier(activeRun.orderId)}
                          </code>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-mute)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-[4px] border border-[var(--border-hairline)] font-medium">
                        REAL SANDBOX
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-body)] leading-relaxed">
                      Step 2 in standard PayPal Checkout: Open the approval window, authenticate with your Sandbox Buyer account, click &quot;Agree and Continue&quot;, which redirects to our local return route for authoritative capture.
                    </p>

                    <div className="pt-1">
                      <a
                        href={`https://www.sandbox.paypal.com/checkoutnow?token=${activeRun.orderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] hover:opacity-90 px-4 py-2 text-xs font-medium transition-opacity shadow-whisper"
                      >
                        <span>Open PayPal Sandbox Approval Window</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
