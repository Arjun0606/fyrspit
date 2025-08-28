import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { updateFlight, deleteFlight } from '@/server/actions/flight-actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flightDoc = await adminDb.collection('flights').doc(params.id).get();
    
    if (!flightDoc.exists) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }
    
    const flight = {
      id: flightDoc.id,
      ...flightDoc.data(),
      createdAt: flightDoc.data()?.createdAt?.toDate()?.toISOString(),
      editedAt: flightDoc.data()?.editedAt?.toDate()?.toISOString(),
    };
    
    // TODO: Check visibility permissions based on user auth
    
    return NextResponse.json({ flight });
  } catch (error: any) {
    console.error('API Error fetching flight:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flight' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const body = await request.json();
    
    const result = await updateFlight(params.id, body, token);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error updating flight:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update flight' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    const result = await deleteFlight(params.id, token);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error deleting flight:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete flight' },
      { status: 500 }
    );
  }
}
