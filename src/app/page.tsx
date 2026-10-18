'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  FlaskConical,
  Clock,
  Sparkles,
  History,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { OverviewSection } from '@/components/OverviewSection';
import { ScenarioLab } from '@/components/ScenarioLab';
import { ExecutionTimeline } from '@/components/ExecutionTimeline';
import { DiagnosticReport } from '@/components/DiagnosticReport';
import { RegressionViewer } from '@/components/RegressionViewer';
import { WebhookSimulatorModal } from '@/components/WebhookSimulatorModal';
import { SettingsModal } from '@/components/SettingsModal';
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
      setActiveRun(data);
      setRuns((prev) => [data, ...prev.filter((r) => r.runId !== data.runId)]);
      // Auto-switch to timeline or diagnostics if failed
      if (data.status === 'FAILED') {
        setActiveTab('diagnostics');
      }
    } catch (err) {
      console.error('Failed to run scenario:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Run full suite sequentially
  const handleRunAllScenarios = async () => {
    if (scenarios.length === 0) return;
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
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navbar */}
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

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <nav className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {[
              { id: 'lab', label: 'Scenario Lab', icon: FlaskConical },
              { id: 'overview', label: 'Overview Matrix', icon: ShieldCheck },
              { id: 'timeline', label: 'Trace Timeline', icon: Clock, badge: activeRun?.traces.length },
              { id: 'diagnostics', label: 'AI Diagnostic Studio', icon: Sparkles, highlight: activeRun?.status === 'FAILED' },
              { id: 'regression', label: 'Regression Suite', icon: History, count: runs.length },
              { id: 'docs', label: 'Integration Docs', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${tab.highlight ? 'text-rose-400 animate-pulse' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                      {tab.badge}
                    </span>
                  )}
                  {tab.highlight && (
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Status Pill */}
          {activeRun && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
              <span>Active Run:</span>
              <span className="text-cyan-400 font-bold">{activeRun.scenarioTitle}</span>
              <span
                className={`px-1.5 rounded font-bold text-[10px] ${
                  activeRun.status === 'PASSED'
                    ? 'bg-emerald-950 text-emerald-300'
                    : 'bg-rose-950 text-rose-300'
                }`}
              >
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
            onSelectScenario={(id) => setSelectedScenarioId(id)}
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
              setActiveTab('diagnostics');
            }}
          />
        )}

        {activeTab === 'docs' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-6 text-xs text-slate-300 leading-relaxed">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                PayPal Payment Reliability Lab — Integration Architecture
              </h3>
              <p className="text-slate-400 mt-1">
                Engineering guidelines for building fault-tolerant PayPal checkout and webhook processing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-950 p-4 border border-white/5 space-y-2">
                  <h4 className="font-semibold text-cyan-300 text-sm">1. Idempotency with PayPal-Request-Id</h4>
                  <p>
                    All mutating requests (order creation and capture) must include a unique, deterministic <code className="text-cyan-400 font-mono">PayPal-Request-Id</code> HTTP header.
                    If a network timeout occurs and your server re-sends the request, PayPal detects the idempotency key and prevents duplicate charges.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950 p-4 border border-white/5 space-y-2">
                  <h4 className="font-semibold text-cyan-300 text-sm">2. Authoritative State Reconciliation</h4>
                  <p>
                    Never retry a timed-out <code className="text-cyan-400 font-mono">/capture</code> call blindly. Always execute <code className="text-cyan-400 font-mono">GET /v2/checkout/orders/&#123;id&#125;</code> first.
                    If the PayPal ledger indicates the order is already <code className="text-emerald-400 font-mono">COMPLETED</code>, fulfill the order without calling capture again.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950 p-4 border border-white/5 space-y-2">
                  <h4 className="font-semibold text-cyan-300 text-sm">3. Webhook Deduplication</h4>
                  <p>
                    PayPal webhooks guarantee at-least-once delivery. Network retries can dispatch duplicate <code className="text-cyan-400 font-mono">PAYMENT.CAPTURE.COMPLETED</code> events.
                    Store every <code className="text-cyan-400 font-mono">event_id</code> in an atomic key store (Redis or unique DB constraint) and immediately acknowledge duplicates with HTTP 200 without double fulfillment.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-slate-950 p-4 border border-white/5 space-y-2">
                  <h4 className="font-semibold text-cyan-300 text-sm">4. Cryptographic Signature Verification</h4>
                  <p>
                    Never trust raw webhook payloads. Verify headers using PayPal&apos;s <code className="text-cyan-400 font-mono">/v1/notifications/verify-webhook-signature</code> API or asymmetric RSA-SHA256 cert verification before updating order status.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950 p-4 border border-white/5 space-y-2">
                  <h4 className="font-semibold text-cyan-300 text-sm">5. Monotonic State Progression</h4>
                  <p>
                    Terminal payment states (<code className="text-emerald-400 font-mono">COMPLETED</code>, <code className="text-rose-400 font-mono">VOIDED</code>) must never be reverted by late-arriving asynchronous webhooks (e.g. late <code className="text-cyan-400 font-mono">CHECKOUT.ORDER.APPROVED</code>).
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950 p-4 border border-white/5 space-y-2">
                  <h4 className="font-semibold text-cyan-300 text-sm">6. Zero Credential Leakage</h4>
                  <p>
                    Sanitize all debug payloads. Never allow client secrets, OAuth bearer tokens, or card credentials to enter application log streams, traces, or LLM prompts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PayPath</span>
            <span>· PayPal AI Hackathon 2026 Submission</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>MIT Licensed</span>
            <span>· Built with Next.js, TypeScript, PayPal Orders v2 & Gemini AI</span>
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
