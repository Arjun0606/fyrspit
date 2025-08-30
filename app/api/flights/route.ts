// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';

function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0h 0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);

    const body = await req.json();
    const {
      flightNumber,
      airline,
      aircraft,
      from,
      to,
      scheduled,
      distanceMi,
      durationMinutes,
      visibility = 'public',
      reviewShort = '',
      date,
    } = body || {};

    // Minimal validation
    if (!flightNumber || !from?.iata || !to?.iata) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const distance = typeof distanceMi === 'number' && distanceMi > 0 ? distanceMi : 0;
    const durationMin = typeof durationMinutes === 'number' && durationMinutes > 0 ? durationMinutes : 0;

    // Build document (drop undefineds)
    const docPayload: any = {
      userId: decoded.uid,
      flightNumber,
      airline: airline || {},
      aircraft: aircraft || {},
      route: {
        from: { iata: from?.iata, city: from?.city || '', name: from?.airport || '' },
        to: { iata: to?.iata, city: to?.city || '', name: to?.airport || '' },
        distance,
        duration: durationMin,
      },
      timing: {
        scheduled: {
          departure: scheduled?.departure || '',
          arrival: scheduled?.arrival || '',
        },
        duration: formatDuration(durationMin),
      },
      stats: {
        miles: distance,
        duration: Number.isFinite(durationMin) ? Math.round(durationMin / 60) : 0,
        xpEarned: 50 + Math.floor(distance / 50),
      },
      visibility,
      reviewShort,
      date: date || new Date().toISOString().slice(0, 10),
      createdAt: new Date(),
    };

    // Remove undefined recursively
    const clean = JSON.parse(JSON.stringify(docPayload));

    const ref = await adminDb.collection('flights').add(clean);
    return NextResponse.json({ flightId: ref.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save flight' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = searchParams.get('offset') || null;
    
    let query = adminDb.collection('flights')
      .where('visibility', '==', 'public')
      .orderBy('createdAt', 'desc')
      .limit(limit);
    
    if (userId) {
      query = adminDb.collection('flights')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit);
    }
    
    if (offset) {
      const offsetDoc = await adminDb.collection('flights').doc(offset).get();
      if (offsetDoc.exists) {
        query = query.startAfter(offsetDoc);
      }
    }
    
    const snapshot = await query.get();
    const flights = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      editedAt: doc.data().editedAt?.toDate()?.toISOString(),
    }));
    
    return NextResponse.json({ flights });
  } catch (error: any) {
    console.error('API Error fetching flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}
