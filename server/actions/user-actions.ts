'use server';

import { revalidatePath } from 'next/cache';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { UpdateProfileData } from '@/types';

export async function updateUserProfile(data: UpdateProfileData, authToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Update the user document
    await adminDb.collection('users').doc(userId).update({
      ...data,
      updatedAt: new Date(),
    });

    revalidatePath(`/profile/${userId}`);
    revalidatePath('/settings');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }
}

export async function followUser(targetUserId: string, authToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    if (userId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }

    const followId = `${userId}_${targetUserId}`;
    
    // Create follow relationship
    await adminDb.collection('follows').doc(followId).set({
      followerId: userId,
      followeeId: targetUserId,
      createdAt: new Date(),
    });

    // Update follower/following counts
    await adminDb.runTransaction(async (transaction) => {
      const followerRef = adminDb.collection('users').doc(userId);
      const followeeRef = adminDb.collection('users').doc(targetUserId);
      
      const followerDoc = await transaction.get(followerRef);
      const followeeDoc = await transaction.get(followeeRef);
      
      if (followerDoc.exists) {
        transaction.update(followerRef, {
          followingCount: (followerDoc.data()?.followingCount || 0) + 1,
        });
      }
      
      if (followeeDoc.exists) {
        transaction.update(followeeRef, {
          followerCount: (followeeDoc.data()?.followerCount || 0) + 1,
        });
      }
    });

    // Create notification for the followed user
    await adminDb.collection('notifications').add({
      userId: targetUserId,
      type: 'follow',
      payload: {
        followerId: userId,
      },
      read: false,
      createdAt: new Date(),
    });

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath(`/profile/${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error following user:', error);
    throw new Error('Failed to follow user');
  }
}

export async function unfollowUser(targetUserId: string, authToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    const followId = `${userId}_${targetUserId}`;
    
    // Delete follow relationship
    await adminDb.collection('follows').doc(followId).delete();

    // Update follower/following counts
    await adminDb.runTransaction(async (transaction) => {
      const followerRef = adminDb.collection('users').doc(userId);
      const followeeRef = adminDb.collection('users').doc(targetUserId);
      
      const followerDoc = await transaction.get(followerRef);
      const followeeDoc = await transaction.get(followeeRef);
      
      if (followerDoc.exists) {
        transaction.update(followerRef, {
          followingCount: Math.max(0, (followerDoc.data()?.followingCount || 0) - 1),
        });
      }
      
      if (followeeDoc.exists) {
        transaction.update(followeeRef, {
          followerCount: Math.max(0, (followeeDoc.data()?.followerCount || 0) - 1),
        });
      }
    });

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath(`/profile/${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw new Error('Failed to unfollow user');
  }
}

export async function likeFlight(flightId: string, authToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    const likeId = `${userId}_${flightId}`;
    
    // Check if like already exists
    const existingLike = await adminDb.collection('likes').doc(likeId).get();
    if (existingLike.exists) {
      throw new Error('Already liked this flight');
    }

    // Create like
    await adminDb.collection('likes').doc(likeId).set({
      userId,
      flightId,
      createdAt: new Date(),
    });

    // Get flight owner for notification
    const flightDoc = await adminDb.collection('flights').doc(flightId).get();
    const flightData = flightDoc.data();
    
    if (flightData && flightData.userId !== userId) {
      // Create notification for flight owner
      await adminDb.collection('notifications').add({
        userId: flightData.userId,
        type: 'like',
        payload: {
          likerId: userId,
          flightId,
        },
        read: false,
        createdAt: new Date(),
      });
    }

    revalidatePath('/feed');
    revalidatePath(`/flights/${flightId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error liking flight:', error);
    throw new Error('Failed to like flight');
  }
}

export async function unlikeFlight(flightId: string, authToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    const likeId = `${userId}_${flightId}`;
    
    // Delete like
    await adminDb.collection('likes').doc(likeId).delete();

    revalidatePath('/feed');
    revalidatePath(`/flights/${flightId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error unliking flight:', error);
    throw new Error('Failed to unlike flight');
  }
}

export async function createComment(flightId: string, body: string, authToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Create comment
    const commentRef = await adminDb.collection('comments').add({
      flightId,
      userId,
      body: body.trim(),
      createdAt: new Date(),
    });

    // Get flight owner for notification
    const flightDoc = await adminDb.collection('flights').doc(flightId).get();
    const flightData = flightDoc.data();
    
    if (flightData && flightData.userId !== userId) {
      // Create notification for flight owner
      await adminDb.collection('notifications').add({
        userId: flightData.userId,
        type: 'comment',
        payload: {
          commenterId: userId,
          flightId,
          commentId: commentRef.id,
        },
        read: false,
        createdAt: new Date(),
      });
    }

    revalidatePath(`/flights/${flightId}`);
    
    return { success: true, commentId: commentRef.id };
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment');
  }
}

export async function deleteComment(commentId: string, authToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Get comment to verify ownership
    const commentDoc = await adminDb.collection('comments').doc(commentId).get();
    if (!commentDoc.exists) {
      throw new Error('Comment not found');
    }

    const commentData = commentDoc.data();
    if (commentData?.userId !== userId) {
      // Check if user owns the flight (flight owners can delete comments on their flights)
      const flightDoc = await adminDb.collection('flights').doc(commentData?.flightId).get();
      if (!flightDoc.exists || flightDoc.data()?.userId !== userId) {
        throw new Error('Access denied');
      }
    }

    // Delete comment
    await adminDb.collection('comments').doc(commentId).delete();

    revalidatePath(`/flights/${commentData?.flightId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment');
  }
}
