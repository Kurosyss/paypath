import { NextResponse } from 'next/server';
import { runScenario } from '@/lib/scenarios-engine';
import { diagnoseRun } from '@/lib/ai-diagnostic-engine';
import { saveRunRecord } from '@/lib/storage';
import { ScenarioId, ExecutionMode } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const scenarioId = body.scenarioId as ScenarioId;
    const mode = body.mode as ExecutionMode | undefined;
    const applyFix = Boolean(body.applyFix);
    const customCreds = body.customCreds;

    if (!scenarioId) {
      return NextResponse.json({ error: 'scenarioId is required' }, { status: 400 });
    }

    // 1. Run Scenario
    const runRecord = await runScenario(scenarioId, {
      mode,
      applyFix,
      customCreds,
    });

    // 2. Perform AI Diagnosis on sanitized execution traces
    const diagnosis = await diagnoseRun(runRecord);
    runRecord.diagnosis = diagnosis;

    // 3. Persist run record
    saveRunRecord(runRecord);

    return NextResponse.json(runRecord);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Scenario run error:', err);
    return NextResponse.json(
      { error: 'Failed to execute scenario', details: errMsg },
      { status: 500 }
    );
  }
}
