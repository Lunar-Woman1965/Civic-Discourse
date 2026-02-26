
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/profile/bluesky/toggle-autopost
 * 
 * Toggles the automatic cross-posting feature for a user's Bluesky account.
 * Requires an active Bluesky connection.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { autoPost } = body;

    if (typeof autoPost !== 'boolean') {
      return NextResponse.json(
        { error: 'autoPost must be a boolean value' },
        { status: 400 }
      );
    }

    // Check if user has a connected Bluesky account
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        blueskyEncryptedToken: true,
        blueskyTokenExpiry: true,
      },
    });

    if (!userData?.blueskyEncryptedToken) {
      return NextResponse.json(
        { error: 'No Bluesky account connected' },
        { status: 400 }
      );
    }

    // Check if token is valid
    const isTokenValid = userData.blueskyTokenExpiry 
      ? new Date(userData.blueskyTokenExpiry) > new Date()
      : false;

    if (!isTokenValid) {
      return NextResponse.json(
        { error: 'Bluesky connection expired. Please reconnect your account.' },
        { status: 400 }
      );
    }

    // Update autoPost setting
    await prisma.user.update({
      where: { id: user.id },
      data: {
        blueskyAutoPost: autoPost,
      },
    });

    console.log(`[BLUESKY AUTO-POST] User ${user.id} ${autoPost ? 'enabled' : 'disabled'} auto-posting`);

    return NextResponse.json({
      success: true,
      message: autoPost ? 'Auto-posting enabled' : 'Auto-posting disabled',
      autoPost,
    });

  } catch (error: any) {
    console.error('[BLUESKY AUTO-POST] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to update auto-post setting'
      },
      { status: 500 }
    );
  }
}
