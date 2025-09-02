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

    // Get incoming friend requests
    const incomingSnapshot = await adminDb.collection('friend_requests')
      .where('to', '==', userId)
      .where('status', '==', 'pending')
      .get();

    const incomingRequests = [];
    for (const doc of incomingSnapshot.docs) {
      const data = doc.data();
      // Get sender info
      const senderDoc = await adminDb.collection('users').doc(data.from).get();
      if (senderDoc.exists) {
        const senderData = senderDoc.data();
        incomingRequests.push({
          id: doc.id,
          from: data.from,
          username: senderData?.username,
          profilePictureUrl: senderData?.profilePictureUrl,
          level: senderData?.level || 1,
          totalFlights: senderData?.statsCache?.lifetime?.flights || 0,
          createdAt: data.createdAt?.toDate()?.toISOString()
        });
      }
    }

    // Get outgoing friend requests
    const outgoingSnapshot = await adminDb.collection('friend_requests')
      .where('from', '==', userId)
      .where('status', '==', 'pending')
      .get();

    const outgoingRequests = [];
    for (const doc of outgoingSnapshot.docs) {
      const data = doc.data();
      // Get recipient info
      const recipientDoc = await adminDb.collection('users').doc(data.to).get();
      if (recipientDoc.exists) {
        const recipientData = recipientDoc.data();
        outgoingRequests.push({
          id: doc.id,
          to: data.to,
          username: recipientData?.username,
          profilePictureUrl: recipientData?.profilePictureUrl,
          level: recipientData?.level || 1,
          totalFlights: recipientData?.statsCache?.lifetime?.flights || 0,
          createdAt: data.createdAt?.toDate()?.toISOString()
        });
      }
    }

    return NextResponse.json({ 
      incoming: incomingRequests,
      outgoing: outgoingRequests
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 });
  }
}
