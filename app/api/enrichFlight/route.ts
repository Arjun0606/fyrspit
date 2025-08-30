export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { enrichFlight } from '@/lib/enrichFlight';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flightNo, date, userId, aircraftManufacturer, aircraftModel, seatClass } = body || {};
    if (!flightNo || !date || !userId) {
      return NextResponse.json({ error: true, message: 'Missing flightNo, date, or userId' }, { status: 400 });
    }
    const result = await enrichFlight({ flightNo, date, userId, aircraftManufacturer, aircraftModel, seatClass });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err?.message || 'Failed to enrich flight' }, { status: 500 });
  }
}


