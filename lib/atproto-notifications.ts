
/**
 * AT Protocol Notification Utilities
 * Phase 3: Two-way Sync & Broadcasting
 * 
 * Handles notifications for cross-platform interactions
 */

import { prisma } from './db';

/**
 * Create notification for Bluesky reply import
 */
export async function notifyBlueskyReply(params: {
  postAuthorId: string;
  postId: string;
  blueskyAuthorHandle: string;
  replyText: string;
}): Promise<void> {
  try {
    const { postAuthorId, postId, blueskyAuthorHandle, replyText } = params;

    // Create notification for post author
    await prisma.notification.create({
      data: {
        type: 'bluesky_reply',
        userId: postAuthorId,
        title: 'Reply from Bluesky',
        message: `@${blueskyAuthorHandle} replied to your post on Bluesky: "${replyText.substring(0, 100)}${replyText.length > 100 ? '...' : ''}"`,
        link: `/dashboard?post=${postId}`,
        read: false,
      },
    });

    console.log(`Created Bluesky reply notification for user ${postAuthorId}`);
  } catch (error) {
    console.error('Error creating Bluesky reply notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Create notification for successful broadcast
 */
export async function notifyBroadcastSuccess(params: {
  userId: string;
  postId: string;
  blueskyUrl: string;
}): Promise<void> {
  try {
    const { userId, postId, blueskyUrl } = params;

    await prisma.notification.create({
      data: {
        type: 'bluesky_broadcast',
        userId,
        title: 'Post Broadcasted to Bluesky',
        message: `Your post has been successfully shared to Bluesky. View it on Bluesky or check for replies.`,
        link: blueskyUrl,
        read: false,
      },
    });

    console.log(`Created broadcast success notification for user ${userId}`);
  } catch (error) {
    console.error('Error creating broadcast notification:', error);
  }
}

/**
 * Create notification for broadcast failure
 */
export async function notifyBroadcastFailure(params: {
  userId: string;
  postId: string;
  errorMessage: string;
}): Promise<void> {
  try {
    const { userId, postId, errorMessage } = params;

    await prisma.notification.create({
      data: {
        type: 'bluesky_error',
        userId,
        title: 'Broadcast to Bluesky Failed',
        message: `Failed to broadcast your post to Bluesky: ${errorMessage}. Please check your Bluesky connection.`,
        link: `/dashboard?post=${postId}`,
        read: false,
      },
    });

    console.log(`Created broadcast failure notification for user ${userId}`);
  } catch (error) {
    console.error('Error creating failure notification:', error);
  }
}

/**
 * Create notification for sync completion
 */
export async function notifySyncComplete(params: {
  userId: string;
  postId: string;
  newRepliesCount: number;
}): Promise<void> {
  try {
    const { userId, postId, newRepliesCount } = params;

    if (newRepliesCount === 0) {
      // Don't notify if no new replies
      return;
    }

    await prisma.notification.create({
      data: {
        type: 'bluesky_sync',
        userId,
        title: 'New Bluesky Replies',
        message: `${newRepliesCount} new ${newRepliesCount === 1 ? 'reply' : 'replies'} from Bluesky have been added to your post.`,
        link: `/dashboard?post=${postId}`,
        read: false,
      },
    });

    console.log(`Created sync notification for user ${userId}`);
  } catch (error) {
    console.error('Error creating sync notification:', error);
  }
}
