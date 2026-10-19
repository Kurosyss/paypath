/**
 * PayPath - Lightweight Persistent Storage
 * Stores test run records, order lifecycle events, and trace logs
 * Uses local JSON storage with in-memory caching for zero-setup portability.
 */

import fs from 'fs';
import path from 'path';
import { TestRunRecord, OrderState, PaymentConfirmationRecord } from './types';

const DATA_DIR = path.join(process.cwd(), '.paypath-data');
const RUNS_FILE = path.join(DATA_DIR, 'runs.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const DEDUPLICATION_FILE = path.join(DATA_DIR, 'webhook-dedup.json');

// Ensure directory exists
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// In-memory cache for fast lookups
let cachedRuns: TestRunRecord[] = [];
let isLoaded = false;

let cachedPayments: PaymentConfirmationRecord[] = [];
let isPaymentsLoaded = false;

function loadPayments(): PaymentConfirmationRecord[] {
  if (isPaymentsLoaded) return cachedPayments;
  ensureStorage();
  if (fs.existsSync(PAYMENTS_FILE)) {
    try {
      const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
      cachedPayments = JSON.parse(data);
    } catch {
      cachedPayments = [];
    }
  } else {
    cachedPayments = [];
  }
  isPaymentsLoaded = true;
  return cachedPayments;
}

function savePayments(payments: PaymentConfirmationRecord[]): void {
  ensureStorage();
  cachedPayments = payments;
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf-8');
}

export function getPaymentRecord(orderId: string): PaymentConfirmationRecord | undefined {
  return loadPayments().find((p) => p.orderId === orderId);
}

export function getAllPaymentRecords(): PaymentConfirmationRecord[] {
  return loadPayments().sort(
    (a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime()
  );
}

export function savePaymentRecord(record: PaymentConfirmationRecord): PaymentConfirmationRecord {
  const payments = loadPayments();
  const existingIdx = payments.findIndex((p) => p.orderId === record.orderId);
  if (existingIdx >= 0) {
    const existing = payments[existingIdx];
    payments[existingIdx] = {
      ...existing,
      ...record,
      captureAttempts: existing.status === 'COMPLETED' ? existing.captureAttempts : existing.captureAttempts + (record.captureAttempts || 1),
      updatedAt: new Date().toISOString(),
    };
    savePayments(payments);
    return payments[existingIdx];
  } else {
    payments.unshift(record);
    savePayments(payments);
    return record;
  }
}

function loadRuns(): TestRunRecord[] {
  if (isLoaded) return cachedRuns;
  ensureStorage();
  if (fs.existsSync(RUNS_FILE)) {
    try {
      const data = fs.readFileSync(RUNS_FILE, 'utf-8');
      cachedRuns = JSON.parse(data);
    } catch {
      cachedRuns = [];
    }
  } else {
    cachedRuns = [];
  }
  isLoaded = true;
  return cachedRuns;
}

function saveRuns(runs: TestRunRecord[]): void {
  ensureStorage();
  cachedRuns = runs;
  fs.writeFileSync(RUNS_FILE, JSON.stringify(runs, null, 2), 'utf-8');
}

export function getAllRuns(): TestRunRecord[] {
  return loadRuns().sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

export function getRunById(runId: string): TestRunRecord | undefined {
  return loadRuns().find((r) => r.runId === runId);
}

export function saveRunRecord(record: TestRunRecord): void {
  const runs = loadRuns();
  const existingIdx = runs.findIndex((r) => r.runId === record.runId);
  if (existingIdx >= 0) {
    runs[existingIdx] = record;
  } else {
    runs.unshift(record);
  }
  saveRuns(runs);
}

export function clearAllRuns(): void {
  saveRuns([]);
}

// Webhook deduplication store
interface WebhookEventRecord {
  eventId: string;
  eventType: string;
  firstReceivedAt: string;
  receiveCount: number;
  fulfillmentStatus: 'PROCESSED' | 'SKIPPED_DUPLICATE';
  orderId?: string;
  state: OrderState;
}

let cachedDedup: Record<string, WebhookEventRecord> = {};
let isDedupLoaded = false;

function loadDedup(): Record<string, WebhookEventRecord> {
  if (isDedupLoaded) return cachedDedup;
  ensureStorage();
  if (fs.existsSync(DEDUPLICATION_FILE)) {
    try {
      const data = fs.readFileSync(DEDUPLICATION_FILE, 'utf-8');
      cachedDedup = JSON.parse(data);
    } catch {
      cachedDedup = {};
    }
  } else {
    cachedDedup = {};
  }
  isDedupLoaded = true;
  return cachedDedup;
}

function saveDedup(data: Record<string, WebhookEventRecord>): void {
  ensureStorage();
  cachedDedup = data;
  fs.writeFileSync(DEDUPLICATION_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Atomic deduplication check for webhook events
 * Returns { isDuplicate: boolean, record: WebhookEventRecord }
 */
export function recordWebhookEvent(
  eventId: string,
  eventType: string,
  orderId?: string,
  state: OrderState = 'COMPLETED'
): { isDuplicate: boolean; record: WebhookEventRecord } {
  const store = loadDedup();
  const existing = store[eventId];

  if (existing) {
    existing.receiveCount += 1;
    saveDedup(store);
    return {
      isDuplicate: true,
      record: existing,
    };
  }

  const newRecord: WebhookEventRecord = {
    eventId,
    eventType,
    firstReceivedAt: new Date().toISOString(),
    receiveCount: 1,
    fulfillmentStatus: 'PROCESSED',
    orderId,
    state,
  };

  store[eventId] = newRecord;
  saveDedup(store);

  return {
    isDuplicate: false,
    record: newRecord,
  };
}

export function getWebhookEventRecords(): WebhookEventRecord[] {
  return Object.values(loadDedup()).sort(
    (a, b) => new Date(b.firstReceivedAt).getTime() - new Date(a.firstReceivedAt).getTime()
  );
}

export function resetWebhookRecords(): void {
  saveDedup({});
}
