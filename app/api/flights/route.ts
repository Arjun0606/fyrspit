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

function coerceTimeString(input: any): string {
  if (!input) return '';
  if (typeof input === 'string') return input;
  // Some providers send { local, utc }
  if (typeof input === 'object') {
    return String(input.local || input.utc || '');
  }
  try {
    return String(input);
  } catch {
    return '';
  }
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

    const normalizedDate = (date || new Date().toISOString().slice(0, 10));

    // Prevent duplicates: same user + date + flightNumber + route
    const dupKey = `${decoded.uid}:${normalizedDate}:${String(flightNumber).toUpperCase()}:${from?.iata}-${to?.iata}`;
    const dupRef = adminDb.collection('flight_keys').doc(dupKey);
    const dupSnap = await dupRef.get();
    if (dupSnap.exists) {
      return NextResponse.json({ error: 'Duplicate flight for this date already exists' }, { status: 409 });
    }

    const distance = typeof distanceMi === 'number' && distanceMi > 0 ? distanceMi : 0;
    const durationMin = typeof durationMinutes === 'number' && durationMinutes > 0 ? durationMinutes : 0;

    // Pull user profile for username/photo if present
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const userData = userDoc.exists ? (userDoc.data() as any) : {};
    const username = userData?.username || (decoded as any).user_name || decoded.name || decoded.email?.split('@')[0] || 'user';
    const profilePictureUrl = userData?.profilePictureUrl || (decoded as any).picture || '';

    // Build document (drop undefineds)
    const docPayload: any = {
      userId: decoded.uid,
      userUsername: username,
      userDisplayName: decoded.name || decoded.email?.split('@')[0] || username,
      userProfilePicture: profilePictureUrl || undefined,
      flightNumber,
      airline: airline || {},
      aircraft: aircraft || {},
      route: {
        from: { iata: from?.iata, city: from?.city || '', country: from?.country || '', name: from?.name || from?.airport || '' },
        to: { iata: to?.iata, city: to?.city || '', country: to?.country || '', name: to?.name || to?.airport || '' },
        distance,
        duration: durationMin,
      },
      timing: {
        scheduled: {
          departure: coerceTimeString(scheduled?.departure),
          arrival: coerceTimeString(scheduled?.arrival),
        },
        duration: formatDuration(durationMin),
      },
      stats: {
        miles: distance,
        duration: Number.isFinite(durationMin) ? Math.round(durationMin / 60) : 0,
        xpEarned: 50 + Math.floor(distance / 50),
      },
      visibility,
      reviewShort: '',
      date: normalizedDate,
      createdAt: new Date(),
    };

    const clean = JSON.parse(JSON.stringify(docPayload));

    const ref = await adminDb.collection('flights').add(clean);
    await dupRef.set({ createdAt: new Date(), flightId: ref.id });

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
    
    // Get current user from auth header (optional)
    const authHeader = request.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    let currentUserId = null;
    
    if (idToken) {
      try {
        const auth = getAuth();
        const decoded = await auth.verifyIdToken(idToken);
        currentUserId = decoded.uid;
      } catch (error) {
        // Invalid token, but allow public viewing
        console.log('Invalid auth token, allowing public access');
      }
    }
    
    let query = adminDb.collection('flights')
      .where('visibility', '==', 'public')
      .orderBy('createdAt', 'desc')
      .limit(limit);
    
    if (userId) {
      // Check if current user can view this user's flights
      const canView = await checkFlightViewPermission(userId, currentUserId);
      
      if (!canView) {
        return NextResponse.json({ flights: [] }); // Return empty if no permission
      }
      
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

// Helper function to check if current user can view target user's flights
async function checkFlightViewPermission(targetUserId: string, currentUserId: string | null): Promise<boolean> {
  // If viewing own profile, always allow
  if (currentUserId === targetUserId) {
    return true;
  }
  
  // Get target user's privacy settings
  const targetUserDoc = await adminDb.collection('users').doc(targetUserId).get();
  if (!targetUserDoc.exists) {
    return false;
  }
  
  const targetUser = targetUserDoc.data();
  const flightVisibility = targetUser?.privacy?.flightVisibility || 'public';
  
  if (flightVisibility === 'public') {
    return true;
  }
  
  if (flightVisibility === 'private') {
    return false; // Only target user can see
  }
  
  if (flightVisibility === 'friends') {
    if (!currentUserId) return false; // Must be logged in
    
    // Check if they are friends (this would need to be implemented)
    // For now, return false until friend system is fully implemented
    // TODO: Check friendship status
    return false;
  }
  
  return false;
}
