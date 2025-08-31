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
    
    // Restore your original profile data
    const restoredProfile = {
      username: 'arjun0606',
      profilePictureUrl: decodedToken.picture || 'https://lh3.googleusercontent.com/a/ACg8ocKrXjrTZ1kTSrOlg_j8BudCWsN-Lk572nfQlYNBROtypfqFFD5FoA=s96-c',
      name: 'Arjun Varma',
      email: 'karjunvarma2001@gmail.com',
      age: 24,
      gender: 'Male',
      homeAirport: 'Bangalore',
      travelStyle: 'Explorer',
      onboarded: true,
      // Keep existing stats and data
      followerCount: 0,
      followingCount: 0,
      xp: 0,
      level: 1,
      badges: [],
      favourites: {
        airlines: [],
        airports: []
      },
      privacy: {
        defaultVisibility: 'public'
      },
      roles: {
        admin: false,
        moderator: false,
        verified: false,
        influencer: false
      },
      joinedAt: new Date(),
      statsCache: {
        lifetime: {
          flights: 0,
          milesMi: 0,
          milesKm: 0,
          hours: 0,
          countries: [],
          airports: [],
          airlines: [],
          aircraft: [],
          continents: [],
          domesticInternational: {
            domestic: 0,
            international: 0
          },
          dayNightRatio: {
            day: 0,
            night: 0
          },
          weekdayWeekend: {
            weekday: 0,
            weekend: 0
          },
          seatClassBreakdown: {
            economy: 0,
            premium: 0,
            business: 0,
            first: 0
          },
          longest: {
            km: 0,
            mi: 0
          },
          shortest: {
            km: 0,
            mi: 0
          },
          topRoute: {
            count: 0
          },
          topAirport: {
            count: 0
          },
          topAirline: {
            count: 0
          }
        },
        perYear: {}
      }
    };

    // Update the profile
    await adminDb.collection('users').doc(userId).update(restoredProfile);

    return NextResponse.json({ 
      success: true, 
      message: 'Profile restored successfully!',
      restoredProfile 
    });

  } catch (error: any) {
    console.error('Restore profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
