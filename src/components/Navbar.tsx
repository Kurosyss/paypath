'use client';

import React from 'react';
import { Play, RotateCcw, Sliders, Radio, Activity, Sparkles } from 'lucide-react';
import { PayPalConfigStatus, AIConfigStatus } from '@/lib/types';
import { ThemeToggle } from './ThemeToggle';
import { BrandMark } from './BrandMark';

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
  const isSandboxLive = Boolean(paypalConfig?.connected);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-[var(--text-ink)] shadow-whisper">
            <BrandMark size={16} className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-[-0.4px] text-[var(--text-ink)]">
              PayPath
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-mute)] bg-[var(--border-hairline-soft)] px-1.5 py-0.5 rounded-[4px] font-medium border border-[var(--border-hairline)]">
              Reliability Lab
            </span>
          </div>
        </div>

        {/* Live Status Indicators (Geist Mono technical spec, strict monochrome) */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
          {/* Sandbox Status */}
          <div className="flex items-center gap-2 rounded-[6px] px-2.5 py-1 border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-body)]">
            <span className={`h-1.5 w-1.5 rounded-full ${isSandboxLive ? 'bg-[var(--text-ink)]' : 'border border-[var(--text-mute)]'}`} />
            <span className="text-[11px]">
              {isSandboxLive ? 'SANDBOX CONNECTED' : 'FAULT INJECTION'}
            </span>
          </div>

          {/* AI Engine Status */}
          <div className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-body)]">
            <Sparkles className="h-3 w-3 text-[var(--text-mute)]" />
            <span className="text-[11px]">
              {aiConfig?.available ? 'GEMINI 2.5 FLASH' : 'DETERMINISTIC ENGINE'}
            </span>
          </div>

          {/* Health Score */}
          <div className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-body)]">
            <Activity className="h-3 w-3 text-[var(--text-mute)]" />
            <span className="text-[11px]">SUITE:</span>
            <span className="font-semibold text-[11px] text-[var(--text-ink)]">
              {passRate}%
            </span>
          </div>
        </div>

        {/* Actions (Vercel 6px square buttons for app chrome) */}
        <div className="flex items-center gap-2">
          {/* Run Suite CTA */}
          <button
            onClick={onRunAllScenarios}
            disabled={isRunningSuite}
            className="flex items-center gap-1.5 rounded-[6px] bg-[var(--text-ink)] text-[var(--bg-canvas)] px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-whisper"
          >
            <Play className={`h-3 w-3 ${isRunningSuite ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isRunningSuite ? 'Running Suite...' : 'Run Full Suite'}
            </span>
            <span className="sm:hidden">Run All</span>
          </button>

          {/* Webhook Simulator Modal Trigger */}
          <button
            onClick={onOpenWebhookModal}
            className="hidden sm:flex items-center gap-1.5 rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-ink)] px-2.5 py-1.5 text-xs font-medium hover:border-[var(--text-mute)] transition-colors cursor-pointer"
          >
            <Radio className="h-3 w-3 text-[var(--text-mute)]" />
            <span>Webhooks</span>
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center w-8 h-8 rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-body)] hover:text-[var(--text-ink)] hover:border-[var(--text-mute)] transition-colors cursor-pointer"
            title="Configure Credentials & Settings"
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>

          {/* Reset Runs */}
          <button
            onClick={onResetRuns}
            className="flex items-center justify-center w-8 h-8 rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-body)] hover:text-[var(--text-ink)] hover:border-[var(--text-mute)] transition-colors cursor-pointer"
            title="Reset Test Run History"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Dark / Light Mode Switcher */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
