'use client';

import React, { useState } from 'react';
import { Radio, X, Send, ShieldAlert, CheckCircle2, RotateCw } from 'lucide-react';

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
          value: '25.00',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">PayPal Webhook Simulator</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Dispatch test webhooks to your local receiver to verify idempotency, deduplication, and signature security.
        </p>

        {/* Form Controls */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="PAYMENT.CAPTURE.COMPLETED">PAYMENT.CAPTURE.COMPLETED</option>
              <option value="CHECKOUT.ORDER.APPROVED">CHECKOUT.ORDER.APPROVED</option>
              <option value="PAYMENT.CAPTURE.DENIED">PAYMENT.CAPTURE.DENIED</option>
              <option value="PAYMENT.CAPTURE.REFUNDED">PAYMENT.CAPTURE.REFUNDED</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-slate-200 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Event ID (Deduplication Key)</label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-slate-200 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Fault Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDuplicate}
                onChange={(e) => {
                  setIsDuplicate(e.target.checked);
                  if (e.target.checked) {
                    // keep eventId constant to trigger duplicate
                  } else {
                    setEventId(`WH-EVT-${Date.now()}`);
                  }
                }}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500"
              />
              <span className="text-slate-300">
                Test Duplicate Replay (Re-uses identical Event ID)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTamperedSig}
                onChange={(e) => setIsTamperedSig(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-rose-500"
              />
              <span className="text-rose-300">
                Simulate Forged / Tampered Cryptographic Signature
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSendWebhook}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" /> Dispatching Event...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Dispatch Webhook to Receiver
              </>
            )}
          </button>
        </div>

        {/* Result Snapshot */}
        {result && (
          <div className="rounded-lg border border-white/10 bg-slate-950 p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 block text-[10px]">RECEIVER RESPONSE:</span>
            <pre className="text-slate-200 overflow-x-auto max-h-36 custom-scrollbar">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
