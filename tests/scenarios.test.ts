import { describe, it, expect } from 'vitest';
import { runScenario, SCENARIO_DEFINITIONS } from '../src/lib/scenarios-engine';

describe('Scenarios Engine Execution', () => {
  it('should expose all 7 required scenarios (A through G)', () => {
    expect(SCENARIO_DEFINITIONS.length).toBe(7);
    const codes = SCENARIO_DEFINITIONS.map((s) => s.code);
    expect(codes).toContain('SCENARIO-A');
    expect(codes).toContain('SCENARIO-B');
    expect(codes).toContain('SCENARIO-C');
    expect(codes).toContain('SCENARIO-D');
    expect(codes).toContain('SCENARIO-E');
    expect(codes).toContain('SCENARIO-F');
    expect(codes).toContain('SCENARIO-G');
  });

  it('Scenario A: should pass in standard simulation mode', async () => {
    const result = await runScenario('scenario-a-success', { mode: 'OFFLINE_SIMULATION' });
    expect(result.status).toBe('PASSED');
    expect(result.finalState).toBe('COMPLETED');
    expect(result.invariants.every((i) => i.passed)).toBe(true);
  });

  it('Scenario B: should demonstrate failure when bug exists, and pass when fix applied', async () => {
    // 1. Without fix (simulates naive code swallowing decline error)
    const buggyRun = await runScenario('scenario-b-declined', {
      mode: 'FAULT_INJECTION',
      applyFix: false,
    });
    expect(buggyRun.status).toBe('FAILED');
    expect(buggyRun.invariants.some((i) => !i.passed && i.id === 'INV-003')).toBe(true);

    // 2. With fix applied
    const fixedRun = await runScenario('scenario-b-declined', {
      mode: 'FAULT_INJECTION',
      applyFix: true,
    });
    expect(fixedRun.status).toBe('PASSED');
    expect(fixedRun.finalState).toBe('DECLINED');
  });

  it('Scenario C: should expose blind retry bug and verify state reconciliation fix', async () => {
    // 1. Without fix (blind retry on timeout)
    const buggyRun = await runScenario('scenario-c-uncertain-capture', {
      mode: 'FAULT_INJECTION',
      applyFix: false,
    });
    expect(buggyRun.status).toBe('FAILED');
    expect(buggyRun.invariants.some((i) => !i.passed && i.id === 'INV-002')).toBe(true);

    // 2. With fix applied (reconciles with GET /v2/checkout/orders/{id})
    const fixedRun = await runScenario('scenario-c-uncertain-capture', {
      mode: 'FAULT_INJECTION',
      applyFix: true,
    });
    expect(fixedRun.status).toBe('PASSED');
    expect(fixedRun.finalState).toBe('COMPLETED');
  });

  it('Scenario D: should detect duplicate fulfillment bug and verify deduplication fix', async () => {
    // 1. Buggy run
    const buggy = await runScenario('scenario-d-duplicate-webhook', {
      mode: 'FAULT_INJECTION',
      applyFix: false,
    });
    expect(buggy.status).toBe('FAILED');

    // 2. Fixed run
    const fixed = await runScenario('scenario-d-duplicate-webhook', {
      mode: 'FAULT_INJECTION',
      applyFix: true,
    });
    expect(fixed.status).toBe('PASSED');
  });
});
