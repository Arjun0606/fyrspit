export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', message: 'No token provided' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return NextResponse.json({ error: 'Unauthorized', message: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    
    // Get user document
    const userDocRef = doc(adminDb, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : null;

    return NextResponse.json({
      userId,
      userExists: userDoc.exists(),
      userData,
      decodedToken: {
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      }
    });

  } catch (error: any) {
    console.error('Debug user error:', error);
    return NextResponse.json({ error: 'Failed to debug user', message: error.message }, { status: 500 });
  }
}
