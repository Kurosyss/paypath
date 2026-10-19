'use client';

import React, { useState } from 'react';
import {
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Zap,
  Globe,
  Radio,
  AlertTriangle,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { TraceEvent } from '@/lib/types';

interface ExecutionTimelineProps {
  traces: TraceEvent[];
}

export function ExecutionTimeline({ traces }: ExecutionTimelineProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const [expandedTraceIds, setExpandedTraceIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedTraceIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTraces = traces.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'HTTP') return t.type === 'HTTP_REQUEST' || t.type === 'HTTP_RESPONSE';
    if (filter === 'STATE') return t.type === 'STATE_CHANGE';
    if (filter === 'WEBHOOK') return t.type === 'WEBHOOK_RECEIVED';
    if (filter === 'FAULTS') return t.type === 'FAULT_INJECTED' || t.status === 'ERROR';
    if (filter === 'RECON') return t.type === 'RECONCILIATION';
    return true;
  });

  const getTypeIcon = (type: TraceEvent['type'], status?: TraceEvent['status']) => {
    if (status === 'ERROR' || type === 'FAULT_INJECTED') {
      return <AlertTriangle className="h-3.5 w-3.5 text-[var(--text-ink)]" />;
    }
    switch (type) {
      case 'HTTP_REQUEST':
      case 'HTTP_RESPONSE':
        return <Globe className="h-3.5 w-3.5 text-[var(--text-ink)]" />;
      case 'STATE_CHANGE':
        return <ArrowRight className="h-3.5 w-3.5 text-[var(--text-ink)]" />;
      case 'WEBHOOK_RECEIVED':
        return <Radio className="h-3.5 w-3.5 text-[var(--text-ink)]" />;
      case 'RECONCILIATION':
        return <Zap className="h-3.5 w-3.5 text-[var(--text-ink)]" />;
      case 'INVARIANT_CHECK':
        return <ShieldCheck className="h-3.5 w-3.5 text-[var(--text-ink)]" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-[var(--text-mute)]" />;
    }
  };

  return (
    <div className="rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 shadow-whisper space-y-4 transition-colors">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-ink)] tracking-[-0.4px] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--text-mute)]" />
            Execution Trace & Timeline ({traces.length} Events)
          </h3>
          <p className="text-xs text-[var(--text-body)] mt-0.5">
            Chronological audit log with sanitized payloads, headers, latency, and state mutations.
          </p>
        </div>

        {/* Filter Pills (Vercel button-category-pill) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'HTTP', 'STATE', 'WEBHOOK', 'FAULTS', 'RECON'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-[64px] px-3 py-1 text-[11px] font-mono font-medium transition cursor-pointer border ${
                filter === f
                  ? 'bg-[var(--text-ink)] text-[var(--bg-canvas)] border-[var(--text-ink)] shadow-whisper'
                  : 'bg-[var(--bg-canvas)] text-[var(--text-body)] border-[var(--border-hairline)] hover:text-[var(--text-ink)] hover:border-[var(--text-mute)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {traces.length === 0 ? (
        <div className="py-12 text-center">
          <FileCode className="mx-auto h-8 w-8 text-[var(--text-mute)]" />
          <h4 className="mt-2 text-sm font-semibold text-[var(--text-ink)]">No traces recorded yet</h4>
          <p className="text-xs text-[var(--text-body)] mt-1 max-w-sm mx-auto">
            Select a test scenario in the Scenario Lab and click &quot;Run Scenario Test&quot; to generate execution events.
          </p>
        </div>
      ) : (
        /* Timeline Feed */
        <div className="relative space-y-3 pl-4 sm:pl-6 border-l border-[var(--border-hairline)] ml-2 mt-4">
          {filteredTraces.map((trace) => {
            const isExpanded = Boolean(expandedTraceIds[trace.id]);
            const hasPayload = Boolean(trace.sanitizedPayload);

            return (
              <div key={trace.id} className="relative group">
                {/* Node dot */}
                <div className="absolute -left-[23px] sm:-left-[31px] top-2 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-elevated)] ring-4 ring-[var(--bg-canvas)] text-[var(--text-mute)] shadow-whisper">
                  {getTypeIcon(trace.type, trace.status)}
                </div>

                {/* Content Box */}
                <div className="rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 transition hover:border-[var(--text-mute)] shadow-whisper">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[var(--text-ink)] tracking-[-0.2px]">
                        {trace.title}
                      </span>
                      <span className="rounded-[4px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[var(--text-mute)]">
                        {trace.source}
                      </span>
                      {trace.latencyMs !== undefined && (
                        <span className="rounded-[4px] bg-[var(--border-hairline-soft)] border border-[var(--border-hairline)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-body)]">
                          {trace.latencyMs}ms
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-[var(--text-mute)]">
                      {trace.timestamp.slice(11, 23)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-[var(--text-body)] leading-relaxed font-mono">
                    {trace.detail}
                  </p>

                  {/* Expand payload trigger */}
                  {hasPayload && (
                    <div className="mt-2.5 pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between">
                      <button
                        onClick={() => toggleExpand(trace.id)}
                        className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-ink)] hover:underline transition cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="h-3 w-3" /> Hide Sanitized Payload
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-3 w-3" /> Inspect Headers & Payload
                          </>
                        )}
                      </button>

                      <button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(trace.sanitizedPayload, null, 2),
                            trace.id
                          )
                        }
                        className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-mute)] hover:text-[var(--text-ink)] cursor-pointer"
                        title="Copy sanitized JSON payload"
                      >
                        {copiedId === trace.id ? (
                          <>
                            <Check className="h-3 w-3 text-[var(--text-ink)]" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy JSON
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Expandable JSON viewer */}
                  {isExpanded && hasPayload && (
                    <div className="mt-3 rounded-[8px] bg-[var(--bg-elevated)] p-3 font-mono text-[11px] text-[var(--text-ink)] border border-[var(--border-hairline)] overflow-x-auto max-h-60 custom-scrollbar">
                      <pre>{JSON.stringify(trace.sanitizedPayload, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
