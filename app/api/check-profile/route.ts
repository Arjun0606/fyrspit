export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get user document
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ 
        message: 'User document does not exist in Firestore',
        userId,
        authData: {
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture
        }
      });
    }

    const userData = userDoc.data();

    return NextResponse.json({
      message: 'User document found',
      userId,
      userData,
      fields: Object.keys(userData || {}),
      authData: {
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      }
    });

  } catch (error: any) {
    console.error('Check profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
