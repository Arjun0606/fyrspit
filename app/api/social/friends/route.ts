import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, addDoc, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user's friends list
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const friendIds = userData.friends || [];

    // Get friends data
    const friends = [];
    for (const friendId of friendIds) {
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        const friendData = friendDoc.data();
        friends.push({
          id: friendId,
          username: friendData.username,
          profilePictureUrl: friendData.profilePictureUrl,
          level: friendData.level || 1,
          totalFlights: friendData.statsCache?.lifetime?.flights || 0,
          totalMiles: friendData.statsCache?.lifetime?.milesMi || 0
        });
      }
    }

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { action, targetUserId, username } = await req.json();

    if (action === 'send_request') {
      // Find user by username
      let targetId = targetUserId;
      if (username && !targetUserId) {
        const usersQuery = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
        const usersSnapshot = await getDocs(usersQuery);
        if (usersSnapshot.empty) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        targetId = usersSnapshot.docs[0].id;
      }

      // Send friend request
      await addDoc(collection(db, 'friend_requests'), {
        from: userId,
        to: targetId,
        status: 'pending',
        createdAt: new Date()
      });

      return NextResponse.json({ success: true, message: 'Friend request sent' });
    }

    if (action === 'accept_request') {
      // Accept friend request and add to friends list
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayUnion(targetUserId)
      });
      await updateDoc(doc(db, 'users', targetUserId), {
        friends: arrayUnion(userId)
      });

      // Update request status
      const requestQuery = query(
        collection(db, 'friend_requests'),
        where('from', '==', targetUserId),
        where('to', '==', userId),
        where('status', '==', 'pending')
      );
      const requests = await getDocs(requestQuery);
      if (!requests.empty) {
        await updateDoc(requests.docs[0].ref, { status: 'accepted' });
      }

      return NextResponse.json({ success: true, message: 'Friend request accepted' });
    }

    if (action === 'remove_friend') {
      // Remove from friends list
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayRemove(targetUserId)
      });
      await updateDoc(doc(db, 'users', targetUserId), {
        friends: arrayRemove(userId)
      });

      return NextResponse.json({ success: true, message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing friends:', error);
    return NextResponse.json({ error: 'Failed to manage friends' }, { status: 500 });
  }
}
