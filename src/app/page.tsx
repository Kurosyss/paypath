'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  FlaskConical,
  Clock,
  Sparkles,
  Cpu,
  History,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { OverviewSection } from '@/components/OverviewSection';
import { ScenarioLab } from '@/components/ScenarioLab';
import { ExecutionTimeline } from '@/components/ExecutionTimeline';
import { DiagnosticReport } from '@/components/DiagnosticReport';
import { RegressionViewer } from '@/components/RegressionViewer';
import { WebhookSimulatorModal } from '@/components/WebhookSimulatorModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthoritativePaymentCard } from '@/components/AuthoritativePaymentCard';
import {
  ScenarioDefinition,
  ScenarioId,
  ExecutionMode,
  TestRunRecord,
  PayPalConfigStatus,
  AIConfigStatus,
} from '@/lib/types';

export default function PayPathDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'lab' | 'timeline' | 'diagnostics' | 'regression' | 'docs'>('lab');
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('scenario-a-success');
  const [selectedMode, setSelectedMode] = useState<ExecutionMode>('REAL_SANDBOX');
  const [applyFix, setApplyFix] = useState<boolean>(false);
  const [activeRun, setActiveRun] = useState<TestRunRecord | null>(null);
  const [runs, setRuns] = useState<TestRunRecord[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isRunningSuite, setIsRunningSuite] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfigStatus | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfigStatus | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState<boolean>(false);

  // Fetch scenarios, config, and runs on load
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setPaypalConfig(data.paypal);
      setAiConfig(data.ai);
    } catch (e) {
      console.error('Failed to load config:', e);
    }
  }, []);

  const loadScenarios = useCallback(async () => {
    try {
      const res = await fetch('/api/scenarios/list');
      const data = await res.json();
      if (data.scenarios) {
        setScenarios(data.scenarios);
      }
    } catch (e) {
      console.error('Failed to load scenarios:', e);
    }
  }, []);

  const loadRuns = useCallback(async () => {
    try {
      const res = await fetch('/api/runs');
      const data = await res.json();
      if (data.runs) {
        setRuns(data.runs);
        if (data.runs.length > 0 && !activeRun) {
          setActiveRun(data.runs[0]);
          setSelectedScenarioId(data.runs[0].scenarioId);
          setSelectedMode(data.runs[0].mode);
          setApplyFix(data.runs[0].appliedFix);
        }
      }
    } catch (e) {
      console.error('Failed to load runs:', e);
    }
  }, [activeRun]);

  useEffect(() => {
    loadConfig();
    loadScenarios();
    loadRuns();
  }, [loadConfig, loadScenarios, loadRuns]);

  // Execute single scenario
  const handleRunScenario = async (
    scenarioId: ScenarioId,
    mode: ExecutionMode,
    withFix: boolean
  ) => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/scenarios/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId,
          mode,
          applyFix: withFix,
        }),
      });
      const data = await res.json();
      const record = data.runRecord || (data.runId ? data : null);
      if (record) {
        setActiveRun(record);
        setSelectedScenarioId(scenarioId);
        setSelectedMode(mode);
        setApplyFix(withFix);
        setRuns((prev) => [record, ...prev]);
        if (record.status === 'FAILED') {
          setActiveTab('diagnostics');
        }
      }
    } catch (e) {
      console.error('Failed to run scenario:', e);
    } finally {
      setIsRunning(false);
    }
  };

  // Run full regression suite
  const handleRunAllScenarios = async () => {
    setIsRunningSuite(true);
    for (const sc of scenarios) {
      await handleRunScenario(sc.id, selectedMode, applyFix);
    }
    setIsRunningSuite(false);
    setActiveTab('overview');
  };

  // Reset runs
  const handleResetRuns = async () => {
    try {
      await fetch('/api/runs', { method: 'DELETE' });
      setRuns([]);
      setActiveRun(null);
    } catch (e) {
      console.error('Failed to clear runs:', e);
    }
  };

  // One-click Apply Fix & Verify Regression
  const handleApplyFixAndVerify = async () => {
    if (!activeRun) return;
    setIsVerifying(true);
    try {
      setApplyFix(true);
      await handleRunScenario(activeRun.scenarioId, activeRun.mode, true);
      setActiveTab('regression');
    } finally {
      setIsVerifying(false);
    }
  };

  const passCount = runs.filter((r) => r.status === 'PASSED').length;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-ink)] flex flex-col font-sans transition-colors duration-150">
      {/* Navbar (Vercel Geist nav-bar) */}
      <Navbar
        paypalConfig={paypalConfig}
        aiConfig={aiConfig}
        totalRuns={runs.length}
        passCount={passCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
        onRunAllScenarios={handleRunAllScenarios}
        onResetRuns={handleResetRuns}
        isRunningSuite={isRunningSuite}
      />

      {/* Hero Band (Strict monochrome, tight display typography) */}
      <section className="relative overflow-hidden border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)] py-10 sm:py-14 transition-colors">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 rounded-[64px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-3 py-1 shadow-whisper">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-ink)]" />
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-body)] font-medium">
                PayPal AI Hackathon 2026 &middot; Payment Reliability Lab
              </span>
            </div>

            <h1 className="font-display-xl text-3xl sm:text-5xl text-[var(--text-ink)] tracking-[-2.4px] leading-tight">
              Test real PayPal flows.<br />
              {aiConfig?.available
                ? 'Expose failure weaknesses with AI.'
                : 'Expose failure weaknesses with Automated Invariants.'}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-body)] leading-relaxed max-w-2xl">
              PayPath combines chaotic payment fault injection, 10 formal safety invariants, recursive trace sanitization, and {aiConfig?.available ? 'Google Gemini AI diagnostics' : 'deterministic diagnostic rule engine'} to harden PayPal checkouts before production.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedScenarioId('scenario-a-success');
                  setActiveTab('lab');
                }}
                className="inline-flex items-center gap-2 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] px-5 h-10 font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-whisper"
              >
                <span>Launch Scenario Lab</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className="inline-flex items-center gap-2 rounded-[100px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--text-ink)] px-5 h-10 font-medium text-sm hover:border-[var(--text-mute)] transition-colors cursor-pointer shadow-whisper"
              >
                <span>Inspect Invariant Matrix</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Compact Authoritative Payment Confirmation Card */}
        <AuthoritativePaymentCard />

        {/* Navigation Tabs (Vercel Geist tab chrome) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-2.5">
          <nav className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
            {[
              { id: 'lab', label: 'Scenario Lab', icon: FlaskConical },
              { id: 'overview', label: 'Overview Matrix', icon: ShieldCheck },
              { id: 'timeline', label: 'Trace Timeline', icon: Clock, badge: activeRun?.traces.length },
              { id: 'diagnostics', label: aiConfig?.available ? 'AI Diagnostic Studio' : 'Diagnostic Studio', icon: Cpu },
              { id: 'regression', label: 'Regression Suite', icon: History, count: runs.length },
              { id: 'docs', label: 'Integration Docs', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[var(--text-ink)] text-[var(--bg-canvas)] shadow-whisper font-semibold'
                      : 'text-[var(--text-body)] hover:text-[var(--text-ink)] hover:bg-[var(--border-hairline-soft)]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="rounded-[4px] bg-[var(--border-hairline-soft)] border border-[var(--border-hairline)] px-1.5 py-0.2 text-[10px] font-mono text-[var(--text-body)]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Active Run Pill */}
          {activeRun && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[var(--text-body)] bg-[var(--bg-elevated)] px-3 py-1 rounded-[6px] border border-[var(--border-hairline)] shadow-whisper">
              <span className="text-[var(--text-mute)]">Active:</span>
              <span className="font-semibold text-[var(--text-ink)]">{activeRun.scenarioTitle}</span>
              <span className="px-1.5 py-0.2 rounded-[4px] font-semibold text-[10px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-ink)]">
                {activeRun.status}
              </span>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'lab' && (
          <ScenarioLab
            scenarios={scenarios}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={(id) => {
              setSelectedScenarioId(id);
              const found = scenarios.find((s) => s.id === id);
              if (found) setSelectedMode(found.defaultMode);
            }}
            onRunScenario={handleRunScenario}
            activeRun={activeRun}
            isRunning={isRunning}
            selectedMode={selectedMode}
            onModeChange={(m) => setSelectedMode(m)}
            applyFix={applyFix}
            onToggleApplyFix={(val) => setApplyFix(val)}
          />
        )}

        {activeTab === 'overview' && (
          <OverviewSection runs={runs} paypalConfig={paypalConfig} />
        )}

        {activeTab === 'timeline' && (
          <ExecutionTimeline traces={activeRun?.traces || []} />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticReport
            diagnosis={activeRun?.diagnosis}
            invariants={activeRun?.invariants || []}
            onApplyFixAndVerify={handleApplyFixAndVerify}
            isVerifying={isVerifying}
          />
        )}

        {activeTab === 'regression' && (
          <RegressionViewer
            runs={runs}
            selectedRunId={activeRun?.runId}
            onSelectRun={(r) => {
              setActiveRun(r);
              setSelectedScenarioId(r.scenarioId);
              setActiveTab('diagnostics');
            }}
          />
        )}

        {activeTab === 'docs' && (
          <div className="rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-whisper space-y-6 text-xs text-[var(--text-body)] leading-relaxed transition-colors">
            <div className="border-b border-[var(--border-hairline)] pb-4">
              <h3 className="text-xl font-semibold text-[var(--text-ink)] tracking-[-0.4px] flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[var(--text-mute)]" />
                PayPal Payment Reliability Lab &middot; Architecture Specification
              </h3>
              <p className="text-[var(--text-mute)] mt-1">
                Formal engineering patterns for building resilient, zero-defect PayPal checkout integrations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2 border-t border-[var(--border-hairline)] pt-4 first:border-t-0 first:pt-0">
                <h4 className="font-semibold text-[var(--text-ink)] text-sm tracking-[-0.2px]">
                  1. Idempotency with PayPal-Request-Id
                </h4>
                <p>
                  All mutating requests (order creation and capture) must include a unique, deterministic <code className="font-mono text-[11px] text-[var(--text-ink)] bg-[var(--bg-canvas)] px-1 py-0.5 rounded border border-[var(--border-hairline)]">PayPal-Request-Id</code> HTTP header.
                  If network packet loss causes a client timeout, re-sending with the identical idempotency key prevents duplicate charges.
                </p>
              </div>

              <div className="space-y-2 border-t border-[var(--border-hairline)] pt-4 md:border-t-0 md:pt-0">
                <h4 className="font-semibold text-[var(--text-ink)] text-sm tracking-[-0.2px]">
                  2. Authoritative State Reconciliation
                </h4>
                <p>
                  Never blindly retry a timed-out <code className="font-mono text-[11px] text-[var(--text-ink)] bg-[var(--bg-canvas)] px-1 py-0.5 rounded border border-[var(--border-hairline)]">/capture</code> call. Always execute <code className="font-mono text-[11px] text-[var(--text-ink)] bg-[var(--bg-canvas)] px-1 py-0.5 rounded border border-[var(--border-hairline)]">GET /v2/checkout/orders/{'{id}'}</code> first.
                  If the PayPal ledger indicates the order is already <code className="font-mono text-[11px] text-[var(--text-ink)] bg-[var(--bg-canvas)] px-1 py-0.5 rounded border border-[var(--border-hairline)]">COMPLETED</code>, fulfill without duplicate capture.
                </p>
              </div>

              <div className="space-y-2 border-t border-[var(--border-hairline)] pt-4">
                <h4 className="font-semibold text-[var(--text-ink)] text-sm tracking-[-0.2px]">
                  3. Webhook Deduplication
                </h4>
                <p>
                  PayPal webhooks guarantee at-least-once delivery. Network retries can dispatch duplicate events.
                  Store every <code className="font-mono text-[11px] text-[var(--text-ink)] bg-[var(--bg-canvas)] px-1 py-0.5 rounded border border-[var(--border-hairline)]">event_id</code> in an atomic key store and acknowledge duplicates with HTTP 200 without double fulfillment.
                </p>
              </div>

              <div className="space-y-2 border-t border-[var(--border-hairline)] pt-4">
                <h4 className="font-semibold text-[var(--text-ink)] text-sm tracking-[-0.2px]">
                  4. Cryptographic Signature Verification
                </h4>
                <p>
                  Never trust raw webhook payloads. Verify headers using PayPal&apos;s official <code className="font-mono text-[11px] text-[var(--text-ink)] bg-[var(--bg-canvas)] px-1 py-0.5 rounded border border-[var(--border-hairline)]">/v1/notifications/verify-webhook-signature</code> API or asymmetric RSA-SHA256 cert verification before updating ledger state.
                </p>
              </div>

              <div className="space-y-2 border-t border-[var(--border-hairline)] pt-4">
                <h4 className="font-semibold text-[var(--text-ink)] text-sm tracking-[-0.2px]">
                  5. Monotonic State Progression
                </h4>
                <p>
                  Terminal payment states (<code className="font-mono text-[11px] text-[var(--text-ink)] bg-[var(--bg-canvas)] px-1 py-0.5 rounded border border-[var(--border-hairline)]">COMPLETED</code>, <code className="font-mono text-[11px] text-[var(--text-ink)] bg-[var(--bg-canvas)] px-1 py-0.5 rounded border border-[var(--border-hairline)]">VOIDED</code>) must never be reverted by late-arriving asynchronous webhooks.
                </p>
              </div>

              <div className="space-y-2 border-t border-[var(--border-hairline)] pt-4">
                <h4 className="font-semibold text-[var(--text-ink)] text-sm tracking-[-0.2px]">
                  6. Zero Credential Leakage
                </h4>
                <p>
                  Sanitize all debug payloads. Never allow client secrets, OAuth bearer tokens, or card credentials to enter application log streams, browser traces, or LLM prompts.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer (Vercel footer from DESIGN.md) */}
      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-canvas)] py-6 text-xs text-[var(--text-mute)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-ink)]">PayPath</span>
            <span>&middot; PayPal AI Hackathon 2026 Submission</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Next.js 16 App Router</span>
            <span>&middot; PayPal Orders v2 REST</span>
            <span>&middot; {aiConfig?.available ? 'Gemini 2.5 Flash' : 'Deterministic Rule Engine'}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        paypalConfig={paypalConfig}
        aiConfig={aiConfig}
        onRefreshConfig={loadConfig}
      />

      <WebhookSimulatorModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onEventDispatched={loadRuns}
      />
    </div>
  );
}
