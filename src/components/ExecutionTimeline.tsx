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
      return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />;
    }
    switch (type) {
      case 'HTTP_REQUEST':
      case 'HTTP_RESPONSE':
        return <Globe className="h-3.5 w-3.5 text-blue-400" />;
      case 'STATE_CHANGE':
        return <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />;
      case 'WEBHOOK_RECEIVED':
        return <Radio className="h-3.5 w-3.5 text-purple-400" />;
      case 'RECONCILIATION':
        return <Zap className="h-3.5 w-3.5 text-amber-400" />;
      case 'INVARIANT_CHECK':
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getSourceBadge = (source: TraceEvent['source']) => {
    switch (source) {
      case 'PAYPAL_API':
        return 'bg-blue-950 text-blue-300 border-blue-800/40';
      case 'BACKEND':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800/40';
      case 'CLIENT':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800/40';
      case 'WEBHOOK_DISPATCHER':
        return 'bg-purple-950 text-purple-300 border-purple-800/40';
      case 'AI_ENGINE':
        return 'bg-amber-950 text-amber-300 border-amber-800/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            Execution Trace & Timeline ({traces.length} Events)
          </h3>
          <p className="text-xs text-slate-400">
            Chronological audit log with sanitized payloads, headers, latency, and state mutations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'HTTP', 'STATE', 'WEBHOOK', 'FAULTS', 'RECON'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                filter === f
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
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
          <FileCode className="mx-auto h-8 w-8 text-slate-600" />
          <h4 className="mt-2 text-sm font-medium text-slate-400">No traces recorded yet</h4>
          <p className="text-xs text-slate-500">
            Select a test scenario above and click &quot;Run Scenario Test&quot; to generate real execution events.
          </p>
        </div>
      ) : (
        /* Timeline Feed */
        <div className="relative space-y-3 pl-4 sm:pl-6 border-l border-white/10 ml-2 mt-4">
          {filteredTraces.map((trace) => {
            const isExpanded = Boolean(expandedTraceIds[trace.id]);
            const hasPayload = Boolean(trace.sanitizedPayload);

            return (
              <div key={trace.id} className="relative group">
                {/* Node dot */}
                <div
                  className={`absolute -left-[23px] sm:-left-[31px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border ring-4 ring-[#0B0F17] ${
                    trace.status === 'ERROR' || trace.type === 'FAULT_INJECTED'
                      ? 'border-rose-500 bg-rose-950'
                      : trace.status === 'SUCCESS'
                      ? 'border-emerald-500 bg-emerald-950'
                      : 'border-cyan-500 bg-cyan-950'
                  }`}
                >
                  {getTypeIcon(trace.type, trace.status)}
                </div>

                {/* Content Box */}
                <div className="rounded-lg border border-white/5 bg-slate-950/60 p-3.5 transition hover:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{trace.title}</span>
                      <span
                        className={`rounded border px-1.5 py-0.2 font-mono text-[9px] font-semibold ${getSourceBadge(
                          trace.source
                        )}`}
                      >
                        {trace.source}
                      </span>
                      {trace.latencyMs !== undefined && (
                        <span className="rounded bg-slate-800/80 px-1.5 py-0.2 font-mono text-[10px] text-slate-300">
                          {trace.latencyMs}ms
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {trace.timestamp.slice(11, 23)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-300 leading-relaxed font-mono">
                    {trace.detail}
                  </p>

                  {/* Expand payload trigger */}
                  {hasPayload && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => toggleExpand(trace.id)}
                        className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="h-3 w-3" /> Hide Sanitized Payload
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-3 w-3" /> Inspect Headers & Body
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
                        className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300"
                        title="Copy payload JSON"
                      >
                        {copiedId === trace.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" /> Copied
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
                    <div className="mt-3 rounded bg-slate-950 p-3 font-mono text-[11px] text-slate-300 border border-white/10 overflow-x-auto max-h-60 custom-scrollbar">
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
