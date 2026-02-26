
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/profile/remove-avatar
 * 
 * Removes the user's avatar and generates a default one based on their user ID.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        avatarStyle: true,
        useAvatar: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has an avatar to remove
    if (!user.useAvatar || !user.avatarStyle) {
      return NextResponse.json({ error: 'No avatar to remove' }, { status: 400 });
    }

    // Update the user record - reset avatar to default
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarStyle: 'bottts', // Default style
        avatarSeed: user.id,   // Use user ID as seed for consistency
        useAvatar: true,       // Keep using avatar system
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        bio: true,
        profileImage: true,
        useAvatar: true,
        avatarStyle: true,
        avatarSeed: true,
        politicalLeaning: true,
        civilityScore: true,
        joinedAt: true,
        username: true,
      },
    });

    console.log(`[REMOVE AVATAR] Avatar reset to default for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('[REMOVE AVATAR] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'Failed to remove avatar',
      },
      { status: 500 }
    );
  }
}
