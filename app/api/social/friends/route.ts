import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user's friends list
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const friendIds = userData?.friends || [];

    // Get friends data
    const friends = [];
    for (const friendId of friendIds) {
      const friendDoc = await adminDb.collection('users').doc(friendId).get();
      if (friendDoc.exists) {
        const friendData = friendDoc.data();
        friends.push({
          id: friendId,
          username: friendData?.username,
          profilePictureUrl: friendData?.profilePictureUrl,
          level: friendData?.level || 1,
          totalFlights: friendData?.statsCache?.lifetime?.flights || 0,
          totalMiles: friendData?.statsCache?.lifetime?.milesMi || 0
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

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { action, targetUserId, username } = await req.json();

    if (action === 'send_request') {
      // Find user by username
      let targetId = targetUserId;
      if (username && !targetUserId) {
        const usersSnapshot = await adminDb.collection('users').where('username', '==', username.toLowerCase()).get();
        if (usersSnapshot.empty) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        targetId = usersSnapshot.docs[0].id;
      }

      // Check if request already exists
      const existingRequest = await adminDb.collection('friend_requests')
        .where('from', '==', userId)
        .where('to', '==', targetId)
        .where('status', '==', 'pending')
        .get();
      
      if (!existingRequest.empty) {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
      }

      // Check if already friends
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const friends = userDoc.data()?.friends || [];
      if (friends.includes(targetId)) {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }

      // Send friend request
      await adminDb.collection('friend_requests').add({
        from: userId,
        to: targetId,
        status: 'pending',
        createdAt: new Date()
      });

      return NextResponse.json({ success: true, message: 'Friend request sent' });
    }

    if (action === 'accept_request') {
      // Accept friend request and add to friends list
      const userRef = adminDb.collection('users').doc(userId);
      const targetRef = adminDb.collection('users').doc(targetUserId);
      
      const userDoc = await userRef.get();
      const targetDoc = await targetRef.get();
      
      const userFriends = userDoc.data()?.friends || [];
      const targetFriends = targetDoc.data()?.friends || [];
      
      if (!userFriends.includes(targetUserId)) {
        userFriends.push(targetUserId);
      }
      if (!targetFriends.includes(userId)) {
        targetFriends.push(userId);
      }
      
      await userRef.update({ friends: userFriends });
      await targetRef.update({ friends: targetFriends });

      // Update request status
      const requestSnapshot = await adminDb.collection('friend_requests')
        .where('from', '==', targetUserId)
        .where('to', '==', userId)
        .where('status', '==', 'pending')
        .get();
        
      if (!requestSnapshot.empty) {
        await requestSnapshot.docs[0].ref.update({ status: 'accepted' });
      }

      return NextResponse.json({ success: true, message: 'Friend request accepted' });
    }

    if (action === 'reject_request') {
      // Reject friend request
      const requestSnapshot = await adminDb.collection('friend_requests')
        .where('from', '==', targetUserId)
        .where('to', '==', userId)
        .where('status', '==', 'pending')
        .get();
        
      if (!requestSnapshot.empty) {
        await requestSnapshot.docs[0].ref.update({ status: 'rejected' });
      }

      return NextResponse.json({ success: true, message: 'Friend request rejected' });
    }

    if (action === 'remove_friend') {
      // Remove from friends list
      const userRef = adminDb.collection('users').doc(userId);
      const targetRef = adminDb.collection('users').doc(targetUserId);
      
      const userDoc = await userRef.get();
      const targetDoc = await targetRef.get();
      
      const userFriends = (userDoc.data()?.friends || []).filter((id: string) => id !== targetUserId);
      const targetFriends = (targetDoc.data()?.friends || []).filter((id: string) => id !== userId);
      
      await userRef.update({ friends: userFriends });
      await targetRef.update({ friends: targetFriends });

      return NextResponse.json({ success: true, message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing friends:', error);
    return NextResponse.json({ error: 'Failed to manage friends' }, { status: 500 });
  }
}
