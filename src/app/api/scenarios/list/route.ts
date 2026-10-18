import { NextResponse } from 'next/server';
import { SCENARIO_DEFINITIONS } from '@/lib/scenarios-engine';

export async function GET() {
  return NextResponse.json({
    scenarios: SCENARIO_DEFINITIONS,
  });
}
