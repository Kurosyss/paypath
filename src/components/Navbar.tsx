'use client';

import React from 'react';
import { ShieldCheck, Cpu, Sliders, Play, RotateCcw, Activity } from 'lucide-react';
import { PayPalConfigStatus, AIConfigStatus } from '@/lib/types';

interface NavbarProps {
  paypalConfig: PayPalConfigStatus | null;
  aiConfig: AIConfigStatus | null;
  totalRuns: number;
  passCount: number;
  onOpenSettings: () => void;
  onOpenWebhookModal: () => void;
  onRunAllScenarios: () => void;
  onResetRuns: () => void;
  isRunningSuite: boolean;
}

export function Navbar({
  paypalConfig,
  aiConfig,
  totalRuns,
  passCount,
  onOpenSettings,
  onOpenWebhookModal,
  onRunAllScenarios,
  onResetRuns,
  isRunningSuite,
}: NavbarProps) {
  const passRate = totalRuns > 0 ? Math.round((passCount / totalRuns) * 100) : 100;
  const isSandboxLive = paypalConfig?.connected;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B0F17]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Pay<span className="text-cyan-400">Path</span>
              </span>
              <span className="rounded-full bg-cyan-950/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-cyan-300 ring-1 ring-cyan-800/60">
                PAYPAL RELIABILITY LAB
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Chaos Testing, Invariant Verification & AI Diagnostics
            </p>
          </div>
        </div>

        {/* Live Badges */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          {/* Sandbox Status */}
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ring-1 ${
              isSandboxLive
                ? 'bg-emerald-950/40 text-emerald-300 ring-emerald-800/60'
                : 'bg-amber-950/40 text-amber-300 ring-amber-800/60'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSandboxLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-medium">
              {isSandboxLive ? 'PayPal Sandbox Live' : 'Fault-Injection Mode'}
            </span>
          </div>

          {/* AI Engine Status */}
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ring-1 ${
              aiConfig?.available
                ? 'bg-purple-950/40 text-purple-300 ring-purple-800/60'
                : 'bg-slate-900 text-slate-300 ring-slate-800'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-mono text-[11px]">
              {aiConfig?.available ? 'Gemini 2.5 Flash' : 'Expert System Rule Engine'}
            </span>
          </div>

          {/* Health Score */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-slate-300 ring-1 ring-slate-800">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>Health:</span>
            <span
              className={`font-bold ${
                passRate >= 90
                  ? 'text-emerald-400'
                  : passRate >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {passRate}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunAllScenarios}
            disabled={isRunningSuite}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 ${isRunningSuite ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isRunningSuite ? 'Testing Suite...' : 'Run Full Suite'}
            </span>
            <span className="sm:hidden">Run All</span>
          </button>

          <button
            onClick={onOpenWebhookModal}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white ring-1 ring-white/10"
          >
            <span>Webhook Simulator</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white ring-1 ring-white/10"
            title="Configure Sandbox & AI Keys"
          >
            <Sliders className="h-4 w-4" />
          </button>

          <button
            onClick={onResetRuns}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 p-2 text-slate-400 transition hover:bg-slate-700 hover:text-rose-400 ring-1 ring-white/10"
            title="Reset Run History"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
