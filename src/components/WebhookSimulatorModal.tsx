'use client';

import React, { useState } from 'react';
import { Radio, X, Send, RotateCw } from 'lucide-react';

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventDispatched?: () => void;
}

export function WebhookSimulatorModal({
  isOpen,
  onClose,
  onEventDispatched,
}: WebhookSimulatorModalProps) {
  const [eventType, setEventType] = useState('PAYMENT.CAPTURE.COMPLETED');
  const [orderId, setOrderId] = useState('ORD-TEST-8801');
  const [eventId, setEventId] = useState('WH-EVT-8801');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isTamperedSig, setIsTamperedSig] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  if (!isOpen) return null;

  const handleSendWebhook = async () => {
    setIsSending(true);
    setResult(null);

    const payload = {
      id: eventId,
      event_version: '1.0',
      create_time: new Date().toISOString(),
      resource_type: 'capture',
      event_type: eventType,
      summary: `Payment capture event for ${orderId}`,
      resource: {
        id: `CAP-${orderId}`,
        parent_payment: orderId,
        amount: {
          currency_code: 'USD',
          value: '10.00',
        },
        status: eventType === 'PAYMENT.CAPTURE.COMPLETED' ? 'COMPLETED' : 'DECLINED',
      },
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'paypal-auth-algo': 'SHA256withRSA',
      'paypal-cert-url': 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-SANDBOX',
      'paypal-transmission-id': `TX-${Date.now()}`,
      'paypal-transmission-time': new Date().toISOString(),
      'paypal-transmission-sig': isTamperedSig ? 'INVALID_FORGED_SIGNATURE' : 'VALID_TEST_SIG',
      'x-paypath-test-auth': isTamperedSig ? 'false' : 'true',
    };

    try {
      const res = await fetch('/api/paypal/webhook', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
      if (onEventDispatched) onEventDispatched();
    } catch (err: unknown) {
      setResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[16px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 shadow-floating space-y-4 transition-colors">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[var(--text-mute)]" />
            <h3 className="text-base font-semibold text-[var(--text-ink)] tracking-[-0.4px]">
              PayPal Webhook Simulator
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

        <p className="text-xs text-[var(--text-body)] leading-relaxed">
          Dispatch test webhooks to verify idempotency deduplication and cryptographic signature verification.
        </p>

        {/* Form Controls */}
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[var(--text-body)] font-medium mb-1.5 font-mono text-[11px]">
              EVENT TYPE
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-[var(--text-ink)] font-mono text-xs focus:outline-none focus:border-[var(--text-ink)] cursor-pointer"
            >
              <option value="PAYMENT.CAPTURE.COMPLETED">PAYMENT.CAPTURE.COMPLETED</option>
              <option value="CHECKOUT.ORDER.APPROVED">CHECKOUT.ORDER.APPROVED</option>
              <option value="PAYMENT.CAPTURE.DENIED">PAYMENT.CAPTURE.DENIED</option>
              <option value="PAYMENT.CAPTURE.REFUNDED">PAYMENT.CAPTURE.REFUNDED</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-body)] font-medium mb-1.5 font-mono text-[11px]">
                ORDER ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-[var(--text-ink)] font-mono text-xs focus:outline-none focus:border-[var(--text-ink)]"
              />
            </div>
            <div>
              <label className="block text-[var(--text-body)] font-medium mb-1.5 font-mono text-[11px]">
                EVENT ID (DEDUP KEY)
              </label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-[var(--text-ink)] font-mono text-xs focus:outline-none focus:border-[var(--text-ink)]"
              />
            </div>
          </div>

          {/* Fault Toggles */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-hairline)]">
            <label className="flex items-center gap-2 cursor-pointer text-[var(--text-body)] hover:text-[var(--text-ink)]">
              <input
                type="checkbox"
                checked={isDuplicate}
                onChange={(e) => {
                  setIsDuplicate(e.target.checked);
                  if (!e.target.checked) {
                    setEventId(`WH-EVT-${Date.now()}`);
                  }
                }}
                className="rounded-[4px] border-[var(--border-hairline)] accent-[var(--text-ink)]"
              />
              <span className="text-xs">
                Test Duplicate Replay (Re-uses identical Event ID)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-[var(--text-body)] hover:text-[var(--text-ink)]">
              <input
                type="checkbox"
                checked={isTamperedSig}
                onChange={(e) => setIsTamperedSig(e.target.checked)}
                className="rounded-[4px] border-[var(--border-hairline)] accent-[var(--text-ink)]"
              />
              <span className="text-xs">
                Simulate Forged / Tampered Cryptographic Signature
              </span>
            </label>
          </div>
        </div>

        {/* Action Button (Pill CTA) */}
        <div className="pt-2">
          <button
            onClick={handleSendWebhook}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 rounded-[100px] bg-[var(--text-ink)] text-[var(--bg-canvas)] px-4 h-10 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-whisper"
          >
            {isSending ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" /> Dispatching Event...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" /> Dispatch Webhook to Receiver
              </>
            )}
          </button>
        </div>

        {/* Result Snapshot */}
        {result && (
          <div className="rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-xs font-mono space-y-1">
            <span className="text-[var(--text-mute)] block text-[10px]">RECEIVER RESPONSE:</span>
            <pre className="text-[var(--text-ink)] overflow-x-auto max-h-36 custom-scrollbar">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
