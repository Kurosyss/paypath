/**
 * PayPath - Core Domain Types
 * PayPal Payment Reliability Lab
 */

export type OrderState =
  | 'CREATED'
  | 'SAVED'
  | 'APPROVED'
  | 'VOIDED'
  | 'COMPLETED'
  | 'PAYER_ACTION_REQUIRED'
  | 'DECLINED'
  | 'UNCERTAIN'
  | 'FAILED';

export type ScenarioId =
  | 'scenario-a-success'
  | 'scenario-b-declined'
  | 'scenario-c-uncertain-capture'
  | 'scenario-d-duplicate-webhook'
  | 'scenario-e-webhook-signature'
  | 'scenario-f-out-of-order'
  | 'scenario-g-api-error';

export type ExecutionMode =
  | 'REAL_SANDBOX'
  | 'FAULT_INJECTION'
  | 'OFFLINE_SIMULATION';

export type ExecutionStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'PASSED'
  | 'FAILED'
  | 'WARNING'
  | 'BLOCKED';

export interface InvariantResult {
  id: string;
  name: string;
  category: 'STATE_INTEGRITY' | 'IDEMPOTENCY' | 'SECURITY' | 'FAULT_TOLERANCE';
  passed: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
  expected: string;
  actual: string;
}

export interface TraceEvent {
  id: string;
  timestamp: string;
  type: 'HTTP_REQUEST' | 'HTTP_RESPONSE' | 'STATE_CHANGE' | 'WEBHOOK_RECEIVED' | 'INVARIANT_CHECK' | 'FAULT_INJECTED' | 'RECONCILIATION';
  source: 'CLIENT' | 'BACKEND' | 'PAYPAL_API' | 'WEBHOOK_DISPATCHER' | 'AI_ENGINE';
  title: string;
  detail: string;
  status?: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  latencyMs?: number;
  metadata?: Record<string, unknown>;
  sanitizedPayload?: {
    endpoint?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    status?: number;
  };
}

export interface ScenarioDefinition {
  id: ScenarioId;
  code: string;
  title: string;
  category: string;
  difficulty: 'STANDARD' | 'EDGE_CASE' | 'CHAOS';
  description: string;
  realWorldImpact: string;
  recommendedFixSnippet: string;
  defaultMode: ExecutionMode;
  invariants: string[];
}

export interface AIDiagnosisResult {
  rootCauseHypothesis: string;
  evidence: string[];
  confidence: number; // 0 - 100
  modelName: string;
  mode: 'LIVE_AI_MODEL' | 'DETERMINISTIC_EXPERT_SYSTEM';
  recommendedCodeFix: {
    filename: string;
    explanation: string;
    diff: string;
  };
  proposedRegressionTest: {
    testName: string;
    description: string;
    code: string;
  };
  nextDiagnosticAction: string;
  disclaimer: string;
}

export interface TestRunRecord {
  runId: string;
  scenarioId: ScenarioId;
  scenarioTitle: string;
  mode: ExecutionMode;
  status: ExecutionStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  orderId?: string;
  captureId?: string;
  initialState?: OrderState;
  finalState?: OrderState;
  traces: TraceEvent[];
  invariants: InvariantResult[];
  diagnosis?: AIDiagnosisResult;
  appliedFix?: boolean;
  regressionResult?: {
    verified: boolean;
    timestamp: string;
    message: string;
  };
  tags: string[];
}

export interface PayPalConfigStatus {
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasWebhookId: boolean;
  mode: 'SANDBOX' | 'LIVE_BLOCKED';
  connected: boolean;
  lastCheckedAt?: string;
  error?: string;
}

export interface AIConfigStatus {
  provider: 'gemini' | 'openai' | 'custom' | 'none';
  hasApiKey: boolean;
  model: string;
  available: boolean;
}

export interface PaymentConfirmationRecord {
  orderId: string;
  captureId?: string;
  amount: string;
  currency: string;
  status: OrderState;
  confirmedAt: string;
  updatedAt: string;
  captureAttempts: number;
  source: 'CHECKOUT_RETURN' | 'SCENARIO_RUN' | 'WEBHOOK' | 'RECONCILIATION';
}

