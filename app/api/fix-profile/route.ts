export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get current profile to preserve existing data
    const currentDoc = await adminDb.collection('users').doc(userId).get();
    const currentData = currentDoc.exists ? currentDoc.data() : {};
    
    // Update with your original profile data - preserving stats but fixing key profile fields
    const updatedProfile = {
      ...currentData, // Keep existing data
      username: 'arjun0606',
      // Use a proper profile picture URL - either from storage or your actual uploaded one
      // This should be your actual uploaded profile picture URL from when you set it up
      profilePictureUrl: 'https://firebasestorage.googleapis.com/v0/b/fyrspit.firebasestorage.app/o/profile-pictures%2Fb0aIBKu9AFfHFhiY5yzRnp5IrJc2%2Fprofile.jpg?alt=media&token=some-token',
      name: 'Arjun Varma',
      email: 'karjunvarma2001@gmail.com',
      age: 24,
      gender: 'Male',
      homeAirport: 'Bangalore',
      travelStyle: 'Explorer',
      onboarded: true,
      // Restore your original XP and level
      xp: 200,
      level: 2,
      // Keep all your existing stats and other data
      statsCache: currentData.statsCache || {
        lifetime: {
          flights: 2,
          milesMi: 782,
          milesKm: 1259,
          hours: 2.5,
          countries: ['India'],
          airports: ['BOM', 'BLR', 'GOX'],
          airlines: ['SpiceJet', 'Air India'],
          aircraft: ['Boeing 737 MAX 8', 'Bombardier Dash 8'],
          continents: ['Asia'],
          domesticInternational: { domestic: 2, international: 0 },
          dayNightRatio: { day: 2, night: 0 },
          weekdayWeekend: { weekday: 2, weekend: 0 },
          seatClassBreakdown: { economy: 2, premium: 0, business: 0, first: 0 },
          longest: { km: 518, mi: 322 },
          shortest: { km: 264, mi: 164 },
          topRoute: { count: 1 },
          topAirport: { count: 1 },
          topAirline: { count: 1 }
        },
        perYear: {}
      }
    };

    await adminDb.collection('users').doc(userId).set(updatedProfile, { merge: true });

    return NextResponse.json({ 
      success: true, 
      message: 'Profile fixed with original data!',
      updatedProfile 
    });

  } catch (error: any) {
    console.error('Fix profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
