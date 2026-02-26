
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { BskyAgent } from '@atproto/api';
import { encryptToken } from '@/lib/bluesky-token-encryption';
import { resolveHandleToDid, normalizeHandle } from '@/lib/atproto-identity';

/**
 * POST /api/profile/bluesky/connect
 * 
 * Connects a user's Bluesky account by validating their app password
 * and storing an encrypted access token for future use.
 * 
 * This eliminates the need to re-enter passwords for each broadcast.
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

    const body = await request.json();
    const { identifier, appPassword } = body;

    // Validation
    if (!identifier || !appPassword) {
      return NextResponse.json(
        { error: 'Bluesky identifier and app password are required' },
        { status: 400 }
      );
    }

    // Validate app password format (xxxx-xxxx-xxxx-xxxx)
    const appPasswordRegex = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/;
    if (!appPasswordRegex.test(appPassword)) {
      return NextResponse.json(
        { 
          error: 'Invalid app password format',
          message: 'App password must be in format: xxxx-xxxx-xxxx-xxxx'
        },
        { status: 400 }
      );
    }

    // Step 1: Authenticate with Bluesky
    console.log(`[BLUESKY CONNECT] User ${user.email} attempting to connect with identifier: ${identifier}`);
    
    const agent = new BskyAgent({ service: 'https://bsky.social' });
    
    let loginResult;
    try {
      loginResult = await agent.login({
        identifier,
        password: appPassword,
      });
    } catch (authError: any) {
      console.error('[BLUESKY CONNECT] Authentication failed:', authError);
      
      // Provide specific error messages
      if (authError.message?.includes('Invalid identifier or password')) {
        return NextResponse.json(
          { 
            error: 'Authentication failed',
            message: 'Invalid Bluesky identifier or app password. Please check your credentials and try again.'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Bluesky authentication failed',
          message: authError.message || 'Could not authenticate with Bluesky. Please verify your credentials.'
        },
        { status: 401 }
      );
    }

    // Step 2: Resolve handle to DID
    const normalizedHandle = normalizeHandle(loginResult.data.handle);
    const did = loginResult.data.did;

    console.log(`[BLUESKY CONNECT] Successfully authenticated as @${normalizedHandle} (${did})`);

    // Step 3: Encrypt and store BOTH access and refresh tokens
    const accessToken = loginResult.data.accessJwt;
    const refreshToken = loginResult.data.refreshJwt;
    const encryptedAccessToken = encryptToken(accessToken);
    const encryptedRefreshToken = encryptToken(refreshToken);

    console.log(`[BLUESKY CONNECT] Access and refresh tokens encrypted successfully`);

    // Step 4: Calculate token expiry (Bluesky access tokens expire in 2 hours, refresh in ~90 days)
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 2);

    // Step 5: Update user record with encrypted tokens and Bluesky identity
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        blueskyEncryptedToken: encryptedAccessToken,
        blueskyEncryptedRefreshToken: encryptedRefreshToken,
        blueskyTokenExpiry: tokenExpiry,
        blueskyConnectedAt: user.blueskyConnectedAt || new Date(), // Only set if not already set
        atprotoHandle: normalizedHandle,
        atprotoDid: did,
        atprotoLinkedAt: user.atprotoLinkedAt || new Date(),
      },
      select: {
        id: true,
        atprotoHandle: true,
        atprotoDid: true,
        blueskyConnectedAt: true,
        blueskyAutoPost: true,
      },
    });

    console.log(`[BLUESKY CONNECT] Token stored successfully for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Bluesky account connected successfully',
      user: {
        handle: updatedUser.atprotoHandle,
        did: updatedUser.atprotoDid,
        connectedAt: updatedUser.blueskyConnectedAt,
        autoPost: updatedUser.blueskyAutoPost,
      },
    });

  } catch (error: any) {
    console.error('[BLUESKY CONNECT] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to connect Bluesky account'
      },
      { status: 500 }
    );
  }
}
