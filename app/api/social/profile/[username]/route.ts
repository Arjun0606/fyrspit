import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params;

    // Find user by username
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    );

    const usersSnapshot = await getDocs(usersQuery);
    if (usersSnapshot.empty) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Get user's flights
    const flightsQuery = query(
      collection(db, 'flights'),
      where('userId', '==', userDoc.id),
      where('visibility', '==', 'public') // Only public flights
    );

    const flightsSnapshot = await getDocs(flightsQuery);
    const flights = flightsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Return public profile data
    const profile = {
      id: userDoc.id,
      username: userData.username,
      profilePictureUrl: userData.profilePictureUrl,
      homeAirport: userData.homeAirport,
      level: userData.level || 1,
      xp: userData.xp || 0,
      joinedAt: userData.joinedAt,
      stats: userData.statsCache?.lifetime || {
        flights: flights.length,
        milesKm: 0,
        milesMi: 0,
        hours: 0,
        airports: [],
        airlines: [],
        aircraft: [],
        countries: [],
        continents: []
      },
      flights: flights.slice(0, 10), // Latest 10 public flights
      totalFlights: flights.length
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
