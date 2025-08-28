import { NextRequest, NextResponse } from 'next/server';
import { unlikeFlight } from '@/server/actions/user-actions';

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
    
    const result = await unlikeFlight(params.id, token);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error unliking flight:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unlike flight' },
      { status: 500 }
    );
  }
}
