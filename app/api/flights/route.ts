import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createFlight } from '@/server/actions/flight-actions';
import { CreateFlightSchema } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateFlightSchema.parse(body);
    
    // Create the flight
    const result = await createFlight(validatedData, token);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('API Error creating flight:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create flight' },
      { status: 500 }
    );
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
