import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatency = 0;

  try {
    const supabase = createClient();
    const dbStart = Date.now();
    const { error } = await supabase.from('categories').select('id').limit(1);
    dbLatency = Date.now() - dbStart;

    if (error) {
      dbStatus = 'degraded';
    }
  } catch (err) {
    dbStatus = 'unreachable';
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json(
    {
      status: dbStatus === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatency,
        },
      },
      responseTimeMs: responseTime,
    },
    {
      status: dbStatus === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
