
/**
 * Sync Bluesky Replies API
 * Phase 3: Two-way Sync & Broadcasting
 * 
 * Fetches replies from Bluesky and imports them as comments in BtA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import {
  fetchBlueskyReplies,
  replyExists,
  createAuthenticatedAgent,
} from '@/lib/atproto-broadcast';

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

    // Get the post with its Bluesky URI
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            atprotoHandle: true,
            atprotoDid: true,
          },
        },
        comments: {
          select: {
            id: true,
            atprotoUri: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if post was broadcasted to Bluesky
    if (!post.atprotoUri) {
      return NextResponse.json(
        { error: 'Post not broadcasted to Bluesky yet' },
        { status: 400 }
      );
    }

    // Get app password from request body
    const body = await request.json();
    const { appPassword } = body;

    if (!appPassword || typeof appPassword !== 'string') {
      return NextResponse.json(
        { error: 'Bluesky app password required' },
        { status: 400 }
      );
    }

    // Create authenticated agent using post author's handle
    if (!post.author.atprotoHandle) {
      return NextResponse.json(
        { error: 'Post author has not linked Bluesky account' },
        { status: 400 }
      );
    }

    const agent = await createAuthenticatedAgent(
      post.author.atprotoHandle,
      appPassword
    );

    // Fetch replies from Bluesky
    const result = await fetchBlueskyReplies({
      agent,
      postUri: post.atprotoUri,
    });

    if (!result.success || !result.replies) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch replies' },
        { status: 500 }
      );
    }

    const replies = result.replies;
    let importedCount = 0;
    let skippedCount = 0;

    // Import each reply as a comment
    for (const reply of replies) {
      // Check if reply already exists
      if (replyExists(post.comments, reply.uri)) {
        skippedCount++;
        continue;
      }

      // Check if the reply author has a linked BtA account
      const replyAuthor = await prisma.user.findFirst({
        where: {
          atprotoHandle: reply.authorHandle,
        },
        select: {
          id: true,
        },
      });

      // If author not found, create comment with post author as placeholder
      // and store the Bluesky author handle
      const authorId = replyAuthor?.id || post.authorId;

      // Create comment from Bluesky reply
      await prisma.comment.create({
        data: {
          content: reply.text,
          postId: postId,
          authorId: authorId,
          atprotoUri: reply.uri,
          atprotoCid: reply.cid,
          atprotoAuthorHandle: reply.authorHandle,
          atprotoImportedAt: new Date(),
          isFromBluesky: true,
          createdAt: new Date(reply.createdAt),
          // Note: If author is not linked, comment appears from post author
          // but displays Bluesky handle in UI
        },
      });

      importedCount++;
    }

    // Update post sync timestamp
    await prisma.post.update({
      where: { id: postId },
      data: {
        atprotoSyncedAt: new Date(),
      },
    });

    console.log(
      `Synced ${importedCount} new replies for post ${postId} (${skippedCount} already existed)`
    );

    return NextResponse.json({
      success: true,
      message: `Imported ${importedCount} new replies from Bluesky`,
      imported: importedCount,
      skipped: skippedCount,
      total: replies.length,
    });
  } catch (error: any) {
    console.error('Error syncing Bluesky replies:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync replies' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check sync status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        atprotoUri: true,
        atprotoBroadcastedAt: true,
        atprotoSyncedAt: true,
        _count: {
          select: {
            comments: {
              where: {
                isFromBluesky: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      broadcasted: !!post.atprotoUri,
      broadcastedAt: post.atprotoBroadcastedAt,
      lastSyncedAt: post.atprotoSyncedAt,
      blueskyRepliesCount: post._count.comments,
      needsSync: post.atprotoUri && (
        !post.atprotoSyncedAt ||
        new Date(post.atprotoSyncedAt).getTime() < Date.now() - 5 * 60 * 1000 // 5 minutes
      ),
    });
  } catch (error: any) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
}
