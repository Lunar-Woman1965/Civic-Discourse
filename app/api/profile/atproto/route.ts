
/**
 * AT Protocol Account Linking API
 * Phase 1: Foundation & Identity
 * 
 * Endpoints for linking/unlinking Bluesky accounts to BtA user profiles
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import {
  resolveHandleToDid,
  verifyDidHandleMatch,
  normalizeHandle,
  isValidAtprotoHandle,
  extractHandle,
} from '@/lib/atproto-identity';

/**
 * GET /api/profile/atproto
 * Get current user's AT Protocol link status
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        atprotoHandle: true,
        atprotoDid: true,
        atprotoEmail: true,
        atprotoLinkedAt: true,
        atprotoBroadcastEnabled: true,
        atprotoAutoBroadcast: true,
        atprotoSyncReactions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      linked: !!(user.atprotoHandle && user.atprotoDid),
      handle: user.atprotoHandle,
      did: user.atprotoDid,
      email: user.atprotoEmail,
      linkedAt: user.atprotoLinkedAt,
      broadcastEnabled: user.atprotoBroadcastEnabled,
      autoBroadcast: user.atprotoAutoBroadcast,
      syncReactions: user.atprotoSyncReactions,
    });
  } catch (error: any) {
    console.error('Error fetching AT Protocol status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/atproto
 * Link Bluesky account to BtA profile
 */
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { handle: rawHandle } = body;

    if (!rawHandle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    // Extract and normalize handle
    const extractedHandle = extractHandle(rawHandle);
    
    if (!extractedHandle || !isValidAtprotoHandle(extractedHandle)) {
      return NextResponse.json(
        { error: 'Invalid Bluesky handle format. Use format: user.bsky.social' },
        { status: 400 }
      );
    }

    // Check if handle is already linked to another account
    const existingLink = await prisma.user.findFirst({
      where: {
        atprotoHandle: extractedHandle,
        id: { not: currentUser.id },
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'This Bluesky account is already linked to another user' },
        { status: 409 }
      );
    }

    // Resolve handle to DID and verify account exists
    const resolution = await resolveHandleToDid(extractedHandle);

    if (!resolution.success || !resolution.did) {
      return NextResponse.json(
        { error: resolution.error || 'Could not verify Bluesky account' },
        { status: 400 }
      );
    }

    // Check if DID is already linked to another account
    const existingDidLink = await prisma.user.findFirst({
      where: {
        atprotoDid: resolution.did,
        id: { not: currentUser.id },
      },
    });

    if (existingDidLink) {
      return NextResponse.json(
        { error: 'This Bluesky account is already linked to another user' },
        { status: 409 }
      );
    }

    // Update user with AT Protocol credentials
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        atprotoHandle: extractedHandle,
        atprotoDid: resolution.did,
        atprotoLinkedAt: new Date(),
      },
      select: {
        atprotoHandle: true,
        atprotoDid: true,
        atprotoLinkedAt: true,
        atprotoBroadcastEnabled: true,
      },
    });

    console.log(`User ${currentUser.email} linked Bluesky account: ${extractedHandle}`);

    return NextResponse.json({
      success: true,
      message: 'Bluesky account linked successfully',
      handle: updatedUser.atprotoHandle,
      did: updatedUser.atprotoDid,
      linkedAt: updatedUser.atprotoLinkedAt,
      displayName: resolution.displayName,
    });
  } catch (error: any) {
    console.error('Error linking AT Protocol account:', error);
    return NextResponse.json(
      { error: 'Failed to link Bluesky account' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/atproto
 * Unlink Bluesky account from BtA profile
 */
export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear AT Protocol credentials
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        atprotoHandle: null,
        atprotoDid: null,
        atprotoLinkedAt: null,
        atprotoBroadcastEnabled: false,
      },
    });

    console.log(`User ${currentUser.email} unlinked Bluesky account`);

    return NextResponse.json({
      success: true,
      message: 'Bluesky account unlinked successfully',
    });
  } catch (error: any) {
    console.error('Error unlinking AT Protocol account:', error);
    return NextResponse.json(
      { error: 'Failed to unlink Bluesky account' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/atproto
 * Update AT Protocol broadcast and engagement settings (Phase 4)
 */
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { broadcastEnabled, autoBroadcast, syncReactions, email } = body;

    // Validate input - at least one setting must be provided
    if (
      typeof broadcastEnabled !== 'boolean' &&
      typeof autoBroadcast !== 'boolean' &&
      typeof syncReactions !== 'boolean' &&
      typeof email !== 'string'
    ) {
      return NextResponse.json(
        { error: 'At least one setting must be provided' },
        { status: 400 }
      );
    }

    // Verify user has linked account before enabling any features
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        atprotoHandle: true,
        atprotoDid: true,
        atprotoBroadcastEnabled: true,
      },
    });

    if (!user?.atprotoHandle || !user?.atprotoDid) {
      return NextResponse.json(
        { error: 'Must link Bluesky account before enabling features' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (typeof broadcastEnabled === 'boolean') {
      updateData.atprotoBroadcastEnabled = broadcastEnabled;
      // If disabling broadcast, also disable auto-broadcast
      if (!broadcastEnabled) {
        updateData.atprotoAutoBroadcast = false;
      }
    }

    if (typeof autoBroadcast === 'boolean') {
      // Auto-broadcast requires broadcast to be enabled
      if (autoBroadcast && !user.atprotoBroadcastEnabled) {
        return NextResponse.json(
          { error: 'Must enable manual broadcasting before enabling automatic broadcasting' },
          { status: 400 }
        );
      }
      updateData.atprotoAutoBroadcast = autoBroadcast;
    }

    if (typeof syncReactions === 'boolean') {
      updateData.atprotoSyncReactions = syncReactions;
    }

    if (typeof email === 'string' && email.trim()) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      updateData.atprotoEmail = email.trim();
    }

    // Update settings
    await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    // Log the changes
    const changes = Object.keys(updateData).map(key => `${key}=${updateData[key]}`).join(', ');
    console.log(`User ${currentUser.email} updated AT Protocol settings: ${changes}`);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      ...updateData,
    });
  } catch (error: any) {
    console.error('Error updating AT Protocol settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
