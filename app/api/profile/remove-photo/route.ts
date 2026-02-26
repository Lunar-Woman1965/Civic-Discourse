
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { deleteFile } from '@/lib/s3';

/**
 * POST /api/profile/remove-photo
 * 
 * Removes the user's uploaded profile photo and sets the profile back to using an avatar.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user's profile image
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        profileImage: true,
        avatarStyle: true,
        avatarSeed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a photo to remove
    if (!user.profileImage) {
      return NextResponse.json({ error: 'No photo to remove' }, { status: 400 });
    }

    // Delete the photo from S3
    try {
      await deleteFile(user.profileImage);
    } catch (error) {
      console.error('Error deleting photo from S3:', error);
      // Continue anyway - we'll still remove the reference from the database
    }

    // Update the user record - remove photo and enable avatar usage
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: null,
        useAvatar: true, // Switch back to avatar
        // If they don't have an avatar set, generate a default one
        avatarStyle: user.avatarStyle || 'bottts',
        avatarSeed: user.avatarSeed || user.id,
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

    console.log(`[REMOVE PHOTO] Photo removed for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Profile photo removed successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('[REMOVE PHOTO] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'Failed to remove profile photo',
      },
      { status: 500 }
    );
  }
}
