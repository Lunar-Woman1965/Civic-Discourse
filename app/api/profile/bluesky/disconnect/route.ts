
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * POST /api/profile/bluesky/disconnect
 * 
 * Disconnects a user's Bluesky account by removing their stored access token.
 * The user will need to reconnect and re-enter their app password to broadcast again.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[BLUESKY DISCONNECT] User ${user.email} disconnecting Bluesky account`);

    // Remove encrypted token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        blueskyEncryptedToken: null,
        blueskyTokenExpiry: null,
        blueskyAutoPost: false, // Disable auto-posting on disconnect
      },
    });

    console.log(`[BLUESKY DISCONNECT] Token removed successfully for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Bluesky account disconnected successfully',
    });

  } catch (error: any) {
    console.error('[BLUESKY DISCONNECT] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to disconnect Bluesky account'
      },
      { status: 500 }
    );
  }
}
