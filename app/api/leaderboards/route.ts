import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'flights';
    const limitCount = parseInt(searchParams.get('limit') || '100');

    // Fetch all users with stats - regardless of profile visibility
    // Leaderboards should show achievements for competitive aspect
    const usersQuery = query(
      collection(db, 'users'),
      limit(limitCount * 2) // Get more to account for filtering
    );

    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs
      .map(doc => {
        const data = doc.data();
        const stats = data.statsCache?.lifetime || {};
        
        return {
          userId: doc.id,
          username: data.username || 'Anonymous',
          profilePictureUrl: data.profilePictureUrl,
          level: data.level || 1,
          xp: data.xp || 0,
          badges: data.badges || [],
          stats: {
            flights: stats.flights || 0,
            miles: stats.milesMi || 0,
            countries: stats.countries?.length || 0,
            hours: Math.round((stats.minutes || 0) / 60),
            airports: stats.airports?.length || 0
          },
          // Include profile visibility for frontend to handle link behavior
          profileVisibility: data.privacy?.profileVisibility || 'public'
        };
      })
      .filter(user => user.username && user.username !== 'Anonymous'); // Filter out incomplete profiles

    // Sort based on category
    let sortedUsers;
    switch (category) {
      case 'flights':
        sortedUsers = users.sort((a, b) => b.stats.flights - a.stats.flights);
        break;
      case 'miles':
        sortedUsers = users.sort((a, b) => b.stats.miles - a.stats.miles);
        break;
      case 'countries':
        sortedUsers = users.sort((a, b) => b.stats.countries - a.stats.countries);
        break;
      case 'hours':
        sortedUsers = users.sort((a, b) => b.stats.hours - a.stats.hours);
        break;
      case 'xp':
        sortedUsers = users.sort((a, b) => b.xp - a.xp);
        break;
      default:
        sortedUsers = users.sort((a, b) => b.stats.flights - a.stats.flights);
    }

    // Add rankings and limit results
    const leaderboard = sortedUsers
      .slice(0, limitCount)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        value: category === 'xp' ? user.xp : user.stats[category as keyof typeof user.stats]
      }));

    return NextResponse.json({ leaderboard, category });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
