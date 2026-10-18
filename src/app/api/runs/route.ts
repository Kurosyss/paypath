import { NextResponse } from 'next/server';
import { getAllRuns, getRunById, clearAllRuns } from '@/lib/storage';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const run = getRunById(id);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }
    return NextResponse.json(run);
  }

  const runs = getAllRuns();
  return NextResponse.json({ runs });
}

export async function DELETE() {
  clearAllRuns();
  return NextResponse.json({ success: true, message: 'All run records cleared' });
}
