
/**
 * Sync Engagement Metrics from Bluesky API
 * Phase 4: Bidirectional Engagement Sync
 * 
 * Syncs likes, reposts, and reply counts from Bluesky back to BtA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import {
  createAuthenticatedAgent,
  fetchBlueskyEngagement,
  shouldSyncEngagement,
} from '@/lib/atproto-broadcast';

/**
 * POST /api/posts/[id]/sync-engagement
 * Sync engagement metrics (likes, reposts, replies) from Bluesky
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const postId = params.id;

    // Get the post and verify it's broadcasted
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            atprotoHandle: true,
            atprotoDid: true,
            atprotoBroadcastEnabled: true,
            atprotoSyncReactions: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (!post.atprotoUri) {
      return NextResponse.json(
        { error: 'Post has not been broadcasted to Bluesky' },
        { status: 400 }
      );
    }

    // Check if user has sync enabled
    if (!post.author.atprotoSyncReactions) {
      return NextResponse.json(
        { error: 'Engagement sync is not enabled for this user' },
        { status: 400 }
      );
    }

    // Check if we should sync (rate limiting)
    if (!shouldSyncEngagement(post.atprotoEngagementSyncedAt)) {
      return NextResponse.json(
        {
          message: 'Engagement synced recently',
          engagement: {
            likeCount: post.atprotoLikeCount,
            repostCount: post.atprotoRepostCount,
            replyCount: post.atprotoReplyCount,
          },
          lastSyncedAt: post.atprotoEngagementSyncedAt,
        },
        { status: 200 }
      );
    }

    // Get app password from request
    const { appPassword } = await request.json();
    if (!appPassword) {
      return NextResponse.json(
        { error: 'Bluesky app password is required' },
        { status: 400 }
      );
    }

    // Create authenticated agent
    const agent = await createAuthenticatedAgent(
      post.author.atprotoHandle!,
      appPassword
    );

    // Fetch engagement metrics
    const result = await fetchBlueskyEngagement({
      agent,
      postUri: post.atprotoUri,
    });

    if (!result.success || !result.engagement) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch engagement' },
        { status: 500 }
      );
    }

    // Update post with engagement metrics
    await prisma.post.update({
      where: { id: postId },
      data: {
        atprotoLikeCount: result.engagement.likeCount,
        atprotoRepostCount: result.engagement.repostCount,
        atprotoReplyCount: result.engagement.replyCount,
        atprotoEngagementSyncedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Engagement synced successfully',
      engagement: result.engagement,
      syncedAt: new Date(),
    });
  } catch (error: any) {
    console.error('Engagement sync error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync engagement' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts/[id]/sync-engagement
 * Get current engagement sync status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const postId = params.id;

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        atprotoUri: true,
        atprotoLikeCount: true,
        atprotoRepostCount: true,
        atprotoReplyCount: true,
        atprotoEngagementSyncedAt: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (!post.atprotoUri) {
      return NextResponse.json(
        { isBroadcasted: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      isBroadcasted: true,
      engagement: {
        likeCount: post.atprotoLikeCount,
        repostCount: post.atprotoRepostCount,
        replyCount: post.atprotoReplyCount,
      },
      lastSyncedAt: post.atprotoEngagementSyncedAt,
      needsSync: shouldSyncEngagement(post.atprotoEngagementSyncedAt),
    });
  } catch (error: any) {
    console.error('Engagement status error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to get engagement status' },
      { status: 500 }
    );
  }
}
