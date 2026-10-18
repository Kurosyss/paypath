'use client';

import React, { useState } from 'react';
import { X, Sliders, Shield, Key, CheckCircle2, AlertCircle, RotateCw } from 'lucide-react';
import { PayPalConfigStatus, AIConfigStatus } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paypalConfig: PayPalConfigStatus | null;
  aiConfig: AIConfigStatus | null;
  onRefreshConfig: () => Promise<void>;
}

export function SettingsModal({
  isOpen,
  onClose,
  paypalConfig,
  aiConfig,
  onRefreshConfig,
}: SettingsModalProps) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [webhookId, setWebhookId] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await onRefreshConfig();
      setTestResult('Configuration verified. Sandbox and AI status refreshed.');
    } catch (err: unknown) {
      setTestResult(`Test failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Integration & Security Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Status */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-white/5 bg-slate-950 p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">
              PayPal Sandbox Status
            </span>
            <div className="mt-1 flex items-center gap-1.5 font-semibold">
              {paypalConfig?.connected ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Connected to Sandbox</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-400">Fault-Injection Mode</span>
                </>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {paypalConfig?.connected
                ? 'Client ID & Secret configured in environment.'
                : 'Using simulated fault lab until Sandbox credentials provided.'}
            </p>
          </div>

          <div className="rounded-lg border border-white/5 bg-slate-950 p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">
              AI Diagnostic Provider
            </span>
            <div className="mt-1 flex items-center gap-1.5 font-semibold">
              {aiConfig?.available ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-purple-300">Google Gemini 2.5 Flash</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-cyan-300">Deterministic Rule Engine</span>
                </>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {aiConfig?.available
                ? 'Dynamic LLM root-cause synthesis active.'
                : 'Offline expert rule engine active (transparent fallback).'}
            </p>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="rounded-lg bg-slate-950/80 p-3.5 border border-white/5 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>Zero-Credential-Leakage Architecture</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            PayPath never commits or exposes secrets. All client requests and AI queries pass through our security sanitizer, redacting authorization tokens, cardholder numbers, and client secrets.
          </p>
          <div className="font-mono text-[11px] bg-slate-900 p-2 rounded text-slate-300 border border-white/5">
            <div># Create .env.local in paypath root:</div>
            <div className="text-cyan-400">PAYPAL_CLIENT_ID=your_sandbox_client_id</div>
            <div className="text-cyan-400">PAYPAL_CLIENT_SECRET=your_sandbox_client_secret</div>
            <div className="text-purple-400">GEMINI_API_KEY=your_gemini_api_key</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" /> Verifying Connection...
              </>
            ) : (
              'Refresh & Verify Status'
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        {testResult && (
          <div className="rounded-lg bg-slate-950 p-2.5 text-xs font-mono text-cyan-300 border border-cyan-800/40">
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}
