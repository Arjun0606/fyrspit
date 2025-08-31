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
    
    // Check current user document
    const currentUserDoc = await adminDb.collection('users').doc(userId).get();
    const currentData = currentUserDoc.exists ? currentUserDoc.data() : null;

    // Check for any documents with your email
    const emailQuery = await adminDb.collection('users').where('email', '==', 'karjunvarma2001@gmail.com').get();
    const emailMatches = [];
    emailQuery.forEach(doc => {
      emailMatches.push({
        id: doc.id,
        data: doc.data(),
        isCurrentUser: doc.id === userId
      });
    });

    // Check for any documents with username arjun0606
    const usernameQuery = await adminDb.collection('users').where('username', '==', 'arjun0606').get();
    const usernameMatches = [];
    usernameQuery.forEach(doc => {
      usernameMatches.push({
        id: doc.id,
        data: doc.data(),
        isCurrentUser: doc.id === userId
      });
    });

    // Check user_stats collection
    const userStatsDoc = await adminDb.collection('user_stats').doc(userId).get();
    const userStatsData = userStatsDoc.exists ? userStatsDoc.data() : null;

    // Check for any backup or archived data
    const collections = ['users_backup', 'users_archive', 'profiles', 'user_profiles'];
    const backupData = {};
    
    for (const collectionName of collections) {
      try {
        const backupDoc = await adminDb.collection(collectionName).doc(userId).get();
        if (backupDoc.exists) {
          backupData[collectionName] = backupDoc.data();
        }
      } catch (e) {
        // Collection might not exist
      }
    }

    // Check flights to see what userDisplayName/userUsername was stored
    const flightsQuery = await adminDb.collection('flights').where('userId', '==', userId).limit(5).get();
    const flightUserData = [];
    flightsQuery.forEach(doc => {
      const flight = doc.data();
      flightUserData.push({
        flightId: doc.id,
        userDisplayName: flight.userDisplayName,
        userUsername: flight.userUsername,
        userProfilePicture: flight.userProfilePicture,
        createdAt: flight.createdAt,
        date: flight.date
      });
    });

    return NextResponse.json({
      investigation: {
        userId,
        currentUserData: currentData,
        emailMatches: emailMatches.length,
        emailMatchDetails: emailMatches,
        usernameMatches: usernameMatches.length,
        usernameMatchDetails: usernameMatches,
        userStatsData,
        backupData,
        flightUserData,
        authTokenData: {
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
          uid: decodedToken.uid
        }
      }
    });

  } catch (error: any) {
    console.error('Investigation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
