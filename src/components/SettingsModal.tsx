'use client';

import React, { useState } from 'react';
import { X, Sliders, Shield, CheckCircle2, AlertCircle, RotateCw } from 'lucide-react';
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
      setTestResult(`Verification failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-[16px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 shadow-floating space-y-5 transition-colors">
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[var(--text-mute)]" />
            <h3 className="text-base font-semibold text-[var(--text-ink)] tracking-[-0.4px]">
              Integration & Security Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-[6px] p-1.5 text-[var(--text-mute)] hover:text-[var(--text-ink)] hover:bg-[var(--border-hairline-soft)] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Active Status */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 space-y-1">
            <span className="text-[var(--text-mute)] block text-[10px] uppercase font-mono font-medium">
              PayPal Sandbox Status
            </span>
            <div className="flex items-center gap-1.5 font-semibold pt-0.5 text-[var(--text-ink)]">
              {paypalConfig?.connected ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Connected to Sandbox</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-[var(--text-mute)]" />
                  <span>Fault-Injection Mode</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-body)] leading-relaxed">
              {paypalConfig?.connected
                ? 'Client ID & Secret configured in environment.'
                : 'Using simulated fault lab until Sandbox credentials configured.'}
            </p>
          </div>

          <div className="rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 space-y-1">
            <span className="text-[var(--text-mute)] block text-[10px] uppercase font-mono font-medium">
              AI Diagnostic Provider
            </span>
            <div className="flex items-center gap-1.5 font-semibold pt-0.5 text-[var(--text-ink)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{aiConfig?.available ? 'Google Gemini 2.5 Flash' : 'Deterministic Engine'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-body)] leading-relaxed">
              {aiConfig?.available
                ? 'Dynamic LLM root-cause synthesis active.'
                : 'Offline expert rule engine active (transparent fallback).'}
            </p>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="rounded-[8px] bg-[var(--bg-canvas)] p-4 border border-[var(--border-hairline)] text-xs text-[var(--text-body)] space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-[var(--text-ink)]">
            <Shield className="h-4 w-4 text-[var(--text-mute)]" />
            <span>Zero-Credential-Leakage Architecture</span>
          </div>
          <p className="text-xs text-[var(--text-body)] leading-relaxed">
            PayPath never commits or exposes secrets. All client requests and AI queries pass through recursive redaction sanitization, removing Bearer tokens, Basic authorization, client secrets, cardholder numbers, and PII.
          </p>
          <div className="font-mono text-[11px] bg-[var(--bg-elevated)] p-3 rounded-[6px] text-[var(--text-ink)] border border-[var(--border-hairline)] space-y-1">
            <div className="text-[var(--text-mute)]"># In local .env.local file:</div>
            <div>PAYPAL_CLIENT_ID=your_sandbox_client_id</div>
            <div>PAYPAL_CLIENT_SECRET=your_sandbox_client_secret</div>
            <div>GEMINI_API_KEY=your_gemini_api_key</div>
            <div className="text-[var(--text-mute)]">NEXT_PUBLIC_APP_URL=http://localhost:3000</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] px-4 h-9 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-whisper"
          >
            {isTesting ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" /> Verifying...
              </>
            ) : (
              'Refresh & Verify Status'
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-[100px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-4 h-9 text-xs font-medium text-[var(--text-ink)] hover:border-[var(--text-mute)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {testResult && (
          <div className="rounded-[8px] bg-[var(--bg-canvas)] p-3 text-xs font-mono text-[var(--text-ink)] border border-[var(--border-hairline)]">
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}
