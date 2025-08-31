export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);

    const snapshot = await adminDb
      .collection('flights')
      .where('userId', '==', decoded.uid)
      .get();

    const groups: Record<string, { id: string; createdAt: number }[]> = {};
    snapshot.forEach((doc) => {
      const d = doc.data() as any;
      const key = `${d.date}:${String(d.flightNumber).toUpperCase()}:${d?.route?.from?.iata}-${d?.route?.to?.iata}`;
      const createdAt = (d.createdAt?.toDate?.() || new Date(d.createdAt)).getTime?.() || Date.now();
      (groups[key] ||= []).push({ id: doc.id, createdAt });
    });

    let removed = 0;
    for (const key of Object.keys(groups)) {
      const arr = groups[key].sort((a, b) => b.createdAt - a.createdAt);
      const toRemove = arr.slice(1); // keep latest
      for (const r of toRemove) {
        await adminDb.collection('flights').doc(r.id).delete();
        removed++;
      }
    }

    return NextResponse.json({ removed });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to dedupe' }, { status: 500 });
  }
}
