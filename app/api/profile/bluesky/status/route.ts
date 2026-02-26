
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * GET /api/profile/bluesky/status
 * 
 * Returns the current Bluesky connection status for the authenticated user.
 * Does not expose the encrypted token, only metadata about the connection.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        atprotoHandle: true,
        atprotoDid: true,
        blueskyConnectedAt: true,
        blueskyTokenExpiry: true,
        blueskyAutoPost: true,
        blueskyEncryptedToken: true, // Only to check if exists, not exposed in response
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isConnected = !!userData.blueskyEncryptedToken;
    const isTokenValid = userData.blueskyTokenExpiry 
      ? new Date(userData.blueskyTokenExpiry) > new Date()
      : false;

    return NextResponse.json({
      isConnected,
      isTokenValid,
      handle: userData.atprotoHandle || null,
      did: userData.atprotoDid || null,
      connectedAt: userData.blueskyConnectedAt || null,
      tokenExpiry: userData.blueskyTokenExpiry || null,
      autoPost: userData.blueskyAutoPost,
      needsReconnect: isConnected && !isTokenValid,
    });

  } catch (error: any) {
    console.error('[BLUESKY STATUS] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to fetch Bluesky status'
      },
      { status: 500 }
      );
  }
}
