import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('q')?.toLowerCase();

    if (!searchQuery || searchQuery.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search users by username
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '>=', searchQuery),
      where('username', '<=', searchQuery + '\uf8ff'),
      limit(20)
    );

    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username,
        profilePictureUrl: data.profilePictureUrl,
        level: data.level || 1,
        totalFlights: data.statsCache?.lifetime?.flights || 0,
        totalMiles: data.statsCache?.lifetime?.milesMi || 0,
        homeAirport: data.homeAirport
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
