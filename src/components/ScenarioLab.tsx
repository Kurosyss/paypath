'use client';

import React from 'react';
import {
  Play,
  RotateCw,
  AlertOctagon,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Code2,
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
  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'STANDARD':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/50';
      case 'EDGE_CASE':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/50';
      case 'CHAOS':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Scenarios List (Left Column) */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Available Scenarios ({scenarios.length})
          </h2>
          <span className="text-[11px] text-cyan-400 font-mono">Select to Test</span>
        </div>

        <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
          {scenarios.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <div
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? 'border-cyan-500/80 bg-cyan-950/20 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : 'border-white/5 bg-slate-900/40 hover:border-white/15 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{sc.code}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">{sc.category}</span>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wider ${getDifficultyBadge(
                      sc.difficulty
                    )}`}
                  >
                    {sc.difficulty}
                  </span>
                </div>

                <h4
                  className={`mt-1.5 text-sm font-semibold transition ${
                    isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {sc.title}
                </h4>

                <p className="mt-1 line-clamp-2 text-xs text-slate-400 leading-relaxed">
                  {sc.description}
                </p>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-cyan-500/70" />
                    <span>{sc.invariants.length} Invariants</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {sc.defaultMode === 'REAL_SANDBOX' ? 'Live API' : 'Fault Injection'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario Execution Panel (Right Column) */}
      <div className="lg:col-span-7">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
          {/* Header */}
          <div className="border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-800/50">
                  {currentScenario?.code}
                </span>
                <span className="text-xs text-slate-400">Category: {currentScenario?.category}</span>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getDifficultyBadge(
                  currentScenario?.difficulty || 'STANDARD'
                )}`}
              >
                {currentScenario?.difficulty}
              </span>
            </div>

            <h3 className="mt-2 text-xl font-bold text-white tracking-tight">
              {currentScenario?.title}
            </h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {currentScenario?.description}
            </p>
          </div>

          {/* Real World Impact Callout */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-3.5 flex items-start gap-3">
            <AlertOctagon className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold text-amber-300">Why Real Checkouts Break Here:</h5>
              <p className="mt-0.5 text-xs text-amber-200/80 leading-relaxed">
                {currentScenario?.realWorldImpact}
              </p>
            </div>
          </div>

          {/* Controls: Mode & Fix Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-slate-950/60 p-4 border border-white/5">
            {/* Mode Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Execution Mode
              </label>
              <div className="flex rounded-lg bg-slate-900 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => onModeChange('REAL_SANDBOX')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                    selectedMode === 'REAL_SANDBOX'
                      ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Real Sandbox API
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange('FAULT_INJECTION')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                    selectedMode === 'FAULT_INJECTION'
                      ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fault Injection
                </button>
              </div>
            </div>

            {/* Apply Fix Toggle */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Resilience Patch State
              </label>
              <button
                type="button"
                onClick={() => onToggleApplyFix(!applyFix)}
                className={`w-full flex items-center justify-between rounded-lg p-2.5 border transition ${
                  applyFix
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                    : 'border-rose-500/50 bg-rose-950/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Sparkles className="h-4 w-4" />
                  <span>{applyFix ? 'Safe Resilient Pattern (Fixed)' : 'Vulnerable Pattern (Buggy)'}</span>
                </div>
                <span className="text-[10px] font-mono uppercase underline">Click to toggle</span>
              </button>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onRunScenario(selectedScenarioId, selectedMode, applyFix)}
              disabled={isRunning}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:brightness-110 disabled:opacity-50"
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

          {/* Quick Result Snapshot if available */}
          {activeRun && activeRun.scenarioId === selectedScenarioId && (
            <div className="rounded-lg border border-white/10 bg-slate-950/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeRun.status === 'PASSED' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  )}
                  <span className="text-xs font-bold text-white">
                    Execution Outcome: {activeRun.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">({activeRun.durationMs}ms)</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {activeRun.appliedFix ? 'WITH RESILIENCE FIX' : 'UNFIXED NAIVE CODE'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="bg-slate-900/80 p-2 rounded border border-white/5">
                  <span className="text-slate-500 block text-[9px]">INITIAL STATE</span>
                  <span className="text-slate-200">{activeRun.initialState || 'N/A'}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-white/5">
                  <span className="text-slate-500 block text-[9px]">FINAL STATE</span>
                  <span
                    className={
                      activeRun.finalState === 'COMPLETED'
                        ? 'text-emerald-400'
                        : activeRun.finalState === 'DECLINED'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }
                  >
                    {activeRun.finalState || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-white/5">
                  <span className="text-slate-500 block text-[9px]">TRACES GENERATED</span>
                  <span className="text-slate-200">{activeRun.traces.length} events</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-white/5">
                  <span className="text-slate-500 block text-[9px]">INVARIANTS PASSED</span>
                  <span className="text-slate-200">
                    {activeRun.invariants.filter((i) => i.passed).length} /{' '}
                    {activeRun.invariants.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
