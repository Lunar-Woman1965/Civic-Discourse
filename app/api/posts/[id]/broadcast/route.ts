
/**
 * Centralized Broadcast API - All posts broadcast through platform account
 * Updated: 2026-01-02 - Simplified centralized broadcasting system
 * 
 * All BTA posts are broadcast to Bluesky through a single platform account
 * Posts include author attribution and link back to the original post
 * No individual user Bluesky connections required
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import {
  broadcastPostToBluesky,
  getPlatformBroadcasterAgent,
  canPostBeBroadcasted,
} from '@/lib/atproto-broadcast';
import { getDisplayName } from '@/lib/display-name-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = params;

    // Get the post with author information
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            username: true,
            displayNamePreference: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user owns the post (users can only broadcast their own posts)
    if (post.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: 'You can only broadcast your own posts' },
        { status: 403 }
      );
    }

    // Check if post can be broadcasted
    if (!canPostBeBroadcasted(post)) {
      return NextResponse.json(
        {
          error:
            'This post cannot be broadcasted (group post, anonymous, or unapproved)',
        },
        { status: 400 }
      );
    }

    // Check if already broadcasted
    if (post.atprotoUri) {
      return NextResponse.json(
        {
          error: 'Post already broadcasted to Bluesky',
          uri: post.atprotoUri,
          url: `https://bsky.app/profile/${post.atprotoUri?.split('/').slice(-3, -2)[0]}/post/${post.atprotoUri?.split('/').pop()}`,
        },
        { status: 400 }
      );
    }

    // Get the platform broadcaster's authenticated agent
    const { agent, handle, error: broadcasterError } = await getPlatformBroadcasterAgent();

    if (broadcasterError || !handle) {
      console.error('[BROADCAST] Platform broadcaster not available:', broadcasterError);
      return NextResponse.json(
        {
          error: broadcasterError || 'Platform broadcaster not configured. Please contact support.',
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Get author's display name
    const authorDisplayName = getDisplayName(post.author);
    const authorUsername = post.author.username || undefined;

    // Broadcast the post using the platform account with author attribution
    const btaPostUrl = `https://bridgingtheaisle.com/dashboard?post=${postId}`;
    const result = await broadcastPostToBluesky({
      agent,
      content: post.content,
      btaPostUrl,
      authorName: authorDisplayName,
      authorUsername,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to broadcast' },
        { status: 500 }
      );
    }

    // Update post with Bluesky metadata
    await prisma.post.update({
      where: { id: postId },
      data: {
        atprotoUri: result.uri,
        atprotoCid: result.cid,
        atprotoBroadcastedAt: new Date(),
        atprotoHasMedia: !!post.imageUrl,
      },
    });

    // Extract post ID from URI for constructing the Bluesky URL
    const blueskyPostId = result.uri?.split('/').pop();
    const blueskyUrl = `https://bsky.app/profile/${handle}/post/${blueskyPostId}`;

    console.log(`[BROADCAST] ✓ Post ${postId} by ${authorDisplayName} broadcast successfully`);

    return NextResponse.json({
      success: true,
      message: 'Post broadcasted to Bluesky successfully via platform account',
      uri: result.uri,
      cid: result.cid,
      url: blueskyUrl,
      platformHandle: handle,
      wasTruncated: result.wasTruncated,
    });

  } catch (error: any) {
    console.error('[BROADCAST] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'Failed to broadcast post'
      },
      { status: 500 }
    );
  }
}
