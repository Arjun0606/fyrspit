export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth, adminStorage } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Check if there's a profile picture in Firebase Storage
    const bucket = adminStorage.bucket();
    const storageFiles = await bucket.getFiles({
      prefix: `profile-pictures/${userId}`
    });

    let uploadedProfilePicture = null;
    if (storageFiles[0] && storageFiles[0].length > 0) {
      // Get the most recent uploaded profile picture
      const file = storageFiles[0][0];
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Far future date
      });
      uploadedProfilePicture = url;
    }

    // Check user_stats collection for original XP/stats
    let originalStats = null;
    try {
      const statsDoc = await adminDb.collection('user_stats').doc(userId).get();
      if (statsDoc.exists) {
        originalStats = statsDoc.data();
      }
    } catch (error) {
      console.log('No user_stats found');
    }

    // Check if there are any backup documents or variations
    const userCollections = await adminDb.collection('users').where('email', '==', 'karjunvarma2001@gmail.com').get();
    let allUserDocs = [];
    userCollections.forEach(doc => {
      allUserDocs.push({ id: doc.id, data: doc.data() });
    });

    return NextResponse.json({
      userId,
      uploadedProfilePicture,
      originalStats,
      allUserDocs,
      storageFilesCount: storageFiles[0]?.length || 0
    });

  } catch (error: any) {
    console.error('Find original profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
